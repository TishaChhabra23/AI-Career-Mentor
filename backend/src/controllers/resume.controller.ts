import { Request, Response, NextFunction } from 'express';
import { UserResume } from '../models/UserResume';
import { User } from '../models/User';
import { EducationDetails } from '../models/EducationDetails';
import { StudentProfile } from '../models/StudentProfile';
import { resumeCreateSchema, resumeUpdateSchema } from '../validators/resume.validator';
import { AppError } from '../middleware/errorHandler';

// Helper to prefill details from profile
const prefillFromProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const education = await EducationDetails.findOne({ userId });
  const profile = await StudentProfile.findOne({ userId });

  const personalInfo = {
    fullName: user.fullName || 'Student',
    email: user.email,
    phone: user.mobileNumber || '',
    location: '',
    linkedin: profile?.linkedIn || '',
    github: profile?.github || ''
  };

  const getDegreeString = (edu: any) => {
    if (!edu) return 'Secondary Education';
    if (edu.course && edu.course !== 'N/A') return edu.course;
    if (edu.educationLevel && edu.educationLevel !== 'N/A') return edu.educationLevel;
    if (edu.stream && edu.stream !== 'N/A') return edu.stream;
    return 'High School';
  };

  const resumeEducation = education ? [{
    institution: education.schoolCollege || 'Educational Institution',
    degree: getDegreeString(education),
    field: education.stream || '',
    startDate: undefined,
    endDate: undefined,
    grade: education.percentageCGPA ? education.percentageCGPA.toString() : ''
  }] : [];

  const resumeExperience = profile?.experience ? profile.experience.map(exp => ({
    company: exp.company || 'Company',
    role: exp.role || 'Role',
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description || ''
  })) : [];

  const resumeProjects = profile?.projects ? profile.projects.map(proj => ({
    title: proj || 'Project Title',
    description: '',
    technologies: [],
    link: ''
  })) : [];

  const resumeCertifications = profile?.certifications ? profile.certifications.map(cert => ({
    name: cert || 'Certification Name',
    issuer: '',
    date: undefined,
    url: ''
  })) : [];

  return {
    personalInfo,
    education: resumeEducation,
    experience: resumeExperience,
    skills: profile?.skills || [],
    projects: resumeProjects,
    certifications: resumeCertifications,
    achievements: []
  };
};

export const createResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    let resumeData = req.body;

    if (req.body.importFromProfile === true) {
      const profileSnapshot = await prefillFromProfile(userId);
      resumeData = {
        title: req.body.title || 'My Resume',
        templateId: req.body.templateId || 'modern',
        ...profileSnapshot
      };
    }

    const validated = resumeCreateSchema.parse(resumeData);
    const resume = await UserResume.create({
      userId,
      ...validated
    });

    res.status(201).json({
      success: true,
      message: 'Resume created successfully.',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

export const listResumes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const resumes = await UserResume.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { resumeId } = req.params;

    const resume = await UserResume.findById(resumeId);
    if (!resume) {
      throw new AppError('Resume not found.', 404);
    }

    if (resume.userId.toString() !== userId) {
      throw new AppError('Access forbidden. You do not own this resume.', 403);
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

export const updateResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { resumeId } = req.params;

    const resume = await UserResume.findById(resumeId);
    if (!resume) {
      throw new AppError('Resume not found.', 404);
    }

    if (resume.userId.toString() !== userId) {
      throw new AppError('Access forbidden. You do not own this resume.', 403);
    }

    const validated = resumeUpdateSchema.parse(req.body);
    const updated = await UserResume.findByIdAndUpdate(
      resumeId,
      { $set: validated },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { resumeId } = req.params;

    const resume = await UserResume.findById(resumeId);
    if (!resume) {
      throw new AppError('Resume not found.', 404);
    }

    if (resume.userId.toString() !== userId) {
      throw new AppError('Access forbidden. You do not own this resume.', 403);
    }

    await UserResume.findByIdAndDelete(resumeId);

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const exportResume = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { resumeId } = req.params;

    const resume = await UserResume.findById(resumeId);
    if (!resume) {
      throw new AppError('Resume not found.', 404);
    }

    if (resume.userId.toString() !== userId) {
      throw new AppError('Access forbidden. You do not own this resume.', 403);
    }

    // Since PDF export is fully rendered client-side using @react-pdf/renderer,
    // this endpoint verifies ownership and returns the structured data payload.
    res.status(200).json({
      success: true,
      message: 'Resume validated and ready for export.',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};
