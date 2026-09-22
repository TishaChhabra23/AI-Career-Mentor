import { api } from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: 'student' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token?: string;
  };
}

export interface GenericResponse {
  success: boolean;
  message: string;
}

export const registerApi = async (data: Record<string, string>): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginApi = async (data: Record<string, string>): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const logoutApi = async (): Promise<GenericResponse> => {
  const response = await api.post<GenericResponse>('/auth/logout');
  return response.data;
};

export const getMeApi = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>('/auth/me');
  return response.data;
};

export const updateMeApi = async (data: { fullName: string; mobileNumber: string }): Promise<AuthResponse> => {
  const response = await api.put<AuthResponse>('/auth/me', data);
  return response.data;
};

export const forgotPasswordApi = async (email: string): Promise<GenericResponse> => {
  const response = await api.post<GenericResponse>('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (data: Record<string, string>): Promise<GenericResponse> => {
  const response = await api.post<GenericResponse>('/auth/reset-password', data);
  return response.data;
};

export const deleteAccountApi = async (): Promise<GenericResponse> => {
  const response = await api.delete<GenericResponse>('/auth/account');
  return response.data;
};

export const getEducationApi = async (): Promise<any> => {
  const response = await api.get('/education');
  return response.data;
};

export const saveEducationApi = async (data: any): Promise<any> => {
  const response = await api.post('/education', data);
  return response.data;
};

export const getProfileApi = async (): Promise<any> => {
  const response = await api.get('/profile');
  return response.data;
};

export const saveProfileApi = async (data: any): Promise<any> => {
  const response = await api.post('/profile', data);
  return response.data;
};

export const getDashboardSummaryApi = async (): Promise<any> => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

// Assessment APIs
export const getAvailableAssessmentApi = async (): Promise<any> => {
  const response = await api.get('/assessments/available');
  return response.data;
};

export const startAssessmentApi = async (assessmentId: string): Promise<any> => {
  const response = await api.post('/assessments/start', { assessmentId });
  return response.data;
};

export const getAttemptApi = async (attemptId: string): Promise<any> => {
  const response = await api.get(`/assessments/attempts/${attemptId}`);
  return response.data;
};

export const saveProgressApi = async (attemptId: string, data: any): Promise<any> => {
  const response = await api.patch(`/assessments/attempts/${attemptId}/progress`, data);
  return response.data;
};

export const submitAssessmentApi = async (attemptId: string, data?: any): Promise<any> => {
  const response = await api.post(`/assessments/attempts/${attemptId}/submit`, data || {});
  return response.data;
};

export const getResultsHistoryApi = async (): Promise<any> => {
  const response = await api.get('/assessments/history');
  return response.data;
};

export const getResultApi = async (resultId: string): Promise<any> => {
  const response = await api.get(`/assessments/results/${resultId}`);
  return response.data;
};

// AI & Recommendations APIs
export const getAIRecommendationByTypeApi = async (type: string): Promise<any> => {
  const response = await api.get(`/recommendations/${type}`);
  return response.data;
};

export const generateAIRecommendationApi = async (type: string): Promise<any> => {
  const response = await api.post('/recommendations/generate', { type });
  return response.data;
};

export const regenerateAIRecommendationApi = async (type: string): Promise<any> => {
  const response = await api.post('/recommendations/regenerate', { type });
  return response.data;
};

// Resumes APIs
export const createResumeApi = async (data: any): Promise<any> => {
  const response = await api.post('/resumes', data);
  return response.data;
};

export const listResumesApi = async (): Promise<any> => {
  const response = await api.get('/resumes');
  return response.data;
};

export const getResumeApi = async (id: string): Promise<any> => {
  const response = await api.get(`/resumes/${id}`);
  return response.data;
};

export const updateResumeApi = async (id: string, data: any): Promise<any> => {
  const response = await api.patch(`/resumes/${id}`, data);
  return response.data;
};

export const deleteResumeApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/resumes/${id}`);
  return response.data;
};

export const exportResumeApi = async (id: string): Promise<any> => {
  const response = await api.post(`/resumes/${id}/export`);
  return response.data;
};

// ==========================================
// SETTINGS / AI CREDENTIAL MANAGEMENT
// ==========================================

export const getAISettingsApi = async (): Promise<any> => {
  const response = await api.get('/settings/ai');
  return response.data;
};

export const saveGeminiKeyApi = async (apiKey: string): Promise<any> => {
  const response = await api.post('/settings/ai/gemini', { apiKey });
  return response.data;
};

export const removeGeminiKeyApi = async (): Promise<any> => {
  const response = await api.delete('/settings/ai/gemini');
  return response.data;
};
