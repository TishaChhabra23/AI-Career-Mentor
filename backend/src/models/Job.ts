import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  company: string;
  jobRole: string;
  location: string;
  experienceRequired: string;
  salaryRange: string;
  skillsRequired: string[];
  applicationLink: string;
  isTestData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  company: { type: String, required: true, trim: true },
  jobRole: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  experienceRequired: { type: String, required: true, trim: true },
  salaryRange: { type: String, required: true, trim: true },
  skillsRequired: { type: [String], required: true, index: true },
  applicationLink: { type: String, required: true, trim: true },
  isTestData: { type: Boolean, default: true, required: true }
}, {
  timestamps: true
});

export const Job = mongoose.model<IJob>('Job', JobSchema, 'jobs');
