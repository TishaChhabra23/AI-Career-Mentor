import { Request, Response, NextFunction } from 'express';
import { Assessment } from '../models/Assessment';
import { AssessmentQuestion } from '../models/AssessmentQuestion';
import { AssessmentProgress } from '../models/AssessmentProgress';
import { AssessmentResult } from '../models/AssessmentResult';
import { EducationDetails } from '../models/EducationDetails';
import { StudentProfile } from '../models/StudentProfile';
import { getAssessmentTypeForUser } from '../services/assessmentSelection.service';
import { scoreAssessmentAttempt } from '../services/assessmentScoring.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';

// Helper to check if an attempt's timer has expired
const isAttemptExpired = (startedAt: Date, durationMinutes: number): boolean => {
  const deadline = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
  return Date.now() > deadline.getTime();
};

// Helper to auto-finalize an expired attempt
const autoFinalizeAttempt = async (attempt: any, assessment: any) => {
  // Check if result already exists to prevent duplicate entries
  const existingResult = await AssessmentResult.findOne({ attemptId: attempt._id });
  if (existingResult) {
    attempt.status = 'completed';
    attempt.completedAt = existingResult.completedAt;
    await attempt.save();
    return existingResult;
  }

  const questions = await AssessmentQuestion.find({
    assessmentId: assessment._id,
    assessmentVersion: attempt.assessmentVersion
  });

  const { sectionScores, overallScore } = scoreAssessmentAttempt(questions, attempt.answers);

  const result = await AssessmentResult.create({
    userId: attempt.userId,
    assessmentId: attempt.assessmentId,
    assessmentVersion: attempt.assessmentVersion,
    attemptId: attempt._id,
    sectionScores,
    overallScore,
    completedAt: new Date()
  });

  attempt.status = 'completed';
  attempt.completedAt = new Date();
  await attempt.save();

  return result;
};

// 1. Get Available Assessment metadata & status
export const getAvailableAssessment = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Not authenticated', 401);
  }

  const education = await EducationDetails.findOne({ userId });
  const profile = await StudentProfile.findOne({ userId });

  if (!education) {
    res.status(200).json({
      success: true,
      data: { available: false, reason: 'Please complete your Education details first.' }
    });
    return;
  }

  const careerObjective = profile?.careerObjective || 'explore_stream';
  const type = getAssessmentTypeForUser(education.educationLevel, careerObjective);

  if (!type) {
    res.status(200).json({
      success: true,
      data: { 
        available: false, 
        reason: education.educationLevel === 'Class10' 
          ? 'Your aptitude assessment will become available after you move to Class 11.' 
          : 'Aptitude assessment is not required for your selected profile level.' 
      }
    });
    return;
  }

  // Lookup assessment details matching active version
  const assessment = await Assessment.findOne({ type, isActive: true });
  if (!assessment) {
    res.status(200).json({
      success: true,
      data: { available: false, reason: 'Assessment type is not set active or loaded.' }
    });
    return;
  }

  // Check attempt status
  const existingAttempt = await AssessmentProgress.findOne({
    userId,
    assessmentId: assessment._id,
    assessmentVersion: assessment.version
  }).sort({ createdAt: -1 });

  let attemptStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
  let attemptId = null;
  let overallScore = undefined;

  if (existingAttempt) {
    attemptId = existingAttempt._id;
    if (existingAttempt.status === 'completed') {
      attemptStatus = 'completed';
      const result = await AssessmentResult.findOne({ attemptId: existingAttempt._id });
      if (result) {
        overallScore = result.overallScore;
      }
    } else {
      // Check timer expiration asynchronously on load
      const expired = isAttemptExpired(existingAttempt.startedAt, assessment.duration);
      if (expired) {
        await autoFinalizeAttempt(existingAttempt, assessment);
        attemptStatus = 'completed';
        const result = await AssessmentResult.findOne({ attemptId: existingAttempt._id });
        if (result) {
          overallScore = result.overallScore;
        }
      } else {
        attemptStatus = 'in_progress';
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      available: true,
      assessment: {
        _id: assessment._id,
        assessmentName: assessment.assessmentName,
        type: assessment.type,
        description: assessment.description,
        duration: assessment.duration,
        totalQuestions: assessment.totalQuestions,
        totalSections: assessment.totalSections
      },
      attemptStatus,
      attemptId,
      overallScore
    }
  });
});

// 2. Start (initialize) an Assessment Attempt
export const startAssessment = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { assessmentId } = req.body;

  if (!assessmentId) {
    throw new AppError('Assessment ID is required', 400);
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    throw new AppError('Assessment definition not found', 404);
  }

  // Check completed attempts to prevent multiple entries
  const completedAttempt = await AssessmentProgress.findOne({
    userId,
    assessmentId: assessment._id,
    assessmentVersion: assessment.version,
    status: 'completed'
  });

  if (completedAttempt) {
    throw new AppError('This version of assessment has already been completed.', 400);
  }

  // Resume existing active attempt if found
  let attempt = await AssessmentProgress.findOne({
    userId,
    assessmentId: assessment._id,
    assessmentVersion: assessment.version,
    status: 'in_progress'
  });

  if (attempt) {
    // Check if the resumed attempt is expired
    if (isAttemptExpired(attempt.startedAt, assessment.duration)) {
      await autoFinalizeAttempt(attempt, assessment);
      throw new AppError('Your previous attempt session has expired.', 400);
    }
  } else {
    // Create new attempt
    attempt = await AssessmentProgress.create({
      userId,
      assessmentId: assessment._id,
      assessmentVersion: assessment.version,
      status: 'in_progress',
      currentQuestionIndex: 0,
      answers: [],
      startedAt: new Date(),
      lastSavedAt: new Date()
    });
  }

  res.status(201).json({
    success: true,
    data: attempt
  });
});

// 3. Load active attempt status with sanitized questions
export const getAttempt = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { attemptId } = req.params;

  const attempt = await AssessmentProgress.findById(attemptId);
  if (!attempt) {
    throw new AppError('Assessment attempt not found', 404);
  }

  if (attempt.userId.toString() !== userId) {
    throw new AppError('Unauthorized access to this attempt', 403);
  }

  const assessment = await Assessment.findById(attempt.assessmentId);
  if (!assessment) {
    throw new AppError('Associated assessment definition not found', 404);
  }

  // Force timer expiry check
  if (attempt.status === 'in_progress' && isAttemptExpired(attempt.startedAt, assessment.duration)) {
    await autoFinalizeAttempt(attempt, assessment);
    res.status(200).json({
      success: true,
      data: {
        attempt,
        assessment,
        questions: [],
        remainingSeconds: 0,
        isExpired: true
      }
    });
    return;
  }

  if (attempt.status === 'completed') {
    res.status(200).json({
      success: true,
      data: {
        attempt,
        assessment,
        questions: [],
        remainingSeconds: 0,
        isExpired: true
      }
    });
    return;
  }

  // Load questions matching attempt version
  const questions = await AssessmentQuestion.find({
    assessmentId: attempt.assessmentId,
    assessmentVersion: attempt.assessmentVersion
  }).sort({ order: 1 });

  // Sanitize questions: Remove correctAnswer & scoringMetadata keys before returning
  const sanitizedQuestions = questions.map(q => {
    const obj = q.toObject();
    delete obj.correctAnswer;
    delete obj.scoringMetadata;
    return obj;
  });

  // Calculate remaining seconds
  const deadline = new Date(attempt.startedAt.getTime() + assessment.duration * 60 * 1000);
  const remainingSeconds = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));

  res.status(200).json({
    success: true,
    data: {
      attempt,
      assessment,
      questions: sanitizedQuestions,
      remainingSeconds,
      isExpired: false
    }
  });
});

// 4. Save progress / autosave incremental answers
export const saveProgress = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { attemptId } = req.params;
  const { currentQuestionIndex, answers } = req.body;

  const attempt = await AssessmentProgress.findById(attemptId);
  if (!attempt) {
    throw new AppError('Attempt session not found', 404);
  }

  if (attempt.userId.toString() !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  if (attempt.status === 'completed') {
    throw new AppError('Cannot update progress on a completed assessment attempt.', 400);
  }

  const assessment = await Assessment.findById(attempt.assessmentId);
  if (!assessment) {
    throw new AppError('Assessment definition not found', 404);
  }

  // Validate timer bounds
  if (isAttemptExpired(attempt.startedAt, assessment.duration)) {
    const result = await autoFinalizeAttempt(attempt, assessment);
    res.status(200).json({
      success: true,
      message: 'Time has expired. Assessment automatically finalized.',
      data: { status: 'completed', result }
    });
    return;
  }

  // Merge/Replace answers safely
  if (Array.isArray(answers)) {
    const answerMap = new Map<string, string>();
    // Seed existing answers
    for (const a of attempt.answers) {
      answerMap.set(a.questionId.toString(), a.selectedOption);
    }
    // Update with new answers
    for (const a of answers) {
      if (a.questionId && a.selectedOption !== undefined) {
        answerMap.set(a.questionId.toString(), a.selectedOption);
      }
    }

    // Map back to schema array format
    const mergedAnswers = Array.from(answerMap.entries()).map(([qId, opt]) => ({
      questionId: qId as any,
      selectedOption: opt,
      answeredAt: new Date()
    }));

    attempt.answers = mergedAnswers as any;
  }

  if (typeof currentQuestionIndex === 'number') {
    attempt.currentQuestionIndex = currentQuestionIndex;
  }

  attempt.lastSavedAt = new Date();
  await attempt.save();

  res.status(200).json({
    success: true,
    data: attempt
  });
});

// 5. Final submit of the assessment attempt
export const submitAssessment = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { attemptId } = req.params;
  const { answers } = req.body;

  const attempt = await AssessmentProgress.findById(attemptId);
  if (!attempt) {
    throw new AppError('Attempt session not found', 404);
  }

  if (attempt.userId.toString() !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  if (attempt.status === 'completed') {
    // Avoid double submission by returning the existing result object
    const result = await AssessmentResult.findOne({ attemptId });
    if (result) {
      res.status(200).json({
        success: true,
        message: 'Assessment was already submitted.',
        data: result
      });
      return;
    }
    throw new AppError('Assessment attempt already completed.', 400);
  }

  const assessment = await Assessment.findById(attempt.assessmentId);
  if (!assessment) {
    throw new AppError('Assessment definition not found', 404);
  }

  // Merge final batch of answers if supplied
  if (Array.isArray(answers)) {
    const answerMap = new Map<string, string>();
    for (const a of attempt.answers) {
      answerMap.set(a.questionId.toString(), a.selectedOption);
    }
    for (const a of answers) {
      if (a.questionId && a.selectedOption !== undefined) {
        answerMap.set(a.questionId.toString(), a.selectedOption);
      }
    }
    attempt.answers = Array.from(answerMap.entries()).map(([qId, opt]) => ({
      questionId: qId as any,
      selectedOption: opt,
      answeredAt: new Date()
    })) as any;
  }

  // Fetch assessment questions matching attempt version
  const questions = await AssessmentQuestion.find({
    assessmentId: attempt.assessmentId,
    assessmentVersion: attempt.assessmentVersion
  });

  const { sectionScores, overallScore } = scoreAssessmentAttempt(questions, attempt.answers);

  // Write immutable AssessmentResult matching target version
  const result = await AssessmentResult.create({
    userId,
    assessmentId: attempt.assessmentId,
    assessmentVersion: attempt.assessmentVersion,
    attemptId: attempt._id,
    sectionScores,
    overallScore,
    completedAt: new Date()
  });

  attempt.status = 'completed';
  attempt.completedAt = new Date();
  await attempt.save();

  res.status(200).json({
    success: true,
    data: result
  });
});

// 6. Fetch previous assessment history log
export const getHistory = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const results = await AssessmentResult.find({ userId })
    .populate({ path: 'assessmentId', select: 'assessmentName type description' })
    .sort({ completedAt: -1 });

  res.status(200).json({
    success: true,
    data: results
  });
});

// 7. Get specific result details
export const getResult = asyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  const { resultId } = req.params;

  const result = await AssessmentResult.findById(resultId)
    .populate({ path: 'assessmentId', select: 'assessmentName type description totalQuestions duration' });

  if (!result) {
    throw new AppError('Assessment result not found', 404);
  }

  if (result.userId.toString() !== userId) {
    throw new AppError('Unauthorized access to this result', 403);
  }

  res.status(200).json({
    success: true,
    data: result
  });
});
