import { z } from 'zod';

export const opportunitySearchSchema = z.object({
  search: z.string().trim().max(100).optional(),
  location: z.string().trim().max(100).optional(),
  mode: z.enum(['Remote', 'Hybrid', 'On-site']).optional(),
  skills: z.string().trim().optional(), // Comma-separated skills query
  source: z.string().trim().optional()
});

export const savedOpportunityCreateSchema = z.object({
  opportunityType: z.enum(['job', 'internship']),
  opportunityId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, 'Invalid opportunity ID'),
  status: z.enum(['saved', 'applied', 'interviewing', 'accepted', 'rejected']).default('saved'),
  notes: z.string().trim().max(1000).optional()
});

export const savedOpportunityUpdateSchema = z.object({
  status: z.enum(['saved', 'applied', 'interviewing', 'accepted', 'rejected']),
  notes: z.string().trim().max(1000).optional()
});
