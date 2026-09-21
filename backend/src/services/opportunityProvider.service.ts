import { Job } from '../models/Job';
import { Internship } from '../models/Internship';

export interface OpportunityFilters {
  keyword?: string;
  location?: string;
  workMode?: 'Remote' | 'On-site' | 'Hybrid';
  skills?: string[];
  page?: number;
  limit?: number;
}

export interface Opportunity {
  id: string;
  source: 'Internshala' | 'Local';
  sourceOpportunityId?: string;
  sourceUrl?: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'On-site' | 'Hybrid';
  stipend?: string;
  duration?: string;
  requiredSkills: string[];
  description: string;
  postedAt?: Date;
  applicationDeadline?: Date;
  fetchedAt?: Date;
}

export interface OpportunityProvider {
  getInternships(filters: OpportunityFilters): Promise<Opportunity[]>;
  getJobs(filters: OpportunityFilters): Promise<Opportunity[]>;
}

/**
 * LocalOpportunityProvider
 * Queries the local MongoDB database for seed/demo data.
 */
export class LocalOpportunityProvider implements OpportunityProvider {
  async getInternships(filters: OpportunityFilters): Promise<Opportunity[]> {
    const query: any = {};
    if (filters.keyword) {
      const searchRegex = new RegExp(filters.keyword, 'i');
      query.$or = [
        { company: searchRegex },
        { role: searchRegex }
      ];
    }
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }
    if (filters.workMode) {
      query.mode = filters.workMode;
    }

    const internships = await Internship.find(query).lean();

    return internships.map((item: any) => ({
      id: item._id.toString(),
      source: 'Local',
      title: item.role || 'Internship',
      company: item.company || 'Unknown',
      location: item.location || 'Remote',
      workMode: item.mode || 'Remote',
      stipend: item.stipend || 'Unpaid',
      duration: item.duration || 'Flexible',
      requiredSkills: item.skillsRequired || [],
      description: item.description || '',
      postedAt: item.createdAt
    }));
  }

  async getJobs(filters: OpportunityFilters): Promise<Opportunity[]> {
    const query: any = {};
    if (filters.keyword) {
      const searchRegex = new RegExp(filters.keyword, 'i');
      query.$or = [
        { company: searchRegex },
        { jobRole: searchRegex }
      ];
    }
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    const jobs = await Job.find(query).lean();

    return jobs.map((item: any) => ({
      id: item._id.toString(),
      source: 'Local',
      title: item.jobRole || 'Job Role',
      company: item.company || 'Unknown',
      location: item.location || 'Remote',
      workMode: 'On-site', // Default for local jobs
      stipend: item.salaryPackage || 'Not Specified',
      duration: 'Full-time',
      requiredSkills: item.skillsRequired || [],
      description: item.description || '',
      postedAt: item.createdAt
    }));
  }
}

/**
 * InternshalaOpportunityProvider
 * Blocked pending authorization. Kept in a safe NOT_CONFIGURED state.
 */
export class InternshalaOpportunityProvider implements OpportunityProvider {
  async getInternships(_filters: OpportunityFilters): Promise<Opportunity[]> {
    throw new Error('Live Internshala opportunities are not connected yet.');
  }

  async getJobs(_filters: OpportunityFilters): Promise<Opportunity[]> {
    throw new Error('Live Internshala opportunities are not connected yet.');
  }
}

/**
 * Provider Factory
 */
export const getOpportunityProvider = (source: string): OpportunityProvider => {
  if (source.toLowerCase() === 'internshala') {
    return new InternshalaOpportunityProvider();
  }
  return new LocalOpportunityProvider();
};
