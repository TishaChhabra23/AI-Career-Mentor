import { z } from 'zod';

const experienceItemSchema = z.object({
  company: z.string({ required_error: 'Company name is required' }).trim(),
  role: z.string({ required_error: 'Role title is required' }).trim(),
  startDate: z.string().transform((val) => new Date(val)).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
  description: z.string().trim().optional(),
});

export const profileSchema = z.object({
  profilePhoto: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() && !/^https?:\/\//i.test(val.trim())) {
      return `https://${val.trim()}`;
    }
    return val;
  }, z.string().url('Invalid photo URL format').optional().or(z.literal('').transform(() => undefined))),
  interests: z.array(z.string()).optional(),
  favoriteSubjects: z.array(z.string()).optional(),
  strengths: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  careerGoal: z.string().trim().optional(),
  preferredDegree: z.string().trim().optional(),
  linkedIn: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() && !/^https?:\/\//i.test(val.trim())) {
      return `https://${val.trim()}`;
    }
    return val;
  }, z.string().trim().url('Invalid LinkedIn URL format').optional().or(z.literal('').transform(() => undefined))),
  github: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() && !/^https?:\/\//i.test(val.trim())) {
      return `https://${val.trim()}`;
    }
    return val;
  }, z.string().trim().url('Invalid GitHub URL format').optional().or(z.literal('').transform(() => undefined))),
  careerObjective: z.enum([
    'explore_stream',
    'explore_degree',
    'explore_career',
    'find_internship',
    'find_job',
    'higher_studies',
  ], { required_error: 'Career objective is required' }),
  learningStyle: z.string().trim().optional(),
  experience: z.array(experienceItemSchema).optional(),
});
