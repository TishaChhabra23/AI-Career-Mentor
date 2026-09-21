import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedOpportunity extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityType: 'job' | 'internship';
  opportunityId: mongoose.Types.ObjectId;
  status: 'saved' | 'applied' | 'interviewing' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedOpportunitySchema = new Schema<ISavedOpportunity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opportunityType: { type: String, required: true, enum: ['job', 'internship'] },
  opportunityId: { type: Schema.Types.ObjectId, required: true, refPath: 'opportunityType' },
  status: { 
    type: String, 
    required: true, 
    enum: ['saved', 'applied', 'interviewing', 'accepted', 'rejected'], 
    default: 'saved' 
  },
  notes: { type: String, maxlength: 1000 }
}, {
  timestamps: true
});

// Compound Unique Index: prevents duplicate saves of the same opportunity by a single user,
// but allows different users to bookmark the same opportunity independently.
SavedOpportunitySchema.index({ userId: 1, opportunityType: 1, opportunityId: 1 }, { unique: true });

export const SavedOpportunity = mongoose.model<ISavedOpportunity>('SavedOpportunity', SavedOpportunitySchema, 'saved_opportunities');
