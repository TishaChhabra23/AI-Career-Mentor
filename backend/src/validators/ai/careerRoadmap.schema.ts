import z from 'zod';

export const careerRoadmapSchema = z.object({
  goal: z.string().min(1),
  stages: z.array(
    z.object({
      title: z.string().min(1),
      duration: z.string().min(1),
      objectives: z.array(z.string()).min(1),
      skills: z.array(z.string()).min(1)
    })
  ).min(1)
});

export type CareerRoadmap = z.infer<typeof careerRoadmapSchema>;
