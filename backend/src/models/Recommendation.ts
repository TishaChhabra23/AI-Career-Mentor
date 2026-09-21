import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRecommendation extends Document {
  userId: Types.ObjectId;
  type: 'stream_recommendation' | 'degree_recommendation' | 'career_recommendation' | 'skill_gap_analysis' | 'career_roadmap' | 'learning_roadmap';
  sourceAssessmentId?: Types.ObjectId;
  sourceAssessmentVersion?: number;
  inputContextHash: string;
  aiModel: string;
  promptVersion: string;
  result: any;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'stream_recommendation',
      'degree_recommendation',
      'career_recommendation',
      'skill_gap_analysis',
      'career_roadmap',
      'learning_roadmap'
    ],
    required: true
  },
  sourceAssessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
  sourceAssessmentVersion: { type: Number },
  inputContextHash: { type: String, required: true },
  aiModel: { type: String, required: true },
  promptVersion: { type: String, required: true },
  result: { type: Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

// Compound index to support lookup and caching checks
RecommendationSchema.index({ userId: 1, type: 1, inputContextHash: 1 });
RecommendationSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
