import { EducationDetails } from '../models/EducationDetails';
import { StudentProfile } from '../models/StudentProfile';
import { AssessmentResult } from '../models/AssessmentResult';

export interface UserContext {
  educationLevel?: string;
  stream?: string;
  course?: string;
  careerObjective?: string;
  interests?: string[];
  favoriteSubjects?: string[];
  strengths?: string[];
  hobbies?: string[];
  skills?: string[];
  projects?: string[];
  assessment?: {
    overallScore: number;
    sectionScores: Record<string, number>;
    assessmentType: string;
  };
}

export const buildSanitizedUserContext = async (
  userId: string,
  assessmentResultId?: string
): Promise<UserContext> => {
  const education = await EducationDetails.findOne({ userId }).lean();
  const profile = await StudentProfile.findOne({ userId }).lean();

  let assessmentInfo: UserContext['assessment'] = undefined;

  // Query assessment result if provided, or fall back to the user's latest completed assessment
  let resultDoc = null;
  if (assessmentResultId) {
    resultDoc = await AssessmentResult.findById(assessmentResultId)
      .populate({ path: 'assessmentId', select: 'type' })
      .lean();
  } else {
    resultDoc = await AssessmentResult.findOne({ userId })
      .sort({ completedAt: -1 })
      .populate({ path: 'assessmentId', select: 'type' })
      .lean();
  }

  if (resultDoc) {
    // Map sectionScores from Map/Object to a simple key-value record
    const scores: Record<string, number> = {};
    const sectionScoresRaw = resultDoc.sectionScores as any;
    if (sectionScoresRaw) {
      if (typeof sectionScoresRaw.forEach === 'function') {
        sectionScoresRaw.forEach((val: number, key: string) => {
          scores[key] = val;
        });
      } else if (sectionScoresRaw instanceof Map) {
        for (const [key, val] of sectionScoresRaw.entries()) {
          scores[key] = val;
        }
      } else {
        const obj = sectionScoresRaw;
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            scores[key] = obj[key];
          }
        }
      }
    }

    assessmentInfo = {
      overallScore: resultDoc.overallScore,
      sectionScores: scores,
      assessmentType: (resultDoc.assessmentId as any)?.type || 'unknown'
    };
  }

  // Allowlist only sanitized parameters, completely redacting names, emails, phones, and hashes
  const context: UserContext = {
    educationLevel: education?.educationLevel,
    stream: education?.stream,
    course: education?.course,
    careerObjective: profile?.careerObjective,
    interests: profile?.interests,
    favoriteSubjects: profile?.favoriteSubjects,
    strengths: profile?.strengths,
    hobbies: profile?.hobbies,
    skills: profile?.skills,
    projects: profile?.projects || [],
    assessment: assessmentInfo
  };

  return context;
};
