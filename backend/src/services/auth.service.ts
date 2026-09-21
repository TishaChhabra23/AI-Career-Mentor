import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { EducationDetails } from '../models/EducationDetails';
import { StudentProfile } from '../models/StudentProfile';
import { AssessmentProgress } from '../models/AssessmentProgress';
import { AssessmentResult } from '../models/AssessmentResult';
import { Recommendation } from '../models/Recommendation';
import { UserResume } from '../models/UserResume';
import { SavedOpportunity } from '../models/SavedOpportunity';
import { UserAICredential } from '../models/UserAICredential';
import { AppError } from '../middleware/errorHandler';
import { createToken } from '../utils/jwt';
import { sendPasswordResetEmail } from './email.service';

export interface RegisterInput {
  fullName: string;
  email: string;
  mobileNumber: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export const registerUser = async (input: RegisterInput): Promise<{ user: IUser; token: string }> => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) {
    // Standard secure generic message to prevent account enumeration checks
    throw new AppError('An account with this email address already exists.', 409);
  }

  if (!input.password) {
    throw new AppError('Password is required', 400);
  }

  // Hash password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(input.password, saltRounds);

  const newUser = await User.create({
    fullName: input.fullName,
    email: input.email,
    mobileNumber: input.mobileNumber,
    passwordHash,
  });

  const token = createToken({
    id: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role,
  });

  return { user: newUser, token };
};

export const loginUser = async (input: LoginInput): Promise<{ user: IUser; token: string }> => {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new AppError('Invalid email address or password.', 401);
  }

  if (!input.password) {
    throw new AppError('Password is required', 400);
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email address or password.', 401);
  }

  const token = createToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const getUserById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return user;
};

export const updateUserById = async (id: string, updates: { fullName?: string; mobileNumber?: string }): Promise<IUser> => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  if (updates.fullName) user.fullName = updates.fullName;
  if (updates.mobileNumber) user.mobileNumber = updates.mobileNumber;
  await user.save();
  return user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  
  // Generic security: do not reveal if email exists
  if (!user) {
    console.warn(`Forgot Password: User not found for email ${email}`);
    return;
  }

  // Generate secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token for database storage
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
  await user.save();

  // Dispatch email
  await sendPasswordResetEmail(user.email, resetToken);
};

export const resetUserPassword = async (token: string, newPassword?: string): Promise<void> => {
  if (!newPassword) {
    throw new AppError('New password is required.', 400);
  }

  // Hash user-provided token to match DB entry
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired.', 400);
  }

  // Update password and clear reset token details
  const saltRounds = 10;
  user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();
};

export const deleteUserAccount = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User account not found.', 404);
  }
  
  // Wipe user-owned records from related collections sequentially
  await EducationDetails.deleteMany({ userId: id });
  await StudentProfile.deleteMany({ userId: id });
  await AssessmentProgress.deleteMany({ userId: id });
  await AssessmentResult.deleteMany({ userId: id });
  await Recommendation.deleteMany({ userId: id });
  await UserResume.deleteMany({ userId: id });
  await SavedOpportunity.deleteMany({ userId: id });
  await UserAICredential.deleteMany({ userId: id });

  // Finally, wipe the user document itself
  await User.deleteOne({ _id: id });
};
