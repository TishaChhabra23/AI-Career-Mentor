import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Configure dotenv before importing models/db
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB, closeDB } from '../config/db';
import { Assessment } from '../models/Assessment';
import { AssessmentQuestion } from '../models/AssessmentQuestion';
import { Job } from '../models/Job';
import { Internship } from '../models/Internship';
import { seedJobs } from './jobs.seed';
import { seedInternships } from './internships.seed';

const seedData = async () => {
  try {
    console.log('Seeding: Cleaning up matching assessments and questions versions...');
    // Delete existing version 1 of our assessments/questions to avoid duplicates
    const testAssessTypes = [
      'class_11_stream',
      'class_12_degree',
      'ug_career',
      'pg_career',
      'internship_readiness',
      'job_readiness'
    ];

    const deletedAssessments = await Assessment.find({ type: { $in: testAssessTypes }, version: 1 });
    const deletedIds = deletedAssessments.map(a => a._id);

    await Assessment.deleteMany({ _id: { $in: deletedIds } });
    await AssessmentQuestion.deleteMany({ assessmentId: { $in: deletedIds } });

    console.log('Seeding: Creating assessments definitions...');

    // 1. Class 11 Stream Assessment
    const class11Assessment = await Assessment.create({
      assessmentName: 'Stream & Career Aptitude Assessment',
      type: 'class_11_stream',
      educationLevels: ['Class11'],
      careerObjectives: ['explore_stream'],
      description: 'Evaluating interests, reasoning capability, and styles to select Class 11 streams (Science/Commerce/Arts). (Development/Testing Question Set)',
      duration: 25,
      totalQuestions: 5,
      totalSections: 5,
      isActive: true,
      version: 1
    });

    // 2. Class 12 Degree Assessment
    const class12Assessment = await Assessment.create({
      assessmentName: 'Degree & Career Aptitude Assessment',
      type: 'class_12_degree',
      educationLevels: ['Class12'],
      careerObjectives: ['explore_degree'],
      description: 'Evaluating options to identify college degree pathways. (Development/Testing Question Set)',
      duration: 30,
      totalQuestions: 6,
      totalSections: 6,
      isActive: true,
      version: 1
    });

    // 3. UG Career Assessment
    const ugAssessment = await Assessment.create({
      assessmentName: 'Undergraduate Career Assessment',
      type: 'ug_career',
      educationLevels: ['UG', 'Diploma'],
      careerObjectives: ['explore_career', 'higher_studies'],
      description: 'Evaluating career fields orientation and soft skills capability for Undergraduate degrees. (Development/Testing Question Set)',
      duration: 30,
      totalQuestions: 6,
      totalSections: 6,
      isActive: true,
      version: 1
    });

    // 4. PG Career Assessment
    const pgAssessment = await Assessment.create({
      assessmentName: 'Postgraduate Career Assessment',
      type: 'pg_career',
      educationLevels: ['PG'],
      careerObjectives: ['explore_career', 'higher_studies'],
      description: 'Evaluating advanced competencies and professional goals. (Development/Testing Question Set)',
      duration: 35,
      totalQuestions: 7,
      totalSections: 7,
      isActive: true,
      version: 1
    });

    // 5. Internship Readiness
    const internshipAssessment = await Assessment.create({
      assessmentName: 'Internship Readiness Assessment',
      type: 'internship_readiness',
      educationLevels: ['UG', 'PG', 'Diploma'],
      careerObjectives: ['find_internship'],
      description: 'Analyzing technical skills and workplace preparation metrics for internships. (Development/Testing Question Set)',
      duration: 20,
      totalQuestions: 6,
      totalSections: 6,
      isActive: true,
      version: 1
    });

    // 6. Job Readiness
    const jobAssessment = await Assessment.create({
      assessmentName: 'Job & Career Readiness Assessment',
      type: 'job_readiness',
      educationLevels: ['UG', 'PG', 'Diploma'],
      careerObjectives: ['find_job'],
      description: 'Analyzing career strengths, core communication, and technical readiness for job applications. (Development/Testing Question Set)',
      duration: 30,
      totalQuestions: 6,
      totalSections: 6,
      isActive: true,
      version: 1
    });

    console.log('Seeding: Creating questions bank...');

    // Questions list helper
    const questions = [
      // ==== Class 11 Stream Questions ====
      {
        assessmentId: class11Assessment._id,
        assessmentVersion: 1,
        sectionId: 'quantitative_aptitude',
        sectionName: 'Quantitative Aptitude',
        questionType: 'mcq' as const,
        question: 'What is 15% of 200?',
        options: ['20', '30', '40', '50'],
        correctAnswer: '30',
        weightage: 1,
        order: 1
      },
      {
        assessmentId: class11Assessment._id,
        assessmentVersion: 1,
        sectionId: 'logical_reasoning',
        sectionName: 'Logical Reasoning',
        questionType: 'mcq' as const,
        question: 'Which number completes the series: 2, 4, 8, 16, ...?',
        options: ['20', '24', '32', '64'],
        correctAnswer: '32',
        weightage: 1,
        order: 2
      },
      {
        assessmentId: class11Assessment._id,
        assessmentVersion: 1,
        sectionId: 'verbal_ability',
        sectionName: 'Verbal Ability',
        questionType: 'mcq' as const,
        question: 'Identify the synonym of "Pragmatic":',
        options: ['Practical', 'Idealistic', 'Arrogant', 'Unstable'],
        correctAnswer: 'Practical',
        weightage: 1,
        order: 3
      },
      {
        assessmentId: class11Assessment._id,
        assessmentVersion: 1,
        sectionId: 'interests',
        sectionName: 'Interest & Preference',
        questionType: 'likert' as const,
        question: 'I enjoy experimenting with electronic circuits, hardware, or coding simple games.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoringMetadata: {
          optionScores: {
            'Strongly Disagree': 1,
            'Disagree': 2,
            'Neutral': 3,
            'Agree': 4,
            'Strongly Agree': 5
          }
        },
        weightage: 1,
        order: 4
      },
      {
        assessmentId: class11Assessment._id,
        assessmentVersion: 1,
        sectionId: 'personality',
        sectionName: 'Personality / Work Style',
        questionType: 'likert' as const,
        question: 'I prefer working alone on creative ideas rather than playing group sports.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoringMetadata: {
          optionScores: {
            'Strongly Disagree': 1,
            'Disagree': 2,
            'Neutral': 3,
            'Agree': 4,
            'Strongly Agree': 5
          }
        },
        weightage: 1,
        order: 5
      },

      // ==== Class 12 Degree Questions ====
      {
        assessmentId: class12Assessment._id,
        assessmentVersion: 1,
        sectionId: 'interest_profile',
        sectionName: 'Interest Profile',
        questionType: 'likert' as const,
        question: 'I like building, manufacturing, or organizing systems.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 1
      },
      {
        assessmentId: class12Assessment._id,
        assessmentVersion: 1,
        sectionId: 'subject_strength',
        sectionName: 'Subject Strength',
        questionType: 'likert' as const,
        question: 'I excel in mathematics and logic problems.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 2
      },
      {
        assessmentId: class12Assessment._id,
        assessmentVersion: 1,
        sectionId: 'logical_reasoning',
        sectionName: 'Logical Reasoning',
        questionType: 'mcq' as const,
        question: 'If CAT = 24, what is DOG equal to? (C=3, A=1, T=20)',
        options: ['22', '26', '28', '30'],
        correctAnswer: '26',
        weightage: 1,
        order: 3
      },
      {
        assessmentId: class12Assessment._id,
        assessmentVersion: 1,
        sectionId: 'quantitative_ability',
        sectionName: 'Quantitative Ability',
        questionType: 'mcq' as const,
        question: 'A car covers 120 km in 2 hours. What is its speed in m/s?',
        options: ['16.67 m/s', '20 m/s', '30 m/s', '60 m/s'],
        correctAnswer: '16.67 m/s',
        weightage: 1,
        order: 4
      },
      {
        assessmentId: class12Assessment._id,
        assessmentVersion: 1,
        sectionId: 'career_preference',
        sectionName: 'Career Preference',
        questionType: 'likert' as const,
        question: 'I want a career that involves helping people or counseling.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 5
      },
      {
        assessmentId: class12Assessment._id,
        assessmentVersion: 1,
        sectionId: 'personality',
        sectionName: 'Personality / Work Style',
        questionType: 'likert' as const,
        question: 'I am highly comfortable presenting in front of large audiences.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 6
      },

      // ==== UG Career Questions ====
      {
        assessmentId: ugAssessment._id,
        assessmentVersion: 1,
        sectionId: 'technical_orientation',
        sectionName: 'Technical Orientation',
        questionType: 'likert' as const,
        question: 'I enjoy writing code, solving software design problems, or configuring networks.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 1
      },
      {
        assessmentId: ugAssessment._id,
        assessmentVersion: 1,
        sectionId: 'problem_solving',
        sectionName: 'Problem Solving',
        questionType: 'mcq' as const,
        question: 'Which logic gate returns TRUE only when both inputs are different?',
        options: ['AND', 'OR', 'XOR', 'NAND'],
        correctAnswer: 'XOR',
        weightage: 1,
        order: 2
      },
      {
        assessmentId: ugAssessment._id,
        assessmentVersion: 1,
        sectionId: 'logical_reasoning',
        sectionName: 'Logical Reasoning',
        questionType: 'mcq' as const,
        question: 'Complete: Book is to Author as Song is to:',
        options: ['Singer', 'Composer', 'Writer', 'Producer'],
        correctAnswer: 'Composer',
        weightage: 1,
        order: 3
      },
      {
        assessmentId: ugAssessment._id,
        assessmentVersion: 1,
        sectionId: 'communication',
        sectionName: 'Communication',
        questionType: 'likert' as const,
        question: 'I can explain complex technological concepts to a non-technical person clearly.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 4
      },
      {
        assessmentId: ugAssessment._id,
        assessmentVersion: 1,
        sectionId: 'professional_interests',
        sectionName: 'Professional Interests',
        questionType: 'likert' as const,
        question: 'I prefer working on business development, client proposals, or startup strategies.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 5
      },
      {
        assessmentId: ugAssessment._id,
        assessmentVersion: 1,
        sectionId: 'work_style',
        sectionName: 'Work Style',
        questionType: 'likert' as const,
        question: 'I work best in agile, collaborative team settings under pressure.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 6
      },

      // ==== PG Career Questions ====
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'advanced_career',
        sectionName: 'Advanced Career Orientation',
        questionType: 'likert' as const,
        question: 'I enjoy leading complex projects, mentoring juniors, or drafting architectures.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 1
      },
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'tech_strengths',
        sectionName: 'Technical/Professional Strengths',
        questionType: 'likert' as const,
        question: 'I keep track of latest research publications, AI models, or framework patches.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 2
      },
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'problem_solving',
        sectionName: 'Problem Solving',
        questionType: 'mcq' as const,
        question: 'Which algorithmic paradigm divides a problem into subproblems, solves them, and stores results to avoid re-computation?',
        options: ['Greedy Method', 'Divide and Conquer', 'Dynamic Programming', 'Backtracking'],
        correctAnswer: 'Dynamic Programming',
        weightage: 1,
        order: 3
      },
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'communication',
        sectionName: 'Communication',
        questionType: 'likert' as const,
        question: 'I feel comfortable writing academic or white papers representing system logic.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 4
      },
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'prof_interests',
        sectionName: 'Professional Interests',
        questionType: 'likert' as const,
        question: 'I am interested in executive leadership paths (e.g. CTO, CIO).',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 5
      },
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'work_style',
        sectionName: 'Work Style',
        questionType: 'likert' as const,
        question: 'I am highly adaptable to changes in organizational structures.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 6
      },
      {
        assessmentId: pgAssessment._id,
        assessmentVersion: 1,
        sectionId: 'career_readiness',
        sectionName: 'Career Readiness',
        questionType: 'likert' as const,
        question: 'I feel completely prepared to apply to high-profile companies.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 7
      },

      // ==== Internship Readiness ====
      {
        assessmentId: internshipAssessment._id,
        assessmentVersion: 1,
        sectionId: 'tech_skills',
        sectionName: 'Technical Skills',
        questionType: 'likert' as const,
        question: 'I possess core coding capability matching modern tech stacks (e.g. JavaScript, Python).',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 1
      },
      {
        assessmentId: internshipAssessment._id,
        assessmentVersion: 1,
        sectionId: 'projects_experience',
        sectionName: 'Projects & Practical Experience',
        questionType: 'likert' as const,
        question: 'I have deployed at least one functional project on public hosts (e.g. GitHub Pages, Vercel).',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 2
      },
      {
        assessmentId: internshipAssessment._id,
        assessmentVersion: 1,
        sectionId: 'communication',
        sectionName: 'Communication',
        questionType: 'likert' as const,
        question: 'I am comfortable asking seniors for clarifications when requirements are vague.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 3
      },
      {
        assessmentId: internshipAssessment._id,
        assessmentVersion: 1,
        sectionId: 'problem_solving',
        sectionName: 'Problem Solving',
        questionType: 'mcq' as const,
        question: 'Which data structure follows the First-In, First-Out (FIFO) access pattern?',
        options: ['Stack', 'Queue', 'Binary Tree', 'Hash Map'],
        correctAnswer: 'Queue',
        weightage: 1,
        order: 4
      },
      {
        assessmentId: internshipAssessment._id,
        assessmentVersion: 1,
        sectionId: 'prof_readiness',
        sectionName: 'Professional Readiness',
        questionType: 'likert' as const,
        question: 'I practice standard code styling conventions and write code comments.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 5
      },
      {
        assessmentId: internshipAssessment._id,
        assessmentVersion: 1,
        sectionId: 'learning_adaptability',
        sectionName: 'Learning & Adaptability',
        questionType: 'likert' as const,
        question: 'I am happy to pick up an entirely new framework or language on the job.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 6
      },

      // ==== Job Readiness ====
      {
        assessmentId: jobAssessment._id,
        assessmentVersion: 1,
        sectionId: 'tech_skills',
        sectionName: 'Technical Skills',
        questionType: 'likert' as const,
        question: 'I am familiar with cloud environments (AWS/GCP), CI/CD setups, and testing frameworks.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 1
      },
      {
        assessmentId: jobAssessment._id,
        assessmentVersion: 1,
        sectionId: 'problem_solving',
        sectionName: 'Problem Solving',
        questionType: 'mcq' as const,
        question: 'What is the time complexity of searching in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 'O(log n)',
        weightage: 1,
        order: 2
      },
      {
        assessmentId: jobAssessment._id,
        assessmentVersion: 1,
        sectionId: 'communication',
        sectionName: 'Communication',
        questionType: 'likert' as const,
        question: 'I can resolve conflicts inside collaborative project teams constructively.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 3
      },
      {
        assessmentId: jobAssessment._id,
        assessmentVersion: 1,
        sectionId: 'prof_knowledge',
        sectionName: 'Professional Knowledge',
        questionType: 'likert' as const,
        question: 'I actively keep up with systems architectural design best practices.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 4
      },
      {
        assessmentId: jobAssessment._id,
        assessmentVersion: 1,
        sectionId: 'workplace_readiness',
        sectionName: 'Workplace Readiness',
        questionType: 'likert' as const,
        question: 'I understand standard business protocols, meetings operations, and standups.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 5
      },
      {
        assessmentId: jobAssessment._id,
        assessmentVersion: 1,
        sectionId: 'career_preferences',
        sectionName: 'Career Preferences',
        questionType: 'likert' as const,
        question: 'I prefer working under structured, target-driven corporate environments.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        weightage: 1,
        order: 6
      }
    ];

    await AssessmentQuestion.insertMany(questions);

    console.log('Seeding: Cleaning up jobs and internships...');
    await Job.deleteMany({});
    await Internship.deleteMany({});

    console.log('Seeding: Seeding platform jobs...');
    // Make sure seed data has isTestData: true (defaults to true on schema)
    await Job.insertMany(seedJobs);

    console.log('Seeding: Seeding platform internships...');
    // Make sure seed data has isTestData: true (defaults to true on schema)
    await Internship.insertMany(seedInternships);

    console.log('Seeding: Completed all seed data insertions successfully.');
  } catch (err) {
    console.error('Error during seeding:', err);
    throw err;
  }
};

const run = async () => {
  await connectDB();
  await seedData();
  await closeDB();
};

run();
