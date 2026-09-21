import z from 'zod';

export const degreeRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      degree: z.string().min(1),
      fitScore: z.number().min(0).max(100),
      reasons: z.array(z.string()).min(1)
    })
  ).min(1),
  considerations: z.array(z.string()).min(1)
});

export type DegreeRecommendation = z.infer<typeof degreeRecommendationSchema>;
