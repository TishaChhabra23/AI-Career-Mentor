# ROADMAP.md

# AI Career Mentor – Project Roadmap

---

# Project Vision

Develop a scalable AI-powered career guidance platform that assists users from **Class 10 to Employment** through personalized recommendations, assessments, learning roadmaps, resume analysis, internship guidance, and job recommendations using **Google Gemini (BYOK)**.

---

# Development Strategy

The project follows an incremental, milestone-driven approach.

```text
Planning
    │
    ▼
Foundation
    │
    ▼
Core Features
    │
    ▼
AI Features
    │
    ▼
Career Modules
    │
    ▼
Optimization
    │
    ▼
Deployment
```

---

# Phase 1 — Project Foundation

## Goal

Prepare the development environment and project architecture.

### Deliverables

* Project repository (organized with `frontend/`, `backend/`, `docs/`)
* React + Vite setup
* Express backend configuration
* MongoDB Atlas connection setup
* Seed datasets logic (`seed/` configuration)
* Tailwind CSS and shadcn/ui base setup
* Routing setup
* Environment configuration
* GitHub repository initialized

### Milestone

✅ Development environment and seed workflows ready.

---

# Phase 2 — Design System

## Goal

Create a consistent UI foundation.

### Deliverables

* Dark theme
* Typography
* Color palette
* Sidebar
* Navbar
* Cards
* Buttons
* Inputs
* Skeleton loaders
* Animations
* Responsive layouts

### Milestone

✅ Complete reusable UI component library.

---

# Phase 3 — User Management

## Goal

Implement secure authentication and onboarding.

### Deliverables

* Registration API and UI Form
* Login API and UI Form (secure HttpOnly JWT cookie setup)
* Forgot Password Request & Token Generation API (Nodemailer service setup)
* Reset Password Form & API
* User Data Deletion API (DELETE /api/v1/auth/account - deletes user DB documents & private Cloudinary resume attachments)
* Dynamic Education & Objective selection onboarding (capture level + objective details)
* Dynamic Student Profile Initialization (captures learningStyle for Class 12, experience array for PG/UG)
* Resource Ownership Auth middleware checks for student profiles

### Milestone

✅ Users can register, reset passwords, delete accounts, and complete dynamic onboarding.

---

# Phase 4 — Dashboard

## Goal

Develop the personalized dashboard.

### Deliverables

* Unified backend summary endpoint (`GET /api/v1/dashboard/summary` returning profile metrics, active test progress, roadmap summary, and recent actions)
* Dynamic welcome card
* Progress tracker
* Profile completion details
* Notifications summary
* Quick actions
* Dynamic widgets matching educationLevel + careerObjective combinations

### Milestone

✅ Dashboard summary API and dynamic UI operational for all levels and objectives.

---

# Phase 5 — AI Assessment Engine

## Goal

Implement dynamic assessments with auto-save progress and dynamic weight scoring.

### Deliverables

* Assessment progress tracking collection (`assessment_progress`)
* Auto-save answers selections API (PUT `/api/v1/assessments/:id/progress`)
* Resume assessment API (GET `/api/v1/assessments/:id/progress`)
* Dynamic Scoring Engine supporting dynamic Map mapping of section weights without hardcoded columns
* Numerical result storage with timestamps (`createdAt`, `updatedAt`)
* Class 11 Career Aptitude Assessment
* Class 12 Degree Selection Assessment
* Undergraduate Skill & Career Assessment
* Postgraduate Career Readiness Assessment
* UG/PG Internship Readiness Assessment (triggered by `find_internship` objective)
* UG/PG/Diploma Job Readiness Assessment (triggered by `find_job` objective)

### Milestone

✅ Assessment engine completed with autosave, resume, and dynamic Map scoring.

---

# Phase 6 — Google Gemini Integration

## Goal

Integrate Google Gemini (BYOK).

### Deliverables

* Gemini SDK config
* Prompt templates (standardized under `backend/prompts/`)
* Response Validation using backend Zod schemas (verify Gemini JSON outputs conform to expected schemas for Stream, Degree, Career, Skill Gap, Roadmaps, Resume, Internship, Job)
* Error handling and retry logic
* AI service layer configuration

### AI Features

* Stream Recommendation
* Degree Recommendation
* Career Recommendation
* Skill Gap Analysis
* Career Roadmap
* Learning Roadmap
* Resume Review
* Internship Guidance
* Job Guidance

### Milestone

✅ AI integration complete.

---

# Phase 7 — Recommendation System

## Goal

Provide personalized AI outputs.

### Deliverables

* Recommendation cards
* Confidence scores
* Explanations
* Alternative suggestions
* Save recommendations
* Regenerate recommendations

### Milestone

✅ Recommendation engine complete.

---

# Phase 8 — Career Development Modules

## Goal

Help users build long-term career plans.

### Deliverables

* Career Roadmap
* Learning Roadmap
* Skill Gap Analysis
* Certifications
* Suggested Projects

### Milestone

✅ Career development features complete.

---

# Phase 9 — Resume Module

## Goal

Enable secure resume uploads and custom structured resume building.

### Deliverables

* Uploaded Resume: Drag & drop PDF uploader UI
* Cloudinary secure uploads configuration: private storage settings + signed URL generation
* Backend: PDF local text parsing using `pdf-parse` (protects user privacy)
* Backend: Gemini text-only review (ATS scoring and layout improvement suggestions)
* Custom Resume Builder: Forms mapping structured personalInfo, summary, education, experience, skills, projects, certifications, and achievements
* Backend: Custom resume drafts endpoint (`POST/PUT/DELETE /api/v1/resumes/builder`) saved to `user_resumes` collection
* Frontend: Custom PDF export generation using `@react-pdf/renderer`

### Milestone

✅ Secure resume uploads, custom builder database drafts, and PDF generation complete.

---

# Phase 10 — Internship Module

## Goal

Recommend internships.

### Deliverables

* Internship listing
* AI matching
* Search
* Filters
* Save internships

### Milestone

✅ Internship recommendation complete.

---

# Phase 11 — Job Module

## Goal

Recommend jobs.

### Deliverables

* Job listing
* AI matching
* Salary insights
* Search
* Filters
* Save jobs

### Milestone

✅ Job recommendation complete.

---

# Phase 12 — Testing & Optimization

## Goal

Improve quality and performance.

### Deliverables

* Bug fixes
* API optimization
* Responsive testing
* Browser compatibility
* AI response validation
* Performance improvements
* Security validation

### Milestone

✅ Production-ready application.

---

# Phase 13 — Deployment

## Goal

Deploy the application.

### Frontend

* Vercel

### Backend

* Render or Railway

### Database

* MongoDB Atlas

### AI

* Google Gemini BYOK

### Storage

* Cloudinary

### Milestone

✅ Live application deployed.

---

# Release Plan

## Version 1.0

Core Features

* Authentication
* Education Details
* Student Profile
* Dashboard
* AI Assessments

---

## Version 1.5

AI Features

* Career Recommendations
* Degree Recommendations
* Career Roadmap
* Learning Roadmap

---

## Version 2.0

Career Features

* Resume Builder
* Internship Recommendations
* Job Recommendations

---

## Version 2.5

Enhancements

* Resume ATS Improvements
* Better AI Prompts
* Dashboard Analytics
* UI Refinements

---

## Version 3.0 (Future)

Future Features

* Parent Dashboard
* Mentor Dashboard
* Admin Panel
* AI Career Chatbot
* Voice AI Mentor
* Scholarship Finder
* Mock Interview Simulator
* Gamification
* Multi-language Support

---

# Priority Matrix

## High Priority

* Authentication
* Dashboard
* Education Details
* Student Profile
* AI Assessments
* Gemini Integration
* Recommendations

---

## Medium Priority

* Career Roadmap
* Learning Roadmap
* Resume Builder
* Internship Module
* Job Module

---

## Low Priority

* Analytics
* Parent Portal
* Mentor Portal
* Gamification
* Voice AI

---

# Risk Management

| Risk                  | Mitigation                            |
| --------------------- | ------------------------------------- |
| Gemini API failures   | Retry mechanism + fallback responses  |
| Slow AI responses     | Loading indicators + skeleton screens |
| Large datasets        | Indexed MongoDB collections           |
| Authentication issues | JWT validation + refresh strategy     |
| Resume upload errors  | File validation and size limits       |
| API downtime          | Centralized error handling            |

---

# Success Criteria

* Fully responsive UI
* Secure authentication
* Dynamic onboarding
* Education-specific assessments
* Personalized AI recommendations
* Resume analysis
* Internship and job recommendations
* Stable REST APIs
* Clean modular architecture
* Successful production deployment

---

# Final Outcome

The completed project will be a modern, AI-powered career guidance platform that supports users from **Class 10 through employment**, combining structured assessments, Google Gemini-powered recommendations, personalized roadmaps, resume intelligence, internship matching, and job guidance within a scalable full-stack architecture.
