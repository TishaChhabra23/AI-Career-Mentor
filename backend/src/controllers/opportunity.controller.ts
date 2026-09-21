import { Request, Response, NextFunction } from 'express';
import { Job } from '../models/Job';
import { Internship } from '../models/Internship';
import { SavedOpportunity } from '../models/SavedOpportunity';
import { EducationDetails } from '../models/EducationDetails';
import { StudentProfile } from '../models/StudentProfile';
import { AssessmentResult } from '../models/AssessmentResult';
import { UserResume } from '../models/UserResume';
import { getProfileCompletion } from '../services/profile.service';
import { opportunitySearchSchema, savedOpportunityCreateSchema, savedOpportunityUpdateSchema } from '../validators/opportunity.validator';
import { AppError } from '../middleware/errorHandler';
import { getOpportunityProvider } from '../services/opportunityProvider.service';

// Helper to check eligibility
const checkEligibility = async (userId: string, opportunityType: 'job' | 'internship') => {
  const education = await EducationDetails.findOne({ userId });
  if (!education) {
    throw new AppError('Please complete your Education details first.', 403);
  }

  const level = education.educationLevel;
  if (level === 'Class11' || level === 'Class12' || level === 'Class10') {
    throw new AppError('This resource is not available for your education level. Focus on educational roadmap planning first.', 403);
  }

  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw new AppError('Please complete your student profile first.', 403);
  }

  const compResult = getProfileCompletion(profile, education);
  if (compResult.completionPercentage < 100) {
    throw new AppError('Access forbidden. Please complete your profile to 100% first.', 403);
  }

  const obj = profile.careerObjective;
  const expectedObjective = opportunityType === 'internship' ? 'find_internship' : 'find_job';
  if (obj !== expectedObjective) {
    throw new AppError(`Access forbidden. Your career objective must be set to ${expectedObjective} to access opportunities.`, 403);
  }

  const expectedTestType = opportunityType === 'internship' ? 'internship_readiness' : 'job_readiness';
  
  // Resolve assessment definitions first to check results type matches
  const results = await AssessmentResult.find({ userId }).populate('assessmentId');
  const hasCompletedTest = results.some((r: any) => r.assessmentId && r.assessmentId.type === expectedTestType);

  if (!hasCompletedTest) {
    throw new AppError('Access forbidden. Please complete your career readiness assessment first.', 403);
  }

  const resume = await UserResume.findOne({ userId });
  if (!resume) {
    throw new AppError('Access forbidden. Please construct and save a resume using the Resume Builder first.', 403);
  }

  return { education, profile, userSkills: profile.skills || [] };
};

// Helper to validate external redirect URLs
export const validateExternalLink = (urlStr: string): boolean => {
  try {
    if (!urlStr.startsWith('https://')) return false;
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    if (host.startsWith('10.') || host.startsWith('192.168.')) return false;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false;
    if (parsed.protocol !== 'https:') return false;
    
    return true;
  } catch {
    return false;
  }
};

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const query = opportunitySearchSchema.parse(req.query);

    // 1. Enforce eligibility
    const { userSkills } = await checkEligibility(userId, 'job');

    // 2. Check if fetching from external provider
    if (query.source && query.source.toLowerCase() === 'internshala') {
      const provider = getOpportunityProvider('internshala');
      try {
        const results = await provider.getJobs({
          keyword: query.search,
          location: query.location,
          workMode: query.mode,
          skills: query.skills ? query.skills.split(',').map((s) => s.trim()) : undefined
        });

        // Compute dynamic deterministic match scores
        const mapped = results.map((job) => {
          const reqSkills = job.requiredSkills || [];
          let matchScore = 0;
          if (reqSkills.length > 0) {
            const intersect = reqSkills.filter((s: string) => 
              userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
            );
            matchScore = Math.round((intersect.length / reqSkills.length) * 100);
          } else {
            matchScore = 100;
          }
          return {
            ...job,
            matchScore
          };
        });

        return res.status(200).json({
          success: true,
          providerStatus: 'CONNECTED',
          data: mapped
        });
      } catch (err: any) {
        return res.status(200).json({
          success: true,
          providerStatus: 'NOT_CONFIGURED',
          data: [],
          message: err.message || 'Live Internshala opportunities are not connected yet.'
        });
      }
    }

    // 3. Query platform-level jobs (default local provider)
    const filter: any = {};
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { company: searchRegex },
        { jobRole: searchRegex }
      ];
    }
    if (query.location) {
      filter.location = new RegExp(query.location, 'i');
    }

    const jobs = await Job.find(filter).lean();

    // 4. Compute dynamic deterministic match scores
    const mapped = jobs.map((job: any) => {
      const reqSkills = job.skillsRequired || [];
      let matchScore = 0;
      if (reqSkills.length > 0) {
        const intersect = reqSkills.filter((s: string) => 
          userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
        );
        matchScore = Math.round((intersect.length / reqSkills.length) * 100);
      } else {
        matchScore = 100;
      }
      return {
        ...job,
        matchScore
      };
    });

    return res.status(200).json({
      success: true,
      providerStatus: 'CONNECTED',
      data: mapped
    });
  } catch (error) {
    next(error);
    return;
  }
};

export const listInternships = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const query = opportunitySearchSchema.parse(req.query);

    // 1. Enforce eligibility
    const { userSkills } = await checkEligibility(userId, 'internship');

    // 2. Check if fetching from external provider
    if (query.source && query.source.toLowerCase() === 'internshala') {
      const provider = getOpportunityProvider('internshala');
      try {
        const results = await provider.getInternships({
          keyword: query.search,
          location: query.location,
          workMode: query.mode,
          skills: query.skills ? query.skills.split(',').map((s) => s.trim()) : undefined
        });

        // Compute dynamic deterministic match scores
        const mapped = results.map((intern) => {
          const reqSkills = intern.requiredSkills || [];
          let matchScore = 0;
          if (reqSkills.length > 0) {
            const intersect = reqSkills.filter((s: string) => 
              userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
            );
            matchScore = Math.round((intersect.length / reqSkills.length) * 100);
          } else {
            matchScore = 100;
          }
          return {
            ...intern,
            matchScore
          };
        });

        return res.status(200).json({
          success: true,
          providerStatus: 'CONNECTED',
          data: mapped
        });
      } catch (err: any) {
        return res.status(200).json({
          success: true,
          providerStatus: 'NOT_CONFIGURED',
          data: [],
          message: err.message || 'Live Internshala opportunities are not connected yet.'
        });
      }
    }

    // 3. Query platform-level internships (default local provider)
    const filter: any = {};
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { company: searchRegex },
        { role: searchRegex },
        { skillsRequired: searchRegex }
      ];
    }
    if (query.location) {
      filter.location = new RegExp(query.location, 'i');
    }
    if (query.mode) {
      filter.mode = new RegExp('^' + query.mode.replace('-', '[- ]?') + '$', 'i');
    }

    const internships = await Internship.find(filter).lean();

    // 4. Compute match scores
    const mapped = internships.map((intern: any) => {
      const reqSkills = intern.skillsRequired || [];
      let matchScore = 0;
      if (reqSkills.length > 0) {
        const intersect = reqSkills.filter((s: string) => 
          userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
        );
        matchScore = Math.round((intersect.length / reqSkills.length) * 100);
      } else {
        matchScore = 100;
      }
      return {
        ...intern,
        matchScore
      };
    });

    return res.status(200).json({
      success: true,
      providerStatus: 'CONNECTED',
      data: mapped
    });
  } catch (error) {
    next(error);
    return;
  }
};

export const getJobDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { userSkills } = await checkEligibility(userId, 'job');

    const job = await Job.findById(id).lean();
    if (!job) {
      throw new AppError('Job opportunity not found.', 404);
    }

    const reqSkills = job.skillsRequired || [];
    let matchScore = 0;
    if (reqSkills.length > 0) {
      const intersect = reqSkills.filter((s: string) => 
        userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
      );
      matchScore = Math.round((intersect.length / reqSkills.length) * 100);
    } else {
      matchScore = 100;
    }

    res.status(200).json({
      success: true,
      data: {
        ...job,
        matchScore
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getInternshipDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { userSkills } = await checkEligibility(userId, 'internship');

    const intern = await Internship.findById(id).lean();
    if (!intern) {
      throw new AppError('Internship opportunity not found.', 404);
    }

    const reqSkills = intern.skillsRequired || [];
    let matchScore = 0;
    if (reqSkills.length > 0) {
      const intersect = reqSkills.filter((s: string) => 
        userSkills.some((us: string) => us.toLowerCase() === s.toLowerCase())
      );
      matchScore = Math.round((intersect.length / reqSkills.length) * 100);
    } else {
      matchScore = 100;
    }

    res.status(200).json({
      success: true,
      data: {
        ...intern,
        matchScore
      }
    });
  } catch (error) {
    next(error);
  }
};

export const saveOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const body = savedOpportunityCreateSchema.parse(req.body);

    // 1. Verify opportunity exists
    let opportunityLink = '';
    if (body.opportunityType === 'job') {
      const job = await Job.findById(body.opportunityId);
      if (!job) throw new AppError('Job listing not found', 404);
      opportunityLink = job.applicationLink;
    } else {
      const intern = await Internship.findById(body.opportunityId);
      if (!intern) throw new AppError('Internship listing not found', 404);
      opportunityLink = intern.applicationLink;
    }

    // 2. Validate URL safety
    if (!validateExternalLink(opportunityLink)) {
      throw new AppError('Access forbidden. Application redirect link is unsafe.', 400);
    }

    // 3. Create or update save status
    const saved = await SavedOpportunity.findOneAndUpdate(
      { userId, opportunityType: body.opportunityType, opportunityId: body.opportunityId },
      { $set: { status: body.status, notes: body.notes } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Opportunity saved successfully.',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

export const unsaveOpportunity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params; // saved opportunity document ID

    const saved = await SavedOpportunity.findById(id);
    if (!saved) {
      throw new AppError('Saved opportunity not found.', 404);
    }

    if (saved.userId.toString() !== userId) {
      throw new AppError('Access forbidden. You do not own this saved record.', 403);
    }

    await SavedOpportunity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Opportunity removed from bookmarks.'
    });
  } catch (error) {
    next(error);
  }
};

export const updateSavedDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params; // saved opportunity document ID
    const body = savedOpportunityUpdateSchema.parse(req.body);

    const saved = await SavedOpportunity.findById(id);
    if (!saved) {
      throw new AppError('Saved opportunity not found.', 404);
    }

    if (saved.userId.toString() !== userId) {
      throw new AppError('Access forbidden. You do not own this saved record.', 403);
    }

    const updated = await SavedOpportunity.findByIdAndUpdate(
      id,
      { $set: { status: body.status, notes: body.notes } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Bookmark status updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const listSavedOpportunities = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    // Retrieve and populate the dynamic polymorphic references
    const saved = await SavedOpportunity.find({ userId })
      .populate('opportunityId')
      .sort({ updatedAt: -1 });

    // Filter out potential deleted platform opportunities
    const valid = saved.filter(s => s.opportunityId);

    res.status(200).json({
      success: true,
      data: valid
    });
  } catch (error) {
    next(error);
  }
};
