import { User } from '../models/User';
import { EducationDetails } from '../models/EducationDetails';
import { StudentProfile } from '../models/StudentProfile';
import { AssessmentProgress } from '../models/AssessmentProgress';
import { AssessmentResult } from '../models/AssessmentResult';
import { Recommendation } from '../models/Recommendation';
import { UserResume } from '../models/UserResume';
import { getProfileCompletion } from './profile.service';
import { AppError } from '../middleware/errorHandler';

interface JourneyStep {
  name: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
}

const getObjectiveLabel = (val: string | undefined): string => {
  switch (val) {
    case 'explore_stream': return 'Explore Streams';
    case 'explore_degree': return 'Explore Degree Options';
    case 'explore_career': return 'Explore Careers';
    case 'find_internship': return 'Find Internship';
    case 'find_job': return 'Find Job';
    case 'higher_studies': return 'Higher Studies';
    default: return 'Explore Pathways';
  }
};

export const getDashboardSummaryData = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const education = await EducationDetails.findOne({ userId });
  const profile = await StudentProfile.findOne({ userId });

  // Calculate completion percentage
  const metrics = getProfileCompletion(profile, education);
  const completionPercent = metrics.completionPercentage;
  const isProfileComplete = completionPercent === 100;

  // Assessment status lookup
  let assessmentData: { status: string; overallScore?: number; completedAt?: string } = { status: 'not_started' };
  const latestResult = await AssessmentResult.findOne({ userId }).sort({ completedAt: -1 }).lean();
  if (latestResult) {
    assessmentData = {
      status: 'completed',
      overallScore: latestResult.overallScore,
      completedAt: latestResult.completedAt?.toISOString(),
    };
  } else {
    const latestProgress = await AssessmentProgress.findOne({ userId, status: 'in_progress' }).lean();
    if (latestProgress) {
      assessmentData = { status: 'in_progress' };
    }
  }

  // Check if user has generated recommendations
  const latestRec = await Recommendation.findOne({ userId }).lean();

  // 1. Next Step Engine (Deterministic logic)
  let nextStep = {
    title: 'Complete your student profile',
    description: 'Finish your profile details to unlock personalized career guidance.',
    actionText: 'Complete Profile',
    actionLink: '/profile',
  };

  if (isProfileComplete && education && profile) {
    const level = education.educationLevel;
    const obj = profile.careerObjective;

    if (level === 'Class10') {
      nextStep = {
        title: 'Discover your stream options',
        description: 'Explore optimal science, commerce, or arts tracks matching your interests.',
        actionText: 'View Roadmaps',
        actionLink: '/roadmap',
      };
    } else if (assessmentData.status !== 'completed') {
      nextStep = {
        title: 'Complete your assessment first',
        description: 'Take the career diagnostic test to unlock personalized insights.',
        actionText: 'Take Assessment',
        actionLink: '/assessment',
      };
    } else if (!latestRec) {
      nextStep = {
        title: 'Get your personalized career insight',
        description: 'Generate Gemini recommendations based on your assessment results.',
        actionText: 'Get Recommendations',
        actionLink: '/recommendations',
      };
    } else {
      const resume = await UserResume.findOne({ userId });
      if (!resume) {
        nextStep = {
          title: 'Create your resume',
          description: 'Build your professional resume snapshot prefilled from your assessment profile.',
          actionText: 'Create Resume',
          actionLink: '/resume',
        };
      } else {
        nextStep = {
          title: 'Continue editing your resume',
          description: 'Update and export your saved resume templates.',
          actionText: 'Manage Resume',
          actionLink: '/resume',
        };
      }
    }
  }

  // 2. Career Journey Steps
  const level = education?.educationLevel || 'UG';
  const obj = profile?.careerObjective || 'find_internship';

  const assessmentJourneyStatus: JourneyStep['status'] =
    assessmentData.status === 'completed' ? 'completed' :
    assessmentData.status === 'in_progress' ? 'current' :
    (education && isProfileComplete ? 'current' : (education ? 'upcoming' : 'locked'));
  
  const journeySteps: JourneyStep[] = [
    { name: 'Education', status: education ? 'completed' : 'current' },
    { name: 'Assessment', status: assessmentJourneyStatus },
    { name: 'Career Direction', status: assessmentData.status === 'completed' ? 'current' : 'upcoming' },
    { name: 'Skill Development', status: 'locked' },
  ];

  if (obj === 'find_internship') {
    journeySteps.push({ name: 'Internship', status: 'locked' });
  } else if (obj === 'find_job') {
    journeySteps.push({ name: 'Employment', status: 'locked' });
  } else {
    journeySteps.push({ name: 'Higher Studies', status: 'locked' });
  }

  // 3. Dynamic Quick Actions
  const quickActions = [];
  if (!education) {
    quickActions.push({ name: 'Configure Education', description: 'Enter academic details', link: '/education' });
  } else if (!isProfileComplete) {
    quickActions.push({ name: 'Complete Profile', description: 'Enter details to hit 100%', link: '/profile' });
  } else {
    if (assessmentData.status === 'completed') {
      quickActions.push({ name: 'View Results', description: 'Check assessment scores', link: '/assessment/history' });
    } else if (assessmentData.status === 'in_progress') {
      quickActions.push({ name: 'Continue Assessment', description: 'Resume your test', link: '/assessment' });
    } else {
      quickActions.push({ name: 'Take Assessment', description: 'Start diagnostic test', link: '/assessment' });
    }
    quickActions.push({ name: 'View roadmaps', description: 'Explore stream guides', link: '/roadmap' });
  }
  quickActions.push({ name: 'Manage Account', description: 'Update profile settings', link: '/settings' });

  // 4. Activity Logs (Real events)
  const activityLogs = [];
  if (user.createdAt) {
    activityLogs.push({ type: 'System', text: 'Account registered', time: 'Recently' });
  }
  if (education) {
    activityLogs.push({ type: 'Profile', text: `Education Level set to ${education.educationLevel}`, time: 'Recently' });
  }
  if (profile) {
    activityLogs.push({ type: 'Profile', text: `Career objective selected: ${getObjectiveLabel(profile.careerObjective)}`, time: 'Recently' });
    if (profile.updatedAt) {
      activityLogs.push({ type: 'Profile', text: `Profile updated (Completeness: ${completionPercent}%)`, time: 'Recently' });
    }
  }
  if (assessmentData.status === 'completed') {
    activityLogs.push({ type: 'Assessment', text: `Assessment completed (Score: ${assessmentData.overallScore})`, time: 'Recently' });
  } else if (assessmentData.status === 'in_progress') {
    activityLogs.push({ type: 'Assessment', text: 'Assessment in progress', time: 'Recently' });
  }

  return {
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    education: education ? {
      educationLevel: education.educationLevel,
      schoolCollege: education.schoolCollege,
      boardUniversity: education.boardUniversity,
      currentClassSemester: education.currentClassSemester,
      stream: education.stream,
      course: education.course,
      percentageCGPA: education.percentageCGPA,
    } : null,
    careerObjective: profile ? {
      value: profile.careerObjective,
      label: getObjectiveLabel(profile.careerObjective),
    } : null,
    profileCompletion: {
      completionPercentage: completionPercent,
      completedFields: metrics.completedFields,
      remainingFields: metrics.remainingFields,
    },
    nextStep,
    careerJourney: journeySteps,
    assessment: assessmentData,
    activity: activityLogs,
    quickActions,
  };
};
