import { Schema, model, Document, Types } from 'mongoose';

export interface IAssessmentResult extends Document {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  assessmentVersion: number;
  attemptId: Types.ObjectId;
  sectionScores: Map<string, number>;
  overallScore: number;
  completedAt: Date;
}

const assessmentResultSchema = new Schema<IAssessmentResult>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  assessmentVersion: { type: Number, required: true },
  attemptId: { type: Schema.Types.ObjectId, ref: 'AssessmentProgress', required: true, unique: true },
  sectionScores: { type: Map, of: Number, required: true },
  overallScore: { type: Number, required: true },
  completedAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Indexes for history list fetches
assessmentResultSchema.index({ userId: 1, assessmentId: 1 });
assessmentResultSchema.index({ attemptId: 1 }, { unique: true });

export const AssessmentResult = model<IAssessmentResult>('AssessmentResult', assessmentResultSchema);
