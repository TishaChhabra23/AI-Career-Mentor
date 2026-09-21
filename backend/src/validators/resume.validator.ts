import { z } from 'zod';

const PersonalInfoValidator = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(100),
  phone: z.string().trim().max(20).optional(),
  location: z.string().trim().max(100).optional(),
  linkedin: z.string().trim().url('LinkedIn URL is invalid').or(z.string().length(0)).optional(),
  github: z.string().trim().url('GitHub URL is invalid').or(z.string().length(0)).optional()
});

const EducationEntryValidator = z.object({
  institution: z.string().trim().min(1, 'Institution is required').max(150),
  degree: z.string().trim().min(1, 'Degree is required').max(100),
  field: z.string().trim().max(100).optional(),
  startDate: z.string().datetime().or(z.date()).or(z.string().length(0)).optional(),
  endDate: z.string().datetime().or(z.date()).or(z.string().length(0)).optional(),
  grade: z.string().trim().max(20).optional()
});

const ExperienceEntryValidator = z.object({
  company: z.string().trim().min(1, 'Company name is required').max(150),
  role: z.string().trim().min(1, 'Role is required').max(100),
  startDate: z.string().datetime().or(z.date()).or(z.string().length(0)).optional(),
  endDate: z.string().datetime().or(z.date()).or(z.string().length(0)).optional(),
  description: z.string().trim().max(2000).optional()
});

const ProjectEntryValidator = z.object({
  title: z.string().trim().min(1, 'Project title is required').max(150),
  description: z.string().trim().max(2000).optional(),
  technologies: z.array(z.string().trim()).optional(),
  link: z.string().trim().url('Project link is invalid').or(z.string().length(0)).optional()
});

const CertificationEntryValidator = z.object({
  name: z.string().trim().min(1, 'Certification name is required').max(150),
  issuer: z.string().trim().max(150).optional(),
  date: z.string().datetime().or(z.date()).or(z.string().length(0)).optional(),
  url: z.string().trim().url('Certification URL is invalid').or(z.string().length(0)).optional()
});

export const resumeCreateSchema = z.object({
  title: z.string().trim().min(1, 'Resume title is required').max(100),
  templateId: z.enum(['modern', 'minimal', 'professional']).default('modern'),
  personalInfo: PersonalInfoValidator,
  summary: z.string().trim().max(2000).optional(),
  education: z.array(EducationEntryValidator).default([]),
  experience: z.array(ExperienceEntryValidator).default([]),
  skills: z.array(z.string().trim()).default([]),
  projects: z.array(ProjectEntryValidator).default([]),
  certifications: z.array(CertificationEntryValidator).default([]),
  achievements: z.array(z.string().trim()).default([])
});

export const resumeUpdateSchema = resumeCreateSchema.partial();
