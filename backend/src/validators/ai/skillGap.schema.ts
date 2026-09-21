import z from 'zod';

export const skillGapSchema = z.object({
  existingStrengths: z.array(z.string()),
  missingSkills: z.array(
    z.object({
      skill: z.string().min(1),
      priority: z.enum(['high', 'medium', 'low']),
      reason: z.string().min(1)
    })
  ).min(1)
});

export type SkillGap = z.infer<typeof skillGapSchema>;
