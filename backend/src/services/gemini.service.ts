import axios from 'axios';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { zodToOpenApi } from '../utils/zodToOpenApi';

interface GeminiRequestConfig {
  prompt: string;
  schema?: any; // Zod schema
  apiKey: string; // Per-user BYOK key (already decrypted in memory)
}

/**
 * Dynamically queries Google AI Studio for model names that support 'generateContent' for the given API key.
 */
export const getAvailableGenerateModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    const models = response.data?.models || [];
    const validModels = models
      .filter((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => m.name.replace(/^models\//, ''))
      .filter((name: string) => 
        name.startsWith('gemini-') && 
        !name.includes('-tts') && 
        !name.includes('-image') && 
        !name.includes('-audio') && 
        !name.includes('computer-use') && 
        !name.includes('transcribe') && 
        !name.includes('er-2') &&
        !name.includes('lyria')
      );

    console.log('[Gemini API] Dynamically discovered generateContent text models:', validModels);
    return validModels;
  } catch (err: any) {
    console.error('[Gemini API] Failed to fetch available models list from Google:', err.response?.data?.error?.message || err.message);
    return [];
  }
};

export const callGeminiAPI = async (config: GeminiRequestConfig): Promise<any> => {
  const { apiKey, prompt, schema } = config;

  if (!apiKey) {
    throw new AppError('Gemini API key was not provided for this request.', 403);
  }

  // 1. Dynamically query Google AI Studio for active generateContent text models for this user's key
  let dynamicModels = await getAvailableGenerateModels(apiKey);

  const preferredDefaults = [
    'gemini-3.6-flash',
    'gemini-3.1-pro-preview',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
    'gemini-flash-latest',
    'gemini-1.5-pro',
    'gemini-3-flash-preview'
  ];

  // Merge preferred defaults with dynamic models, putting active preferred models first
  let candidateModels = Array.from(new Set([...preferredDefaults, ...dynamicModels]));

  // If user configured a specific model in env, prioritize it at very front
  if (env.GEMINI_MODEL) {
    const envModelClean = env.GEMINI_MODEL.replace(/^models\//, '');
    candidateModels = Array.from(new Set([envModelClean, ...candidateModels]));
  }

  let lastError: any = null;

  for (const model of candidateModels) {
    const cleanModel = model.replace(/^models\//, '');
    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;

    const generationConfig: Record<string, any> = {
      responseMimeType: 'application/json'
    };

    if (schema) {
      const openApiSchema = zodToOpenApi(schema);
      if (openApiSchema) {
        generationConfig.responseSchema = openApiSchema;
      }
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig
    };

    try {
      console.log(`[Gemini API] Calling generateContent using dynamic model [${cleanModel}]...`);
      const response = await axios.post(endpointUrl, payload, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new AppError('Empty response received from Gemini API.', 502);
      }

      let cleanText = candidateText.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```[a-zA-Z]*\s*/, '');
        cleanText = cleanText.replace(/\s*```$/, '');
        cleanText = cleanText.trim();
      }

      try {
        const parsed = JSON.parse(cleanText);
        console.log(`[Gemini API] Successfully generated recommendations using model [${cleanModel}]!`);
        return parsed;
      } catch {
        throw new AppError('Failed to parse Gemini response as JSON.', 502);
      }
    } catch (err: any) {
      if (err instanceof AppError && err.statusCode !== 500 && err.statusCode !== 502) {
        throw err;
      }

      const errMsg = err.response?.data?.error?.message || err.message || '';
      console.warn(`[Gemini API] Model [${cleanModel}] attempt failed: ${errMsg}`);
      lastError = err;

      // If invalid API key error, fail fast without trying other models
      if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
        break;
      }
    }
  }

  const status = lastError?.response?.status || 500;
  const errorMsg = lastError?.response?.data?.error?.message || lastError?.message || 'Gemini API call failed across all candidate models';
  console.error('[Gemini API] All model attempts failed. Final error:', lastError?.response?.data || lastError?.message);
  throw new AppError(`Gemini Provider Error: ${errorMsg}`, status);
};

/**
 * Validates a Gemini API key by making a lightweight GET request to Google AI Studio's models endpoint.
 * Returns true if the API key is authentic and active, false otherwise.
 * Completely model-agnostic and generates no AI tokens.
 */
export const validateGeminiKey = async (apiKey: string): Promise<boolean> => {
  const testUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await axios.get(testUrl, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 200 && Array.isArray(response.data?.models)) {
      return true;
    }
    return false;
  } catch (err: any) {
    const errMsg = err.response?.data?.error?.message || err.message;
    console.error('[Gemini API Key Validation Error]:', errMsg);
    return false;
  }
};
