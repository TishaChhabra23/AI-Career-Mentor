import mongoose, { Schema, Document } from 'mongoose';

export interface IInternship extends Document {
  company: string;
  role: string;
  location: string;
  mode: 'Remote' | 'Hybrid' | 'On-site';
  skillsRequired: string[];
  stipend: string;
  applicationLink: string;
  isTestData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InternshipSchema = new Schema<IInternship>({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  mode: { type: String, required: true, enum: ['Remote', 'Hybrid', 'On-site'] },
  skillsRequired: { type: [String], required: true, index: true },
  stipend: { type: String, required: true, trim: true },
  applicationLink: { type: String, required: true, trim: true },
  isTestData: { type: Boolean, default: true, required: true }
}, {
  timestamps: true
});

export const Internship = mongoose.model<IInternship>('Internship', InternshipSchema, 'internships');
