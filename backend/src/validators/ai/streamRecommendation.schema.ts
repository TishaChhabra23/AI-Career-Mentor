import z from 'zod';

export const streamRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      stream: z.enum(['Science', 'Commerce', 'Arts']),
      fitScore: z.number().min(0).max(100),
      reasons: z.array(z.string()).min(1)
    })
  ).min(1),
  considerations: z.array(z.string()).min(1)
});

export type StreamRecommendation = z.infer<typeof streamRecommendationSchema>;
