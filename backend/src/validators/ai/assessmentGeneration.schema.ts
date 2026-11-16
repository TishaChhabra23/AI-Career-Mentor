import { z } from 'zod';

export const generatedQuestionSchema = z.object({
  sectionId: z.string().describe('Unique identifier for section (e.g. domain_aptitude, problem_solving, practical_scenarios, career_alignment)'),
  sectionName: z.string().describe('Human readable name for section (e.g. Mathematics & Analytical Aptitude, Programming Logic)'),
  questionType: z.enum(['mcq', 'likert', 'scenario']).describe('Type of question: mcq for multiple choice with 1 right answer, scenario for practical decision-making, likert for agreement scale'),
  question: z.string().describe('The full question text, tailored to the education level and stream/course'),
  options: z.array(z.string()).min(2).max(5).describe('List of possible answers'),
  correctAnswer: z.string().optional().describe('Correct answer text for mcq questions'),
  weightage: z.number().default(1).describe('Points or weight for this question'),
  scoringMetadata: z.object({
    optionScores: z.record(z.string(), z.number()).optional()
  }).optional().describe('Scoring map for likert or scenario questions, e.g. {"Strongly Disagree": 1, "Strongly Agree": 5}')
});

export const assessmentGenerationSchema = z.object({
  assessmentName: z.string().describe('Specific title of the assessment including education level and stream/course'),
  description: z.string().describe('Engaging description explaining what academic and career competencies are evaluated'),
  questions: z.array(generatedQuestionSchema).min(6).max(12).describe('6 to 10 comprehensive assessment questions')
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type AssessmentGenerationResult = z.infer<typeof assessmentGenerationSchema>;
