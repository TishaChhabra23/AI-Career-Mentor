import z from 'zod';

export const learningRoadmapSchema = z.object({
  learningGoals: z.array(
    z.object({
      skill: z.string().min(1),
      priority: z.enum(['high', 'medium', 'low']),
      topics: z.array(z.string()).min(1),
      estimatedDuration: z.string().min(1),
      recommendedResources: z.array(z.string()).min(1)
    })
  ).min(1)
});

export type LearningRoadmap = z.infer<typeof learningRoadmapSchema>;
