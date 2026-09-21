import mongoose, { Schema, Document } from 'mongoose';

export interface IEducationDetails extends Document {
  userId: mongoose.Types.ObjectId;
  educationLevel: 'Class10' | 'Class11' | 'Class12' | 'Diploma' | 'UG' | 'PG';
  schoolCollege?: string;
  boardUniversity?: string;
  currentClassSemester?: string;
  stream?: string;
  course?: string;
  percentageCGPA?: number;
  country?: string;
  state?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EducationDetailsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      index: true,
    },
    educationLevel: {
      type: String,
      enum: ['Class10', 'Class11', 'Class12', 'Diploma', 'UG', 'PG'],
      required: [true, 'Education level is required'],
    },
    schoolCollege: {
      type: String,
      trim: true,
    },
    boardUniversity: {
      type: String,
      trim: true,
    },
    currentClassSemester: {
      type: String,
      trim: true,
    },
    stream: {
      type: String,
      trim: true,
    },
    course: {
      type: String,
      trim: true,
    },
    percentageCGPA: {
      type: Number,
      min: [0, 'Grade percentage cannot be less than 0'],
      max: [100, 'Grade percentage cannot be greater than 100'],
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// userId compound index is evaluated
EducationDetailsSchema.index({ userId: 1 });

export const EducationDetails = mongoose.model<IEducationDetails>('EducationDetails', EducationDetailsSchema);
