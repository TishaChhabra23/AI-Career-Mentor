import z from 'zod';

export const careerRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      career: z.string().min(1),
      fitScore: z.number().min(0).max(100),
      reasons: z.array(z.string()).min(1),
      requiredSkills: z.array(z.string()).min(1)
    })
  ).min(1)
});

export type CareerRecommendation = z.infer<typeof careerRecommendationSchema>;
