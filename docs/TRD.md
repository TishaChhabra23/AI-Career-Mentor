# TRD.md

# AI Career Mentor – Technical Requirements Document (TRD)

## 1. Project Overview

AI Career Mentor is a full-stack AI-powered web application that provides personalized career guidance from Class 10 to employment.

The application uses:

* React + Vite frontend
* Node.js + Express backend
* MongoDB Atlas database
* Google Gemini API (BYOK) for AI features

The architecture follows a modular and scalable design.

---

# 2. System Architecture

```
                    Client (React + Vite)
                             │
                             ▼
                  Node.js + Express API
                             │
      ┌──────────────────────┼──────────────────────┐
      │                      │                      │
      ▼                      ▼                      ▼
 MongoDB Atlas        Google Gemini API      Cloudinary
(Database)               (BYOK)            (Resume Images)
```

---

# 3. Technology Stack

## Frontend

* React 19+
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion
* TanStack Query
* React Hook Form
* Zod (for client validation)
* @react-pdf/renderer (custom resume PDF generation)
* Recharts
* Lucide React
* Sonner
* React Router DOM

---

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* Multer
* Cloudinary SDK
* nodemailer (SMTP dispatch helper)
* zod (schema check for Gemini JSON returns)
* Axios
* Mongoose

---

## Database

MongoDB Atlas

ODM

* Mongoose

---

## AI

Google Gemini API (BYOK)

Model Recommendation

* Gemini 2.5 Flash (default)
* Gemini 2.5 Pro (optional for detailed reports)

---

## Development Tools

* VS Code
* Postman
* MongoDB Compass
* Git
* GitHub
* npm

---

# 4. Frontend Architecture

```
src/

components/

pages/

layouts/

hooks/

context/

services/

utils/

constants/

assets/

types/

routes/
```

---

# 5. Backend Architecture

```
backend/

config/

controllers/

middleware/

models/

routes/

services/

repositories/

validators/

utils/

prompts/

uploads/
```

---

# 6. Application Layers

### Presentation Layer

React UI

Responsibilities

* Forms
* Dashboard
* Charts
* Cards
* Animations

---

### Business Layer

Express Services

Responsibilities

* Validation
* Assessment Scoring
* Recommendation Orchestration
* Authentication

---

### Data Layer

MongoDB

Responsibilities

* CRUD
* Query Optimization
* Aggregation
* Data Storage

---

### AI Layer

Google Gemini

Responsibilities

* Career Recommendations
* Stream Recommendations
* Degree Recommendations
* Learning Roadmaps
* Resume Review
* Skill Gap Analysis
* Internship Guidance
* Job Guidance

---

# 7. Authentication

Method

JWT Authentication

Password Encryption

bcrypt

Flow

```
Register

↓

Hash Password

↓

Store User

↓

Login

↓

Generate JWT

↓

Protected Routes
```

---

# 8. Authorization

Role
* Student (Primary role with dynamic level + objective configurations)

Future Roles
* Parent
* Mentor
* Admin

Resource Ownership Check Middleware
* To protect user privacy, access to dynamic objects (Student Profiles, Education Details, Assessment Progress, Results, Recommendations, Roadmaps, Resumes, Saved Jobs, Saved Internships, and Notification settings) is strictly checked.
* An authorization middleware will query the database to verify that the authenticated `userId` from the JWT matches the resource owner's ID before allowing READ, UPDATE, or DELETE operations. Accessing unauthorized IDs will immediately throw a `403 Forbidden` response.

---

# 9. API Design

RESTful API

Base URL
```
/api/v1
```

### Modules & Endpoints Spec

#### 1. Authentication (`Auth`)
* `POST   /api/v1/auth/register` - Create student account
* `POST   /api/v1/auth/login` - Secure login and return JWT
* `POST   /api/v1/auth/forgot-password` - Request verification link (sends email using nodemailer)
* `POST   /api/v1/auth/reset-password` - Invalidate reset token and save new password
* `POST   /api/v1/auth/logout` - Clear cookies and terminate session
* `DELETE /api/v1/auth/account` - Remove all user-owned MongoDB records and delete private Cloudinary resume files

#### 2. Dashboard
* `GET    /api/v1/dashboard/summary` - Fetch single unified payload containing profile completion, progress status, notifications, and next recommended actions

#### 3. Education
* `POST   /api/v1/education` - Save initial education details
* `GET    /api/v1/education` - Retrieve user's education settings
* `PUT    /api/v1/education/:id` - Update details (resets/updates objective)

#### 4. Profile
* `GET    /api/v1/profile` - Fetch dynamic student profile details
* `POST   /api/v1/profile` - Initialize profile
* `PUT    /api/v1/profile` - Update details (experience, learningStyle, etc.)

#### 5. Assessment
* `GET    /api/v1/assessments` - Fetch available tests based on level + objective
* `GET    /api/v1/assessments/:id` - Fetch details for a specific test
* `POST   /api/v1/assessments/:id/start` - Initialize assessment progress tracking
* `PUT    /api/v1/assessments/:id/progress` - Autosave/update partial answer selections
* `GET    /api/v1/assessments/:id/progress` - Fetch progress details to resume test
* `POST   /api/v1/assessments/:id/submit` - Execute scoring engine and save final scores to results
* `GET    /api/v1/assessments/:id/result` - Fetch numerical scores and matched recommendation summaries
* `GET    /api/v1/assessments/history` - Retrieve history list of all completed assessments

#### 6. AI Recommendations
* `GET    /api/v1/recommendations` - Retrieve all saved recommendations for user
* `POST   /api/v1/recommendations/generate` - Trigger Gemini generation based on assessment results and execute Zod schema validation

#### 7. Roadmaps
* `GET    /api/v1/roadmaps/career` - Retrieve custom career roadmap timeline
* `GET    /api/v1/roadmaps/learning` - Retrieve weekly learning plan courses and project tasks

#### 8. Resume
* `POST   /api/v1/resumes/upload` - Securely upload resume PDF to private Cloudinary storage
* `GET    /api/v1/resumes` - Retrieve list of uploaded files and custom builder drafts
* `GET    /api/v1/resumes/:id` - Retrieve details of a specific resume
* `POST   /api/v1/resumes/builder` - Create a custom resume draft in `user_resumes` collection
* `PUT    /api/v1/resumes/builder/:id` - Save edits to structured custom resume details
* `DELETE /api/v1/resumes/builder/:id` - Delete a custom resume draft
* `POST   /api/v1/resumes/:id/analyze` - Trigger local text extraction and submit to Gemini for ATS scoring and improvement review

#### 9. Internship
* `GET    /api/v1/internships` - Paginated controlled seed database list
* `GET    /api/v1/internships/:id` - Specific internship details
* `GET    /api/v1/internships/search` - Search/filter by role, skills, mode, and location
* `POST   /api/v1/internships/:id/save` - Save/bookmark internship opportunity
* `GET    /api/v1/internships/recommendations` - Retrieve AI matched internship suggestions

#### 10. Jobs
* `GET    /api/v1/jobs` - Paginated controlled seed database list
* `GET    /api/v1/jobs/:id` - Specific job details
* `GET    /api/v1/jobs/search` - Search/filter by role, skills, and salary range
* `POST   /api/v1/jobs/:id/save` - Save/bookmark job opportunity
* `GET    /api/v1/jobs/recommendations` - Retrieve AI matched job suggestions

#### 11. Notifications
* `GET    /api/v1/notifications` - Retrieve user notifications list
* `PUT    /api/v1/notifications/:id/read` - Mark a notification as read

---

# 10. AI Integration Strategy

Google Gemini BYOK

### Backend Workflow

```
Student Profile
      +
Education Details
      +
Assessment Results
      │
      ▼
Prompt Builder
      │
      ▼
Google Gemini API
      │
      ▼
Structured JSON Response
      │
      ▼
Zod Validation (Strict dynamic schemas per task)
      │
      ▼
Save to MongoDB
      │
      ▼
Display on Dashboard
```

Gemini is responsible only for intelligent recommendations. Response schemas for each major task (Stream, Degree, Career, Skill Gap, Career Roadmap, Learning Roadmap, Resume Analysis, Internship Recommendations, Job Recommendations) will be validated before saving. Assessment scoring remains inside the backend.

---

# 11. Prompt Engineering

Each AI module has a dedicated prompt template.

Examples

```
stream.prompt

career.prompt

degree.prompt

resume.prompt

roadmap.prompt

learning.prompt

internship.prompt

job.prompt
```

Each prompt receives structured JSON.

Example Input

```json
{
  "educationLevel": "UG",
  "skills": ["Python", "SQL"],
  "careerGoal": "Data Scientist",
  "assessmentScore": 87
}
```

---

# 12. API Communication

Frontend

↓

Express API

↓

MongoDB

↓

Gemini API

↓

Backend Response

↓

Frontend Rendering

All communication uses JSON.

---

# 13. File Upload & Resume Privacy

Supported Files
* PDF, DOCX (for Resumes)
* PNG, JPG (for Profile Images)

Maximum Size
* 10 MB

Cloudinary Storage & Resume Privacy
* Resume documents contain highly sensitive Personally Identifiable Information (PII) including full names, contact info, and addresses.
* Resume files must never be publicly accessible. The backend must configure Cloudinary to upload resumes using private storage settings.
* When retrieving files, the backend will generate secure signed URLs with short expiry times (e.g. 15 minutes) only after validating user ownership.
* For AI processing, the backend will parse the PDF locally first (using libraries like `pdf-parse`) and send the minimum necessary text information in prompts to the Gemini API, protecting raw files and credentials.

---

# 14. Validation

Frontend

* React Hook Form
* Zod

Backend

* Express Validation
* Custom Validators

---

# 15. Error Handling

Standard Response

```json
{
  "success": false,
  "message": "Validation Failed",
  "errors": []
}
```

HTTP Status Codes

* 200
* 201
* 400
* 401
* 403
* 404
* 409
* 422
* 500

---

# 16. Security

Authentication

JWT

Password

bcrypt

Environment Variables

```
JWT_SECRET

MONGODB_URI

GEMINI_API_KEY

CLOUDINARY_URL
```

Additional Security

* Helmet
* CORS
* Rate Limiting
* Input Validation
* XSS Protection

---

# 17. Performance

Frontend

* Lazy Loading
* Code Splitting
* Skeleton Loaders
* Image Optimization
* React Query Caching

Backend

* MongoDB Indexes
* Pagination
* Aggregation Pipelines
* API Caching (optional)

---

# 18. UI Requirements

Theme

Dark Mode Only

Style

* Modern
* Minimal
* AI-focused
* Glassmorphism (subtle)
* Purple Accent

Animations

* Framer Motion
* Smooth Page Transitions
* Skeleton Loading
* Progress Indicators

---

# 19. Logging

Development

Morgan

Production

Custom Logger

Log Types

* API Requests
* AI Calls
* Errors
* Authentication
* File Uploads

---

# 20. Testing Strategy

Frontend

* Component Testing
* Form Validation Testing
* Responsive Testing

Backend

* API Testing
* Authentication Testing
* Validation Testing

AI

* Prompt Validation
* Response Validation
* JSON Structure Validation

---

# 21. Coding Standards

Frontend

* Functional Components
* Hooks
* Type-safe patterns
* Component Reusability

Backend

* MVC Architecture
* Service Layer Pattern
* Repository Pattern
* Async/Await
* Consistent Error Handling

Naming Convention

* camelCase → variables/functions
* PascalCase → React Components
* kebab-case → folders/routes

---

# 22. Scalability

The architecture should support future additions:

* Parent Dashboard
* Mentor Dashboard
* Admin Panel
* Voice AI Mentor
* Chat-based Career Coach
* Scholarship Recommendation
* Multi-language Support
* Interview Simulator

---

# 23. Third-Party Services

| Service           | Purpose                |
| ----------------- | ---------------------- |
| MongoDB Atlas     | Database               |
| Google Gemini API | AI Recommendations     |
| Cloudinary        | Resume & Image Storage |
| GitHub            | Version Control        |
| Vercel            | Frontend Deployment    |
| Render/Railway    | Backend Deployment     |

---

# 24. Success Metrics

* Average API response under 500 ms (excluding AI generation)
* AI response under 5–10 seconds
* Fully responsive UI
* Secure authentication
* Modular architecture
* Scalable codebase
* Clean REST API
* Reusable components
* Maintainable project structure

---

# 25. Technical Summary

* React + Vite frontend
* Node.js + Express backend
* MongoDB Atlas database
* Google Gemini (BYOK) integration
* RESTful API architecture
* JWT authentication
* MVC + Service Layer design
* Modern dark UI with Tailwind CSS
* AI-driven recommendations using structured prompts
* Production-ready scalable architecture
