import { EducationDetails, IEducationDetails } from '../models/EducationDetails';
import { AppError } from '../middleware/errorHandler';

export const getEducationByUserId = async (userId: string): Promise<IEducationDetails | null> => {
  return await EducationDetails.findOne({ userId });
};

export const createOrUpdateEducation = async (
  userId: string,
  data: Partial<IEducationDetails>
): Promise<IEducationDetails> => {
  // Ensure userId is not modified by request body values
  const payload = { ...data, userId };

  const education = await EducationDetails.findOneAndUpdate(
    { userId },
    payload,
    { new: true, upsert: true, runValidators: true }
  );

  return education;
};

export const deleteEducationByUserId = async (userId: string): Promise<void> => {
  const result = await EducationDetails.deleteOne({ userId });
  if (result.deletedCount === 0) {
    throw new AppError('No education details found to delete.', 404);
  }
};
