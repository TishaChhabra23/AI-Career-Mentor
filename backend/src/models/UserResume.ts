import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface IEducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startDate?: Date;
  endDate?: Date;
  grade?: string;
}

export interface IExperienceEntry {
  company: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
}

export interface IProjectEntry {
  title: string;
  description?: string;
  technologies?: string[];
  link?: string;
}

export interface ICertificationEntry {
  name: string;
  issuer?: string;
  date?: Date;
  url?: string;
}

export interface IUserResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  templateId: string;
  personalInfo: IPersonalInfo;
  summary?: string;
  education?: IEducationEntry[];
  experience?: IExperienceEntry[];
  skills?: string[];
  projects?: IProjectEntry[];
  certifications?: ICertificationEntry[];
  achievements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PersonalInfoSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  linkedin: { type: String },
  github: { type: String }
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  grade: { type: String }
}, { _id: false });

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String }
}, { _id: false });

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  link: { type: String }
}, { _id: false });

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String },
  date: { type: Date },
  url: { type: String }
}, { _id: false });

const UserResumeSchema = new Schema<IUserResume>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  templateId: { type: String, default: 'modern', required: true },
  personalInfo: { type: PersonalInfoSchema, required: true },
  summary: { type: String },
  education: { type: [EducationSchema], default: [] },
  experience: { type: [ExperienceSchema], default: [] },
  skills: { type: [String], default: [] },
  projects: { type: [ProjectSchema], default: [] },
  certifications: { type: [CertificationSchema], default: [] },
  achievements: { type: [String], default: [] }
}, {
  timestamps: true
});

export const UserResume = mongoose.model<IUserResume>('UserResume', UserResumeSchema, 'user_resumes');
