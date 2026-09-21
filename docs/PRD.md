# PRD.md

# AI Career Mentor – Product Requirements Document (PRD)

## 1. Project Overview

### Project Name

**AI Career Mentor: Personalized Career Guidance Platform (Class 10 to Employment)**

### Project Description

AI Career Mentor is an intelligent web platform that guides students and professionals through every major academic and career decision—from selecting the right stream after Class 10 to finding suitable jobs after graduation.

The platform combines user profiles, AI-powered assessments, personalized recommendations, learning roadmaps, resume analysis, internship guidance, and job recommendations into one unified system.

Unlike traditional career guidance portals, the platform adapts according to the user's education level and generates personalized recommendations using Google Gemini (BYOK).

---

# 2. Vision

Build an AI-powered career guidance platform that helps users make informed educational and career decisions at every stage of their journey.

---

# 3. Objectives

* Help Class 10 students choose the right stream.
* Help Class 11 students validate their career direction.
* Help Class 12 students choose the right degree and college.
* Help UG students identify skill gaps.
* Help PG students prepare for careers.
* Recommend internships.
* Recommend jobs.
* Generate personalized learning roadmaps.
* Build AI-powered resumes.
* Provide one unified platform from school to employment.

---

# 4. Target Users

## Primary Users

### Class 10 Students

Goal:
Choose the best stream.

### Class 11 Students

Goal:
Validate stream and explore careers.

### Class 12 Students

Goal:
Choose degree and college.

### Undergraduate Students

Goal:
Develop skills and prepare for internships.

### Postgraduate Students

Goal:
Prepare for placements and careers.

### Internship Seekers

Goal:
Find internships based on skills and interests (applicable to UG/PG students with the `find_internship` career objective).

### Job Seekers

Goal:
Receive AI-powered job recommendations (applicable to UG/PG/Diploma students with the `find_job` career objective).

---

# 5. User Journey

Create Account

↓

Education Details

↓

Select Career Objective

↓

Student Profile (Dynamic based on level + objective)

↓

Dashboard

↓

AI Assessment Engine (Dynamic based on level + objective)

↓

AI Recommendations

↓

Career Roadmap

↓

Learning Roadmap

↓

Resume Builder (Structured Builder / Uploaded PDF Analysis)

↓

Internship Recommendation (if Objective is find_internship)

↓

Job Recommendation (if Objective is find_job)

---

# 6. Education Levels and Career Objectives Supported

## Education Levels
* Class 10
* Class 11
* Class 12
* Diploma
* Undergraduate
* Postgraduate

## Career Objectives
* explore_stream (primarily Class 10/11)
* explore_degree (primarily Class 11/12)
* explore_career (Class 11/12, UG, PG)
* find_internship (primarily UG, PG)
* find_job (primarily UG, PG/Diploma)
* higher_studies (primarily Class 12, UG, PG)

---

# 7. AI Assessment Flow

## Class 10 (Objective: explore_stream)
No aptitude test.
AI generates stream recommendations using:
* Academic performance
* Favorite subjects
* Interests
* Strengths
* Hobbies
* Career aspirations
Output:
* Science
* Commerce
* Humanities

---

## Class 11 (Objective: explore_career / explore_stream)
Assessment:
Career Aptitude Assessment
Output:
* Career suggestions
* Stream validation
* Strength analysis

---

## Class 12 (Objective: explore_degree / higher_studies)
Assessment:
Degree Selection Assessment
Output:
* Degree recommendation
* College recommendation
* Career pathway / entrance exams

---

## Undergraduate (Objective: explore_career / higher_studies)
Assessment:
Skill & Career Assessment
Output:
* Skill gap analysis
* Career recommendation
* Learning roadmap

---

## Postgraduate (Objective: explore_career / higher_studies)
Assessment:
Career Readiness Assessment
Output:
* Job readiness
* Career roles
* Higher studies suggestions

---

## UG/PG + find_internship
Assessment:
Internship Readiness Assessment
Output:
* Internship recommendations
* Resume improvements
* Project suggestions

---

## UG/PG/Diploma + find_job
Assessment:
Job Readiness Assessment
Output:
* Job recommendations
* Interview readiness / preparation
* Career insights

---

# 8. Core Modules

### Authentication

* Register
* Login
* Forgot Password (Request Reset & Send email via Nodemailer)
* Reset Password (via secure tokens)
* Secure authentication (JWT)

### Education Details

* Dynamic fields based on education level

### Student Profile

* Dynamic profile forms based on level + objective
* Interests, Favorite Subjects, Strengths, Hobbies
* Skills, Projects, Certifications
* Work Experience (applicable for UG/PG/career-oriented profiles)
* Learning Style (primarily relevant to Class 12)

### Dashboard

* Personalized dashboard
* Progress tracker
* AI insights
* Dynamic recommendations based on level + objective
* Quick actions

### AI Assessment Engine

* Dynamic assessment loading with auto-save and resume progress functionality
* Objective and level-specific tests (Career Aptitude, Degree Selection, Skill & Career, Career Readiness, Internship Readiness, Job Readiness)

### AI Recommendation Engine

* Stream recommendation
* Degree recommendation
* Career recommendation
* Skill gap analysis
* Response validation using backend Zod schemas to verify structure

### Career Roadmap

* Personalized roadmap
* Milestones, Certifications, Projects
* Progress tracking and authorization checks for resource ownership

### Learning Roadmap

* Courses, Skills
* Weekly learning plan

### Resume Builder

* Uploaded Resume: Analysis, ATS suggestions, AI review (using private Cloudinary storage with signed URLs for security)
* Custom Resume Builder: Input structured details, edit drafts, export PDF (via @react-pdf/renderer)

### Internship Recommendation

* Internship matching from controlled seed datasets
* Readiness score
* Resume suggestions

### Job Recommendation

* Job matching from controlled seed datasets
* Career readiness
* Interview preparation

---

# 9. AI Features

The platform uses **Google Gemini (BYOK)** for:

* Career recommendations
* Stream recommendations
* Degree recommendations
* Learning roadmap generation
* Skill gap analysis
* Resume review
* Internship recommendations
* Job recommendations
* Personalized explanations

The backend performs:

* Assessment scoring
* Profile management
* Rule validation
* Data storage
* Recommendation orchestration

---

# 10. Functional Requirements

### Authentication

* User registration
* Secure login
* Password reset

### User Profile

* Dynamic forms
* Profile editing
* Education-specific fields

### Dashboard

* Personalized content
* Progress tracking
* Notifications

### Assessments

* Dynamic question sets
* Automatic scoring
* AI-powered reports

### Recommendations

* Personalized AI recommendations
* Confidence scores
* Detailed explanations

### Resume

* Build resume
* Analyze resume
* ATS feedback

### Internship

* Internship recommendations
* Readiness score

### Job

* Job recommendations
* Career readiness

---

# 11. Non-Functional Requirements

* Responsive design
* Dark modern UI
* Fast loading
* Skeleton loaders
* Secure authentication
* Mobile-friendly
* Scalable architecture
* REST API architecture
* Modular codebase

---

# 12. Technology Stack

Frontend
* React (19+)
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion
* TanStack Query
* React Hook Form
* Zod (Shared Validation)
* @react-pdf/renderer (Custom resume PDF generation)
* Recharts
* Sonner
* Lucide React

Backend
* Node.js
* Express.js
* Mongoose
* nodemailer (SMTP email dispatcher for password reset)
* zod (Shared schema validation for Gemini output)

Database
* MongoDB Atlas

Authentication
* JWT
* bcrypt

AI
* Google Gemini API (BYOK)

File Storage
* Cloudinary (Private upload settings + signed URLs for privacy)

Deployment
* Vercel (Frontend)
* Render / Railway (Backend)
* MongoDB Atlas

---

# 13. Success Criteria

* Personalized recommendations for every education stage.
* Dynamic onboarding and dashboard.
* AI-generated roadmaps and guidance.
* Responsive and modern user interface.
* Secure authentication and data management.
* End-to-end journey from Class 10 to employment.

---

# 14. Future Enhancements

* Voice-based AI mentor
* Multilingual support
* Parent dashboard
* Mentor portal
* AI interview simulator
* Scholarship recommendation engine
* Real-time job aggregation
* Gamification and achievement badges
