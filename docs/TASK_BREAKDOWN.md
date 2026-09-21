# TASK_BREAKDOWN.md

# AI Career Mentor – Task Breakdown

---

# Project Overview

This document divides the entire project into development phases, milestones, and implementation tasks. Each phase should be completed and tested before moving to the next.

---

# Development Workflow

```text
Planning
    │
    ▼
Frontend Foundation
    │
    ▼
Backend Foundation
    │
    ▼
Authentication
    │
    ▼
Education & Profile
    │
    ▼
Dashboard
    │
    ▼
AI Assessment Engine
    │
    ▼
AI Recommendation Engine
    │
    ▼
Career Modules
    │
    ▼
Resume Module
    │
    ▼
Internship & Job Modules
    │
    ▼
Testing
    │
    ▼
Deployment
```

---

# Phase 1 – Project Initialization

## Objective

Create the project structure and development environment.

### Tasks

* Initialize Git repository
* Create React (Vite) project
* Create Express backend (standardized under `backend/` folder)
* Configure MongoDB Atlas
* Configure environment variables (including SMTP mail variables: `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` in production)
* Configure project folder structure (using `frontend/`, `backend/`, `docs/`)
* Install frontend dependencies (including `@react-pdf/renderer` and `zod`)
* Install backend dependencies (including `nodemailer` and `zod`)
* Configure Tailwind CSS and shadcn/ui
* Configure React Router
* Configure ESLint and Prettier
* Create backend seed pipeline scripts (`backend/seed/jobs.seed.js`, `backend/seed/internships.seed.js`, `backend/seed/colleges.seed.js`, `backend/seed/courses.seed.js`, `backend/seed/certifications.seed.js`)

### Deliverable

Working frontend and backend boilerplate.

---

# Phase 2 – UI Foundation

## Objective

Develop reusable UI components.

### Tasks

* Layout component
* Sidebar
* Navbar
* Footer
* Buttons
* Cards
* Inputs
* Select
* Modal
* Dialog
* Skeleton Loader
* Progress Bar
* Avatar
* Toast Notifications

### Deliverable

Reusable design system.

---

# Phase 3 – Authentication Module

## Objective

Implement secure user authentication.

### Frontend Tasks

* Register Page
* Login Page
* Forgot Password
* Validation
* Loading States

### Backend Tasks

* Register API
* Login API (returns JWT)
* Forgot Password API (POST /api/v1/auth/forgot-password - generates secure token and dispatches email via Nodemailer)
* Reset Password API (POST /api/v1/auth/reset-password - validates and invalidates reset password token)
* Account Deletion API (DELETE /api/v1/auth/account - deletes user profile, results, progress, and private Cloudinary files)
* Resource Ownership middleware configuration (verify req.user.id matches target resource owner for all private entities)
* JWT Authentication middleware
* Password Hashing via bcrypt
* Protected Routes integration

### Deliverable

Secure authentication system.

---

# Phase 4 – Education Details Module

## Objective

Collect education information.

### Tasks

* Education & Objective Selection Form
* Career Objective enum selector ("explore_stream" | "explore_degree" | "explore_career" | "find_internship" | "find_job" | "higher_studies")
* Validation (React Hook Form + Zod)
* Save Education & Objective API
* Update Education & Objective API
* Fetch Education & Objective API

### Deliverable

Dynamic education module.

---

# Phase 5 – Student Profile Module

## Objective

Create dynamic profile forms.

### Tasks

### Class 10

* Interests
* Favorite Subjects
* Strengths
* Hobbies
* Career Goal

### Class 11

* Current Stream
* Interests
* Career Goal
* Strengths

### Class 12

* Preferred Degree
* Learning Style
* Career Goal

### UG

* Skills
* Projects
* Certifications
* Resume Upload
* LinkedIn
* GitHub

### PG

* Skills
* Experience
* Resume
* Career Goal

### Deliverable

Dynamic profile module.

---

# Phase 6 – Dashboard Module

## Objective

Develop personalized dashboard.

### Tasks

* Welcome Card
* Profile Completion Tracker
* Progress Tracker (checks active test progress)
* AI Recommendation Card (adapts based on Level + Objective combination)
* Quick Actions
* Notifications Summary
* Recent Activity Logs
* Career Insights Widget
* Backend: Unified dashboard API endpoint (`GET /api/v1/dashboard/summary`)

### Deliverable

Dynamic dashboard.

---

# Phase 7 – AI Assessment Engine

## Objective

Develop education-level assessments.

### Tasks

#### Class 10

* Profile-based AI Analysis
* Stream Recommendation

#### Class 11

* Career Aptitude Assessment
* Result Generation

#### Class 12

* Degree Selection Assessment
* Result Generation

#### UG

* Skill & Career Assessment

#### PG

* Career Readiness Assessment

#### Internship

* Internship Readiness Assessment

#### Employment

* Job Readiness Assessment

### Backend
* Assessment APIs:
  * `GET    /api/v1/assessments` (loads available assessments based on level + objective)
  * `GET    /api/v1/assessments/:id` (assessment detail)
  * `POST   /api/v1/assessments/:id/start` (initiates progress tracking)
  * `PUT    /api/v1/assessments/:id/progress` (autosaves partial answer selections)
  * `GET    /api/v1/assessments/:id/progress` (retrieves partial selections for resumption)
  * `POST   /api/v1/assessments/:id/submit` (scores test and clears progress)
  * `GET    /api/v1/assessments/:id/result` (retrieves scores and AI match data)
  * `GET    /api/v1/assessments/history` (lists completed assessment results history)
* Question Loader service
* Dynamic Scoring Engine supporting dynamic Map mapping of section weights without hardcoded database columns
* Result Storage with timestamps (`createdAt`, `updatedAt`)

### Deliverable

Dynamic assessment engine.

---

# Phase 8 – Google Gemini Integration

## Objective

Integrate Google Gemini (BYOK).

### Tasks

* Configure Gemini SDK
* Secure API Key
* Prompt Templates
* Prompt Builder
* Response Validation (Validate Gemini outputs strictly using backend Zod schemas: Stream, Degree, Career, Skill Gap, Roadmaps, Resume, Internship, Job)
* Zod validation middleware for Express API routing
* Error Handling
* Retry Mechanism

### Prompt Modules

* Stream Recommendation
* Career Recommendation
* Degree Recommendation
* Resume Review
* Learning Roadmap
* Career Roadmap
* Internship Recommendation
* Job Recommendation

### Deliverable

Working AI recommendation engine.

---

# Phase 9 – Recommendation Module

## Objective

Display AI-generated recommendations.

### Tasks

* Recommendation Cards
* Confidence Score
* Explanation Panel
* Career Options
* Skill Suggestions
* Save Recommendation
* Regenerate Recommendation

### Deliverable

Recommendation dashboard.

---

# Phase 10 – Career Roadmap

## Objective

Generate personalized career plans.

### Tasks

* Timeline View
* Milestones
* Certifications
* Projects
* Career Goals
* Progress Tracking
* Export Option

### Deliverable

Career roadmap module.

---

# Phase 11 – Learning Roadmap

## Objective

Generate learning plans.

### Tasks

* Weekly Plan
* Monthly Goals
* Course Suggestions
* Certification Suggestions
* Practice Projects
* Skill Tracking

### Deliverable

Learning roadmap module.

---

# Phase 12 – Resume Builder

## Objective

Create and analyze resumes.

### Tasks

* Custom Resume Builder: Forms for personalInfo, summary, education, experience, skills, projects, certifications, achievements
* Resume Builder Templates selection
* Frontend: PDF Export generation using `@react-pdf/renderer`
* Uploaded Resume: Drag & drop PDF file uploader UI
* Cloudinary secure uploads configuration: private storage settings + backend signed URL generation
* Backend: PDF local text parsing using `pdf-parse`
* Backend: Gemini prompts parsing text-only payloads
* Backend: Resume builder endpoint specs (`POST/PUT/DELETE /api/v1/resumes/builder`) saved to `user_resumes` collection
* Backend: ATS Analysis scoring & AI recommendations endpoints (`POST /api/v1/resumes/:id/analyze`)

### Deliverable

Resume builder module.

---

# Phase 13 – Internship Module

## Objective

Recommend internships.

### Tasks

* Internship Listing
* AI Matching
* Filters
* Search
* Internship Details
* Save Internship

### Deliverable

Internship recommendation module.

---

# Phase 14 – Job Module

## Objective

Recommend jobs.

### Tasks

* Job Listing
* AI Matching
* Search
* Filters
* Salary Display
* Job Details
* Save Job

### Deliverable

Job recommendation module.

---

# Phase 15 – Notifications

## Objective

Implement notification system.

### Tasks

* In-App Notifications
* Toast Messages
* Read/Unread Status
* Notification History

### Deliverable

Notification module.

---

# Phase 16 – Settings

## Objective

Allow user customization.

### Tasks

* Profile Settings
* Password Change
* Theme Settings
* Notification Preferences
* Account Management

### Deliverable

Settings module.

---

# Phase 17 – Testing

## Objective

Verify complete application.

### Tasks

* Unit Testing
* API Testing
* Form Validation
* Authentication Testing
* AI Response Validation
* Responsive Testing
* Cross-Browser Testing

### Deliverable

Stable application.

---

# Phase 18 – Deployment

## Objective

Deploy production application.

### Tasks

* Deploy Frontend (Vercel)
* Deploy Backend (Render/Railway)
* Configure MongoDB Atlas
* Configure Gemini API Key
* Configure Cloudinary
* Environment Variables
* Domain Configuration

### Deliverable

Production deployment.

---

# Milestones

| Milestone | Deliverable                         |
| --------- | ----------------------------------- |
| M1        | Project Setup Complete              |
| M2        | UI Foundation Complete              |
| M3        | Authentication Complete             |
| M4        | Education & Profile Complete        |
| M5        | Dashboard Complete                  |
| M6        | Assessment Engine Complete          |
| M7        | Gemini Integration Complete         |
| M8        | Recommendation Module Complete      |
| M9        | Career & Learning Roadmaps Complete |
| M10       | Resume Module Complete              |
| M11       | Internship & Job Modules Complete   |
| M12       | Testing & Deployment Complete       |

---

# Estimated Development Order

1. Project Setup
2. UI Components
3. Authentication
4. Education Details
5. Student Profile
6. Dashboard
7. Assessment Engine
8. Gemini Integration
9. Recommendations
10. Career Roadmap
11. Learning Roadmap
12. Resume Builder
13. Internship Module
14. Job Module
15. Notifications & Settings
16. Testing
17. Deployment

---

# Definition of Done

A phase is considered complete only when:

* Feature is fully implemented.
* UI matches the design system.
* Backend APIs are functional.
* Database operations are working.
* Validation is complete.
* Error handling is implemented.
* Responsive design is verified.
* AI integration (if applicable) is tested.
* Code passes linting and builds successfully.
