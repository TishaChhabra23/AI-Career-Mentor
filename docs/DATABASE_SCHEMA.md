# DATABASE_SCHEMA.md

# AI Career Mentor – Database Schema (MongoDB)

## Database Overview

Database Name:

```
ai_career_mentor
```

The application uses MongoDB Atlas and stores data in separate collections based on modules.

---

# Collections

1. users
2. education_details
3. student_profiles
4. assessments
5. assessment_questions
6. assessment_results
7. recommendations
8. career_roadmaps
9. learning_roadmaps
10. resumes
11. internships
12. jobs
13. notifications
14. colleges
15. courses
16. certifications
17. settings
18. assessment_progress
19. user_resumes

---

# 1. users

Purpose

Stores authentication information.

```javascript
{
  _id: ObjectId,

  fullName: String,

  email: String,

  mobileNumber: String,

  password: String,

  role: "student",

  emailVerified: Boolean,

  resetPasswordToken: String,

  resetPasswordExpires: Date,

  createdAt: Date,

  updatedAt: Date
}
```

Indexes

* email (Unique)
* mobileNumber

---

# 2. education_details

Purpose

Stores user's academic information.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   educationLevel:
      "Class10" |
      "Class11" |
      "Class12" |
      "Diploma" |
      "UG" |
      "PG",

   schoolCollege: String,

   boardUniversity: String,

   currentClassSemester: String,

   stream: String,

   course: String,

   percentageCGPA: Number,

   country: String,

   state: String,

   city: String,

   updatedAt: Date
}
```

---

# 3. student_profiles

Purpose

Stores dynamic profile information.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   profilePhoto: String,

   interests: [],

   favoriteSubjects: [],

   strengths: [],

   hobbies: [],

   skills: [],

   projects: [],

   certifications: [],

   careerGoal: String,

   preferredDegree: String,

   linkedIn: String,

   github: String,

   resumeUploaded: Boolean,

   careerObjective:
      "explore_stream" |
      "explore_degree" |
      "explore_career" |
      "find_internship" |
      "find_job" |
      "higher_studies",

   learningStyle: String,

   experience: [
      {
         company: String,
         role: String,
         startDate: Date,
         endDate: Date,
         description: String
      }
   ],

   profileCompletion: Number,

   createdAt: Date,

   updatedAt: Date
}
```

---

# 4. assessments

Purpose

Stores available assessments.

```javascript
{
   _id: ObjectId,

   assessmentName: String,

   educationLevel: String,

   description: String,

   duration: Number,

   totalQuestions: Number,

   totalSections: Number,

   isActive: Boolean
}
```

Example

* Career Aptitude Assessment
* Degree Selection Assessment
* Skill & Career Assessment
* Career Readiness Assessment
* Internship Readiness Assessment
* Job Readiness Assessment

---

# 5. assessment_questions

Purpose

Stores all questions.

```javascript
{
   _id: ObjectId,

   assessmentId: ObjectId,

   sectionName: String,

   questionType:
      "mcq" |
      "likert" |
      "scenario" |
      "situational" |
      "self-rating",

   question: String,

   options: [],

   correctAnswer: String,

   weightage: Number
}
```

---

# 6. assessment_results

Purpose

Stores user assessment scores.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   assessmentId: ObjectId,

   sectionScores: {
      type: Map,
      of: Number
   },

   overallScore: Number,

   completedAt: Date,

   createdAt: Date,

   updatedAt: Date
}
```

---

# 7. recommendations

Purpose

Stores AI-generated recommendations.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   assessmentId: ObjectId,

   recommendationType:
      "stream" |
      "career" |
      "degree" |
      "college" |
      "internship" |
      "job",

   generatedBy: "gemini",

   confidenceScore: Number,

   recommendation: {},

   createdAt: Date
}
```

Example Recommendation

```javascript
{
   recommendationType: "career",

   recommendation: {

      primaryCareer: "AI Engineer",

      alternativeCareers: [

          "Data Scientist",

          "ML Engineer",

          "Cloud Engineer"

      ],

      explanation: "...",

      skillsToLearn: []
   }
}
```

---

# 8. career_roadmaps

Purpose

Stores personalized AI career plans.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   roadmapTitle: String,

   milestones: [],

   timeline: [],

   createdAt: Date
}
```

---

# 9. learning_roadmaps

Purpose

Stores personalized learning plans.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   targetCareer: String,

   weeklyPlan: [],

   recommendedCourses: [],

   certifications: [],

   projects: []
}
```

---

# 10. resumes

Purpose

Stores resume information.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   resumeUrl: String,

   atsScore: Number,

   strengths: [],

   weaknesses: [],

   improvementSuggestions: [],

   analyzedAt: Date
}
```

---

# 11. internships

Purpose

Stores internship opportunities.

```javascript
{
   _id: ObjectId,

   company: String,

   role: String,

   location: String,

   mode: String,

   skillsRequired: [],

   stipend: String,

   applicationLink: String
}
```

---

# 12. jobs

Purpose

Stores job opportunities.

```javascript
{
   _id: ObjectId,

   company: String,

   jobRole: String,

   location: String,

   experienceRequired: String,

   salaryRange: String,

   skillsRequired: [],

   applicationLink: String
}
```

---

# 13. notifications

Purpose

Stores notifications.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   title: String,

   message: String,

   type: String,

   isRead: Boolean,

   createdAt: Date
}
```

---

# 14. colleges

Purpose

Stores colleges for AI recommendations.

```javascript
{
   _id: ObjectId,

   collegeName: String,

   state: String,

   city: String,

   coursesOffered: [],

   entranceExams: [],

   ranking: Number,

   website: String
}
```

---

# 15. courses

Purpose

Stores degree/course information.

```javascript
{
   _id: ObjectId,

   courseName: String,

   duration: String,

   eligibility: String,

   careerOptions: [],

   requiredSkills: []
}
```

---

# 16. certifications

Purpose

Stores recommended certifications.

```javascript
{
   _id: ObjectId,

   title: String,

   provider: String,

   level: String,

   duration: String,

   skillsCovered: [],

   url: String
}
```

---

# 17. settings

Purpose

Stores user preferences.

```javascript
{
   _id: ObjectId,

   userId: ObjectId,

   theme: "dark",

   accentColor: "purple",

   notificationsEnabled: true,

   language: "English",

   createdAt: Date,

   updatedAt: Date
}

---

# 18. assessment_progress

Purpose
Stores partial answers and active test progress to allow user resumption.

```javascript
{
  _id: ObjectId,

  userId: ObjectId,

  assessmentId: ObjectId,

  answers: [
    {
      questionId: ObjectId,
      selectedOption: String,
      answeredAt: Date
    }
  ],

  currentQuestionIndex: Number,

  startedAt: Date,

  lastSavedAt: Date,

  isCompleted: Boolean,

  completedAt: Date,

  createdAt: Date,

  updatedAt: Date
}
```

---

# 19. user_resumes

Purpose
Stores custom-built structured resumes.

```javascript
{
  _id: ObjectId,

  userId: ObjectId,

  templateId: String,

  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    linkedin: String,
    github: String
  },

  summary: String,

  education: [
    {
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      grade: String
    }
  ],

  experience: [
    {
      company: String,
      role: String,
      startDate: Date,
      endDate: Date,
      description: String
    }
  ],

  skills: [String],

  projects: [
    {
      title: String,
      description: String,
      technologies: [String],
      link: String
    }
  ],

  certifications: [
    {
      name: String,
      issuer: String,
      date: Date,
      url: String
    }
  ],

  achievements: [String],

  createdAt: Date,

  updatedAt: Date
}
```
```

---

# Collection Relationships

```text
users
  │
  ├── education_details
  │
  ├── student_profiles
  │
  ├── assessment_results
  │
  ├── assessment_progress
  │
  ├── recommendations
  │
  ├── career_roadmaps
  │
  ├── learning_roadmaps
  │
  ├── resumes
  │
  ├── user_resumes
  │
  ├── notifications
  │
  └── settings

assessments
  │
  └── assessment_questions

recommendations
  │
  ├── colleges
  │
  ├── courses
  │
  ├── internships
  │
  ├── jobs
  │
  └── certifications
```

---

# Suggested Indexes

### users
* email (Unique)
* mobileNumber

### education_details
* userId
* educationLevel

### student_profiles
* userId
* careerObjective

### assessment_results
* userId
* assessmentId
* { userId: 1, assessmentId: 1 } (Compound)

### assessment_progress
* userId
* { userId: 1, assessmentId: 1, isCompleted: 1 } (Compound)

### recommendations
* userId
* recommendationType
* { userId: 1, recommendationType: 1 } (Compound)

### resumes
* userId

### user_resumes
* userId

### internships
* role
* skillsRequired
* location

### jobs
* jobRole
* skillsRequired
* location

---

# Estimated Database Size

| Collection           | Expected Documents |
| -------------------- | ------------------ |
| users                | 10,000+            |
| education_details    | 10,000+            |
| student_profiles     | 10,000+            |
| assessment_questions | 500–700            |
| assessment_results   | 50,000+            |
| assessment_progress  | 10,000+            |
| recommendations      | 50,000+            |
| internships          | 5,000+             |
| jobs                 | 10,000+            |
| colleges             | 2,000+             |
| courses              | 300+               |
| certifications       | 1,000+             |
| user_resumes         | 5,000+             |

---

# Database Design Principles

* MongoDB document-based architecture
* One profile per user
* Separate collections for each major module
* Indexed frequently queried fields
* Scalable for future features
* Optimized for AI-generated recommendations
* Easy integration with Google Gemini (BYOK)
