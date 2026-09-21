import { Schema, model, Document, Types } from 'mongoose';

export interface IUserAICredential extends Document {
  userId: Types.ObjectId;
  provider: 'google_gemini';
  encryptedApiKey: string;
  maskedKey: string;
  status: 'connected' | 'invalid';
  validatedAt: Date;
}

const userAICredentialSchema = new Schema<IUserAICredential>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  provider: {
    type: String,
    enum: ['google_gemini'],
    required: true,
    default: 'google_gemini'
  },
  encryptedApiKey: { type: String, required: true },
  maskedKey: { type: String, required: true },
  status: {
    type: String,
    enum: ['connected', 'invalid'],
    default: 'connected'
  },
  validatedAt: { type: Date, required: true }
}, {
  timestamps: true
});

// Prevent duplicate credentials for the same user + provider
userAICredentialSchema.index({ userId: 1, provider: 1 }, { unique: true });

export const UserAICredential = model<IUserAICredential>('UserAICredential', userAICredentialSchema);
