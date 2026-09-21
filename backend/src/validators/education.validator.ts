import { z } from 'zod';

export const educationSchema = z.object({
  educationLevel: z.enum(['Class10', 'Class11', 'Class12', 'Diploma', 'UG', 'PG'], {
    required_error: 'Education level is required'
  }),
  schoolCollege: z.string().trim().optional(),
  boardUniversity: z.string().trim().optional(),
  currentClassSemester: z.string().trim().optional(),
  stream: z.string().trim().optional(),
  course: z.string().trim().optional(),
  percentageCGPA: z
    .union([z.number(), z.string().transform((val) => parseFloat(val))])
    .optional()
    .refine((val) => val === undefined || (val >= 0 && val <= 100), {
      message: 'Marks/CGPA must be between 0 and 100',
    }),
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
});
