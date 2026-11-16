import { Schema, model, Document, Types } from 'mongoose';

export interface IAssessment extends Document {
  assessmentName: string;
  type: string;
  educationLevels: string[];
  careerObjectives: string[];
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalSections: number;
  isActive: boolean;
  version: number;
  userId?: Types.ObjectId;
  isPersonalized?: boolean;
  stream?: string;
  course?: string;
  generatedBy?: 'ai' | 'curriculum' | 'seed';
}

const assessmentSchema = new Schema<IAssessment>({
  assessmentName: { type: String, required: true },
  type: { type: String, required: true },
  educationLevels: [{ type: String, required: true }],
  careerObjectives: [{ type: String, required: true }],
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  totalSections: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  version: { type: Number, required: true, default: 1 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isPersonalized: { type: Boolean, default: false },
  stream: { type: String, default: null },
  course: { type: String, default: null },
  generatedBy: { type: String, enum: ['ai', 'curriculum', 'seed'], default: 'seed' }
}, {
  timestamps: true
});

// Compound unique index for type + version
assessmentSchema.index({ type: 1, version: 1 }, { unique: true });
assessmentSchema.index({ userId: 1, isActive: 1 });

export const Assessment = model<IAssessment>('Assessment', assessmentSchema);
