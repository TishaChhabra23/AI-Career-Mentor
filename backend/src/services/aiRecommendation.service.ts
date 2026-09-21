import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { Recommendation } from '../models/Recommendation';
import { AssessmentResult } from '../models/AssessmentResult';
import { UserAICredential } from '../models/UserAICredential';
import { buildSanitizedUserContext, UserContext } from './aiContext.service';
import { callGeminiAPI } from './gemini.service';
import { decryptKey } from '../utils/crypto';

// Prompt Builders
import { getStreamRecommendationPrompt } from '../prompts/streamRecommendation.prompt';
import { getDegreeRecommendationPrompt } from '../prompts/degreeRecommendation.prompt';
import { getCareerRecommendationPrompt } from '../prompts/careerRecommendation.prompt';
import { getSkillGapPrompt } from '../prompts/skillGap.prompt';
import { getCareerRoadmapPrompt } from '../prompts/careerRoadmap.prompt';
import { getLearningRoadmapPrompt } from '../prompts/learningRoadmap.prompt';

// Zod validation schemas
import { streamRecommendationSchema } from '../validators/ai/streamRecommendation.schema';
import { degreeRecommendationSchema } from '../validators/ai/degreeRecommendation.schema';
import { careerRecommendationSchema } from '../validators/ai/careerRecommendation.schema';
import { skillGapSchema } from '../validators/ai/skillGap.schema';
import { careerRoadmapSchema } from '../validators/ai/careerRoadmap.schema';
import { learningRoadmapSchema } from '../validators/ai/learningRoadmap.schema';

export type RecommendationType = 
  | 'stream_recommendation'
  | 'degree_recommendation'
  | 'career_recommendation'
  | 'skill_gap_analysis'
  | 'career_roadmap'
  | 'learning_roadmap';

// Mapping helper for prompt builders, validators, and versions
const configByType = {
  stream_recommendation: {
    promptBuilder: getStreamRecommendationPrompt,
    schema: streamRecommendationSchema,
    promptVersion: 'stream-v1',
    allowedLevels: ['Class11']
  },
  degree_recommendation: {
    promptBuilder: getDegreeRecommendationPrompt,
    schema: degreeRecommendationSchema,
    promptVersion: 'degree-v1',
    allowedLevels: ['Class12']
  },
  career_recommendation: {
    promptBuilder: getCareerRecommendationPrompt,
    schema: careerRecommendationSchema,
    promptVersion: 'career-v1',
    allowedLevels: ['UG', 'PG']
  },
  skill_gap_analysis: {
    promptBuilder: getSkillGapPrompt,
    schema: skillGapSchema,
    promptVersion: 'skillgap-v1',
    allowedObjectives: ['find_internship', 'find_job']
  },
  career_roadmap: {
    promptBuilder: getCareerRoadmapPrompt,
    schema: careerRoadmapSchema,
    promptVersion: 'roadmap-v1',
    allowedLevels: ['Class11', 'Class12', 'Diploma', 'UG', 'PG']
  },
  learning_roadmap: {
    promptBuilder: getLearningRoadmapPrompt,
    schema: learningRoadmapSchema,
    promptVersion: 'learning-v1',
    allowedLevels: ['Class11', 'Class12', 'Diploma', 'UG', 'PG']
  }
};

export const generateRecommendation = async (
  userId: string,
  type: RecommendationType,
  forceRegenerate: boolean = false
) => {
  const cfg = configByType[type];
  if (!cfg) {
    throw new AppError('Invalid recommendation type requested.', 400);
  }

  // Load user context allowlist sanitised
  const context = await buildSanitizedUserContext(userId);

  // 1. Eligibility Checks (Enforce Server-side)
  if (!context.educationLevel) {
    throw new AppError('Please complete your Education details first.', 403);
  }

  if ((cfg as any).allowedLevels && !(cfg as any).allowedLevels.includes(context.educationLevel)) {
    throw new AppError(`This recommendation type is not available for your education level (${context.educationLevel}).`, 403);
  }
  if ((cfg as any).allowedObjectives && context.careerObjective && !(cfg as any).allowedObjectives.includes(context.careerObjective)) {
    throw new AppError(`This recommendation type requires one of the following career objectives: ${(cfg as any).allowedObjectives.join(', ')}.`, 403);
  }

  // Authoritative check: User must have completed their diagnostic test (except Class 10 which is not applicable)
  if (context.educationLevel !== 'Class10' && !context.assessment) {
    throw new AppError('Please complete your career diagnostic assessment first.', 403);
  }

  // Enforce primary recommendation dependency for roadmaps
  if (type === 'career_roadmap' || type === 'learning_roadmap') {
    let primaryType: RecommendationType | null = null;
    if (context.educationLevel === 'Class11') {
      primaryType = 'stream_recommendation';
    } else if (context.educationLevel === 'Class12') {
      primaryType = 'degree_recommendation';
    } else if (context.educationLevel === 'Diploma' || context.educationLevel === 'UG' || context.educationLevel === 'PG') {
      if (context.careerObjective === 'find_internship' || context.careerObjective === 'find_job') {
        primaryType = 'skill_gap_analysis';
      } else {
        primaryType = 'career_recommendation';
      }
    }

    if (primaryType) {
      const hasPrimary = await Recommendation.findOne({ userId, type: primaryType }).lean();
      if (!hasPrimary) {
        throw new AppError('Please generate your career recommendation first.', 403);
      }
    }
  }

  // Get active assessment info from context details
  let sourceId = undefined;
  let sourceVer = undefined;

  const resultDoc = await AssessmentResult.findOne({ userId }).sort({ completedAt: -1 }).lean();
  if (resultDoc) {
    sourceId = resultDoc.assessmentId;
    sourceVer = resultDoc.assessmentVersion;
  }

  const aiModel = env.GEMINI_MODEL;
  const promptVersion = cfg.promptVersion;

  // 2. Context hash generation
  const hashInput = JSON.stringify(context) + aiModel + promptVersion;
  const inputContextHash = crypto.createHash('md5').update(hashInput).digest('hex');

  // 3. Cache Validation
  if (!forceRegenerate) {
    const cached = await Recommendation.findOne({
      userId,
      type,
      inputContextHash
    }).sort({ createdAt: -1 }).lean();

    if (cached) {
      return cached;
    }
  }

  // 4. BYOK Credential Resolution — Load and decrypt user's Gemini key (or fallback to server env key)
  const credential = await UserAICredential.findOne({ userId, provider: 'google_gemini' }).lean();
  let decryptedApiKey = '';

  if (credential) {
    decryptedApiKey = decryptKey(credential.encryptedApiKey);
  } else if (env.GEMINI_API_KEY) {
    decryptedApiKey = env.GEMINI_API_KEY;
  } else {
    const err = new AppError('Gemini AI is not connected. Please add your Google AI Studio API key in Settings.', 403);
    (err as any).code = 'GEMINI_KEY_NOT_CONFIGURED';
    throw err;
  }

  // 5. Prompt Preparation
  const prompt = cfg.promptBuilder(context);

  // 6. Invoke Gemini with structured schemas using user's key
  const rawResponse = await callGeminiAPI({
    prompt,
    schema: cfg.schema,
    apiKey: decryptedApiKey
  });

  // 7. Zod Schema Parsing & Validation (Double-enforced backend side)
  const validationResult = cfg.schema.safeParse(rawResponse);
  if (!validationResult.success) {
    console.error('[AI Recommendation Validation Error] Zod Errors:', JSON.stringify(validationResult.error.format(), null, 2));
    console.error('[AI Recommendation Validation Error] Raw Response:', JSON.stringify(rawResponse, null, 2));
    throw new AppError('AI response format validation failed against application schema.', 502);
  }

  const validatedData = validationResult.data;

  // 8. Business-Rule Validations
  validateBusinessRules(type, validatedData);

  // 9. DB Persistence
  const recDoc = await Recommendation.create({
    userId,
    type,
    sourceAssessmentId: sourceId,
    sourceAssessmentVersion: sourceVer,
    inputContextHash,
    aiModel,
    promptVersion,
    result: validatedData
  });

  return recDoc;
};

// Application-level business rules validation checks
const validateBusinessRules = (type: RecommendationType, data: any) => {
  if (type === 'stream_recommendation' || type === 'degree_recommendation' || type === 'career_recommendation') {
    for (const item of data.recommendations || []) {
      if (typeof item.fitScore !== 'number' || item.fitScore < 0 || item.fitScore > 100) {
        throw new AppError('AI output business validation failed: fitScore must be between 0 and 100.', 502);
      }
    }
  }

  if (type === 'skill_gap_analysis') {
    for (const item of data.missingSkills || []) {
      if (!['high', 'medium', 'low'].includes(item.priority)) {
        throw new AppError('AI output business validation failed: missing skill priority must be high, medium, or low.', 502);
      }
    }
  }

  if (type === 'learning_roadmap') {
    for (const item of data.learningGoals || []) {
      if (!['high', 'medium', 'low'].includes(item.priority)) {
        throw new AppError('AI output business validation failed: learning goal priority must be high, medium, or low.', 502);
      }
    }
  }
};
