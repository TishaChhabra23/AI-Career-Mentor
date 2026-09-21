# SDD.md

# AI Career Mentor – Software Design Document (SDD)

---

# 1. Introduction

## Purpose

This document describes the software design of the AI Career Mentor platform, including the application architecture, UI structure, backend modules, AI integration, database interactions, and user workflows.

---

# 2. Design Goals

* Modular Architecture
* Reusable Components
* Responsive Design
* AI-First Experience
* Secure Authentication
* Scalable Backend
* Easy Maintenance
* Clean User Experience

---

# 3. High-Level Architecture

```text
                    React Frontend
                          │
                          ▼
                 Express REST API
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
   MongoDB Atlas     Google Gemini     Cloudinary
```

---

# 4. Frontend Design

## Design Theme

* Dark Mode
* Minimalistic
* Modern SaaS
* AI-focused
* Responsive
* Smooth Animations
* Skeleton Loading

---

## Frontend Folder Structure

```text
src/

├── assets/
├── components/
│   ├── common/
│   ├── dashboard/
│   ├── assessment/
│   ├── roadmap/
│   ├── resume/
│   ├── jobs/
│   └── internships/
│
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
├── constants/
└── types/
```

---

# 5. Application Pages

## Public Pages

* Landing Page
* Login
* Register
* Forgot Password

---

## Protected Pages

* Dashboard
* Education Details
* Student Profile
* Assessment
* AI Recommendations
* Career Roadmap
* Learning Roadmap
* Resume Builder
* Internship Portal
* Job Portal
* Settings

---

# 6. Dashboard Design

The Dashboard is the central application hub. To ensure fast loading times and unified rendering, the frontend fetches dashboard summary details via a single endpoint: `GET /api/v1/dashboard/summary`.

### Summary Payload Elements
* **UserInfo**: Name, Email, Role
* **EducationLevel**: Current academic status
* **CareerObjective**: Selected primary target
* **ProfileCompletion**: Percentage score
* **AssessmentStatus**: Current active test and completed history summary
* **LatestRecommendation**: AI recommendation summary details
* **CurrentRoadmap**: Milestones tracker overview
* **NextRecommendedAction**: Contextual task (e.g. "Complete profile", "Resume assessment", "Explore matched jobs")
* **NotificationsSummary**: Unread notification counts
* **RecentActivity**: Logs of user activities

### Dynamic Content Loading
Layout widgets adjust dynamically based on the combination of `educationLevel` and `careerObjective`:
* **Class 10 + explore_stream**: Loads stream recommendation cards, favorite subjects summary (No assessment cards).
* **Class 11/12 + explore_degree**: Renders aptitude/degree assessment widgets, matched colleges lists, and preparation details.
* **UG/PG + explore_career**: Displays skill gap charts, learning roadmap course lists, and resume build reminders.
* **UG/PG + find_internship / find_job**: Prioritizes resume ATS scores, matched internship/job listing cards, and salary comparison widgets.

---

# 7. Student Profile Design

The student profile is a single dynamic module containing fields that render selectively based on level + objective.

## Class 10
* Interests (array)
* Favorite Subjects (array)
* Strengths (array)
* Hobbies (array)
* Career Goals / Aspirations

---

## Class 11
* Current Stream
* Interests (array)
* Career Goal
* Strengths (array)
* Hobbies (array)

---

## Class 12
* Current Stream
* Career Goal
* Preferred Degree
* Interests (array)
* Learning Style (primarily relevant to Class 12 studies)

---

## UG / Diploma
* Skills (array)
* Projects (array)
* Certifications (array)
* Experience (array of previous jobs, if applicable)
* Resume (Uploaded PDF URL / Custom Resume draft)
* LinkedIn URL
* GitHub URL
* Career Objective

---

## PG
* Skills (array)
* Experience (array of custom jobs, containing company, role, startDate, endDate, description)
* Certifications (array)
* Resume (Uploaded PDF URL / Custom Resume draft)
* LinkedIn URL
* GitHub URL
* Career Goal
* Career Objective

---

# 8. Assessment Design

Assessment Engine dynamically loads questions based on the user's education level.

Assessment Types

* Career Aptitude Assessment
* Degree Selection Assessment
* Skill & Career Assessment
* Career Readiness Assessment
* Internship Readiness Assessment
* Job Readiness Assessment

Question Types

* Multiple Choice
* Likert Scale
* Scenario Based
* Situational Judgment
* Self Rating

---

# 9. AI Recommendation Module

Input Sources

* Student Profile
* Education Details
* Assessment Results
* Skills
* Career Goals

Processing

```text
Profile
    +
Education
    +
Assessment
    +
Skills
      │
      ▼
 Prompt Builder
      │
      ▼
 Google Gemini
      │
      ▼
 Structured Recommendation
```

Output

* Stream Recommendation
* Degree Recommendation
* Career Recommendation
* Skill Gap Analysis
* Learning Roadmap
* Internship Recommendation
* Job Recommendation

---

# 10. Resume Module

Features
* Create Resume Draft (Saves structured data fields to `user_resumes` collection)
* Upload Resume Attachment (Secure file upload to private Cloudinary storage)
* Resume Analysis (Local PDF text extraction followed by AI analysis)
* ATS Score Calculation
* AI Improvement Suggestions (ATS layout, key terms, grammar, layout errors)
* Download PDF (Frontend resume template generation via `@react-pdf/renderer`)

Workflow A: Uploaded Resume Flow
```text
Upload Resume PDF ➔ Cloudinary Private Upload ➔ Generate Secure Signed URL
       │
       ▼
Local Text Extraction (pdf-parse)
       │
       ▼
Gemini Prompts (Text-only payload for privacy)
       │
       ▼
Zod Schema Validation (Verify outputs conform to score metrics)
       │
       ▼
Save ATS Scores & Suggestions to MongoDB
```

Workflow B: Custom Resume Builder Flow
```text
Input personalInfo/education/experience/projects fields in UI
       │
       ▼
POST/PUT custom drafts to /api/v1/resumes/builder (stored in user_resumes collection)
       │
       ▼
Select template style ➔ React renders layout using @react-pdf/renderer
       │
       ▼
Download PDF locally on client side
```

---

# 11. Career Roadmap Module

AI generates

* Milestones
* Skills
* Certifications
* Projects
* Timeline

User Actions

* Save Roadmap
* Regenerate
* Export

---

# 12. Learning Roadmap

Features

* Weekly Learning Plan
* Monthly Goals
* Recommended Courses
* Recommended Certifications
* Practice Projects

---

# 13. Internship Module

Displays

* Internship Recommendations
* Readiness Score
* Skills Required
* Resume Suggestions

Actions

* Save
* Apply
* View Details

---

# 14. Job Module

Displays

* Job Recommendations
* Match Percentage
* Salary Insights
* Required Skills
* Interview Preparation

Actions

* Save Job
* Apply
* View Details

---

# 15. Backend Design

Backend Pattern: MVC + Service Layer + Resource Authorization Checks

```text
Routes
  │
  ▼
Authorization Middleware (Verify Resource Ownership check)
  │
  ▼
Controllers (Validate inputs & Orchestrate response)
  │
  ▼
Services (Calculates scores, executes Gemini API prompt builders)
  │
  ▼
Repositories (Interface with MongoDB)
  │
  ▼
MongoDB Atlas
```

### Authorization Check Middleware Details
To prevent unauthorized cross-user queries, a resource ownership verification interceptor sits in front of all protected controllers.
* When a request is made (e.g. `GET /api/v1/recommendations/:id`), the middleware checks if the authenticated `req.user.id` is equal to the target document's `userId`.
* If true, proceed to controller.
* If false, return a `403 Forbidden` response and log the security audit.

---

# 16. AI Service Design

AI Service Responsibilities
* Build prompt templates with structured JSON objects
* Send request to Gemini API
* Validate Gemini API response strictly using backend Zod schemas (Stream Schema, Roadmap Schema, Resume Review Schema, etc.)
* Parse JSON to verify expected format
* Save dynamic result to MongoDB

Prompt Files
```text
backend/prompts/
├── stream.prompt
├── career.prompt
├── degree.prompt
├── resume.prompt
├── roadmap.prompt
├── learning.prompt
├── internship.prompt
└── job.prompt
```

---

# 17. Authentication Design

Registration

↓

Hash Password

↓

Store User

↓

Login

↓

Generate JWT

↓

Access Protected Routes

---

# 18. API Layer

Modules

* Authentication
* Education
* Profile
* Assessment
* Recommendation
* Resume
* Internship
* Job
* Settings

Communication

JSON over HTTPS

---

# 19. Error Handling

Frontend

* Validation Messages
* Toast Notifications
* Skeleton Loading
* Retry Buttons

Backend

* Standard Error Objects
* HTTP Status Codes
* Validation Middleware

---

# 20. UI Component Library

Reusable Components

* Button
* Card
* Input
* Select
* Modal
* Dialog
* Tabs
* Progress Bar
* Badge
* Avatar
* Skeleton
* Data Table
* Chart
* Sidebar
* Navbar
* Footer

---

# 21. State Management

Global State

* User
* Authentication
* Theme
* Notifications

Server State

Managed using TanStack Query.

---

# 22. Routing Structure

```text
/

├── login

├── register

├── dashboard

├── education

├── profile

├── assessment

├── recommendations

├── roadmap

├── learning

├── resume

├── internships

├── jobs

└── settings
```

---

# 23. Security Design

* JWT Authentication
* bcrypt Password Hashing
* Route Protection
* Input Validation
* API Rate Limiting
* Environment Variables
* CORS
* Helmet

---

# 24. Performance Design

Frontend

* Lazy Loading
* Code Splitting
* Image Optimization
* Skeleton Loaders
* Memoization

Backend

* Indexed Queries
* Efficient Aggregation
* API Pagination
* Prompt Caching (optional)

---

# 25. Responsive Design

Supported Devices

* Desktop
* Laptop
* Tablet
* Mobile

Breakpoints

* Mobile (<640px)
* Tablet (640–1024px)
* Desktop (>1024px)

---

# 26. Design Principles

* Modular Components
* Single Responsibility
* Reusability
* Maintainability
* Scalability
* Accessibility
* Responsive Layout
* AI-first User Experience

---

# 27. Future Design Extensions

* Parent Portal
* Mentor Portal
* Admin Dashboard
* AI Chat Assistant
* Voice Career Mentor
* Scholarship Finder
* Mock Interview Module
* Analytics Dashboard

---

# 28. Design Summary

The software follows a modular full-stack architecture with a React frontend, Node.js backend, MongoDB database, and Google Gemini (BYOK) for AI-driven recommendations. Each module is independently designed, reusable, scalable, and communicates through REST APIs, enabling future enhancements without major architectural changes.
