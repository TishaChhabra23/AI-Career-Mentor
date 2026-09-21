import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience {
  company: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  profilePhoto?: string;
  interests: string[];
  favoriteSubjects: string[];
  strengths: string[];
  hobbies: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
  careerGoal?: string;
  preferredDegree?: string;
  linkedIn?: string;
  github?: string;
  resumeUploaded: boolean;
  careerObjective: 'explore_stream' | 'explore_degree' | 'explore_career' | 'find_internship' | 'find_job' | 'higher_studies';
  learningStyle?: string;
  experience: IExperience[];
  profileCompletion: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema({
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, trim: true }
}, { _id: false });

const StudentProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
      index: true,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    interests: {
      type: [String],
      default: [],
    },
    favoriteSubjects: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    hobbies: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    projects: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    careerGoal: {
      type: String,
      trim: true,
    },
    preferredDegree: {
      type: String,
      trim: true,
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    resumeUploaded: {
      type: Boolean,
      default: false,
    },
    careerObjective: {
      type: String,
      enum: ['explore_stream', 'explore_degree', 'explore_career', 'find_internship', 'find_job', 'higher_studies'],
      required: [true, 'Career objective is required'],
    },
    learningStyle: {
      type: String,
      trim: true,
    },
    experience: {
      type: [ExperienceSchema],
      default: [],
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Indexed by userId
StudentProfileSchema.index({ userId: 1 });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
