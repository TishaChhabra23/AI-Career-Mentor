import { Schema, model, Document, Types } from 'mongoose';

export interface IAssessmentQuestion extends Document {
  assessmentId: Types.ObjectId;
  assessmentVersion: number;
  sectionId: string;
  sectionName: string;
  questionType: 'mcq' | 'likert' | 'scenario' | 'situational' | 'self-rating';
  question: string;
  options: string[];
  correctAnswer?: string;
  scoringMetadata?: {
    optionScores?: Record<string, number>;
  };
  weightage: number;
  order: number;
}

const assessmentQuestionSchema = new Schema<IAssessmentQuestion>({
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  assessmentVersion: { type: Number, required: true },
  sectionId: { type: String, required: true },
  sectionName: { type: String, required: true },
  questionType: { 
    type: String, 
    enum: ['mcq', 'likert', 'scenario', 'situational', 'self-rating'], 
    required: true 
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String },
  scoringMetadata: {
    optionScores: { type: Map, of: Number }
  },
  weightage: { type: Number, required: true, default: 1 },
  order: { type: Number, required: true },
}, {
  timestamps: true
});

// Indexes for loading fast
assessmentQuestionSchema.index({ assessmentId: 1, assessmentVersion: 1, order: 1 });

export const AssessmentQuestion = model<IAssessmentQuestion>('AssessmentQuestion', assessmentQuestionSchema);
