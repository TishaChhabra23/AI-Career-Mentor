import { StudentProfile, IStudentProfile } from '../models/StudentProfile';
import { EducationDetails } from '../models/EducationDetails';
import { AppError } from '../middleware/errorHandler';

// Configuration checklist mappings based on educationLevel and careerObjective
const getProfileFieldsChecklist = (
  level: string | undefined,
  objective: string | undefined
): string[] => {
  if (!level) {
    return ['educationLevel', 'careerObjective'];
  }

  const baseChecklist = ['careerObjective'];

  if (level === 'Class10') {
    return [...baseChecklist, 'interests', 'favoriteSubjects', 'strengths', 'hobbies', 'careerGoal'];
  }

  if (level === 'Class11' || level === 'Class12') {
    return [...baseChecklist, 'interests', 'favoriteSubjects', 'strengths', 'hobbies', 'careerGoal', 'preferredDegree', 'learningStyle'];
  }

  // Diploma, UG, PG levels
  if (objective === 'find_internship' || objective === 'find_job') {
    const list = [...baseChecklist, 'skills', 'projects', 'certifications', 'careerGoal', 'linkedIn', 'github'];
    if (level === 'PG') {
      list.push('experience');
    }
    return list;
  }

  // Fallback / Exploring pathways
  return [...baseChecklist, 'interests', 'skills', 'careerGoal', 'preferredDegree', 'linkedIn'];
};

// Check if a specific profile field is populated
const isFieldPopulated = (profile: any, education: any, field: string): boolean => {
  if (field === 'educationLevel') {
    return !!education?.educationLevel;
  }

  const value = profile?.[field];
  if (value === undefined || value === null) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'number') {
    return true;
  }
  if (typeof value === 'boolean') {
    return true;
  }
  return false;
};

export interface CompletionMetrics {
  completionPercentage: number;
  completedFields: string[];
  remainingFields: string[];
}

export const getProfileCompletion = (
  profile: any,
  education: any
): CompletionMetrics => {
  const level = education?.educationLevel;
  const objective = profile?.careerObjective;

  const checklist = getProfileFieldsChecklist(level, objective);
  const completedFields: string[] = [];
  const remainingFields: string[] = [];

  checklist.forEach((field) => {
    if (isFieldPopulated(profile, education, field)) {
      completedFields.push(field);
    } else {
      remainingFields.push(field);
    }
  });

  const completionPercentage = checklist.length > 0 
    ? Math.round((completedFields.length / checklist.length) * 100)
    : 0;

  return {
    completionPercentage,
    completedFields,
    remainingFields,
  };
};

export const getProfileByUserId = async (
  userId: string
): Promise<{ profile: IStudentProfile | null; metrics: CompletionMetrics }> => {
  const profile = await StudentProfile.findOne({ userId });
  const education = await EducationDetails.findOne({ userId });

  const metrics = getProfileCompletion(profile, education);

  return { profile, metrics };
};

export const createOrUpdateProfile = async (
  userId: string,
  data: Partial<IStudentProfile>
): Promise<{ profile: IStudentProfile; metrics: CompletionMetrics }> => {
  const payload = { ...data, userId };

  // Perform atomic upsert
  const profile = await StudentProfile.findOneAndUpdate(
    { userId },
    payload,
    { new: true, upsert: true, runValidators: true }
  );

  const education = await EducationDetails.findOne({ userId });
  const metrics = getProfileCompletion(profile, education);

  // Sync computed profileCompletion percentage to DB record
  profile.profileCompletion = metrics.completionPercentage;
  await profile.save();

  return { profile, metrics };
};

export const deleteProfileByUserId = async (userId: string): Promise<void> => {
  const result = await StudentProfile.deleteOne({ userId });
  if (result.deletedCount === 0) {
    throw new AppError('No profile details found to delete.', 404);
  }
};
