import { Schema, model, Document, Types } from 'mongoose';

export interface IAssessmentProgress extends Document {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  assessmentVersion: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  answers: Array<{
    questionId: Types.ObjectId;
    selectedOption: string;
    answeredAt: Date;
  }>;
  startedAt: Date;
  lastSavedAt: Date;
  completedAt?: Date;
}

const assessmentProgressSchema = new Schema<IAssessmentProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true },
  assessmentVersion: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'abandoned'], 
    default: 'in_progress',
    required: true 
  },
  currentQuestionIndex: { type: Number, default: 0 },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'AssessmentQuestion', required: true },
    selectedOption: { type: String, required: true },
    answeredAt: { type: Date, default: Date.now }
  }],
  startedAt: { type: Date, default: Date.now },
  lastSavedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for progress queries
assessmentProgressSchema.index({ userId: 1, status: 1 });
assessmentProgressSchema.index({ userId: 1, assessmentId: 1, assessmentVersion: 1 });

export const AssessmentProgress = model<IAssessmentProgress>('AssessmentProgress', assessmentProgressSchema);
