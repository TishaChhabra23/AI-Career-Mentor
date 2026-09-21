# APP_FLOW.md

# AI Career Mentor – Application Flow

## 1. Application Overview

AI Career Mentor is a role-based, AI-powered career guidance platform that adapts its workflow based on the user's education level. The application guides users from account creation through personalized recommendations, learning plans, internships, and job opportunities.

---

# 2. Overall Application Flow

```text
Launch Application
        │
        ▼
Landing Page
        │
        ├────────► Login (with Forgot/Reset Password flows)
        │
        └────────► Create Account
                        │
                        ▼
                Education Details
                        │
                        ▼
             Select Career Objective
                        │
                        ▼
             Dynamic Student Profile (Dynamic fields by Level + Objective)
                        │
                        ▼
                   Dashboard (Personalized widgets)
                        │
                        ▼
               AI Assessment Engine (Autosave, Resume, Dynamic Sections)
                        │
                        ▼
               AI Recommendation Engine (Gemini + Zod Validation)
                        │
                        ▼
                Career Roadmap (Ownership / Authorization checks)
                        │
                        ▼
               Learning Roadmap
                        │
                        ▼
                Resume Builder (Uploaded PDF vs Custom Resume Builder)
                        │
                        ▼
          Internship Recommendation (if Objective = find_internship)
                        │
                        ▼
             Job Recommendation (if Objective = find_job)
```

---

# 3. Authentication Flow

### Landing Page

Options

* Login
* Create Account
* Learn More

---

### Create Account

Fields

* Full Name
* Email
* Mobile Number
* Password
* Confirm Password

Actions

* Create Account
* Redirect to Education Details

---

### Login

Fields
* Email
* Password

Actions
* Login ➔ Redirect to Dashboard (fetches unified GET /api/v1/dashboard/summary)
* Forgot Password ➔ Request reset ➔ Generate secure token ➔ Dispatch Nodemailer email (POST /api/v1/auth/forgot-password)
* Reset Password ➔ Validate token ➔ Input new password ➔ Save and invalidate token (POST /api/v1/auth/reset-password)

After successful login
↓
Dashboard

---

# 4. Education & Career Objective Flow

Purpose
Collect academic information and the user's primary goal to personalize the dashboard, assessments, and recommendations.

Fields
* Education Level ("Class10" | "Class11" | "Class12" | "Diploma" | "UG" | "PG")
* School / College Name
* Board / University
* Current Class / Year / Semester
* Stream (Conditional)
* Course (Conditional)
* Percentage / CGPA
* Location
* Career Objective ("explore_stream" | "explore_degree" | "explore_career" | "find_internship" | "find_job" | "higher_studies")

After submission
↓
Dynamic Student Profile (Loads fields dynamically based on level + objective)

---

# 5. Dynamic Student Profile Flow

The profile form fields render dynamically based on the selected education level and career objective.

---

## Class 10
Collect:
* Favorite Subjects
* Interests
* Strengths
* Hobbies
* Career Aspirations

↓
Dashboard (Objective: explore_stream ➔ AI Stream Recommendation directly, no assessment)

---

## Class 11
Collect:
* Current Stream
* Interests
* Career Goal
* Strengths
* Hobbies

↓
Dashboard ➔ Career Aptitude Assessment

---

## Class 12
Collect:
* Current Stream
* Career Goal
* Preferred Degree
* Interests
* Learning Style (primarily relevant to Class 12 studies)

↓
Dashboard ➔ Degree Selection Assessment

---

## Undergraduate (UG) / Diploma
Collect:
* Skills (array)
* Projects (array)
* Certifications (array)
* Work Experience (array of custom jobs, if applicable)
* Resume (Uploaded PDF reference / Custom resume structure)
* LinkedIn URL
* GitHub URL
* Career Objective

↓
Dashboard ➔ (Based on Career Objective: Skill & Career, Internship Readiness, or Job Readiness Assessment)

---

## Postgraduate (PG)
Collect:
* Skills (array)
* Experience (array of previous positions, company, role, dates, details)
* Certifications (array)
* Resume (Uploaded PDF reference / Custom resume structure)
* LinkedIn URL
* GitHub URL
* Career Goal
* Career Objective

↓
Dashboard ➔ (Based on Career Objective: Career Readiness, Internship Readiness, or Job Readiness Assessment)

---

# 6. Dashboard Flow

The dashboard is personalized based on education level.

Common Components

* Welcome Card
* Profile Completion
* Progress Tracker
* AI Insights
* Quick Actions
* Notifications
* Recent Activity

---

Quick Actions

* Start Assessment
* View Recommendations
* Career Roadmap
* Learning Roadmap
* Resume Builder
* Internship Portal
* Job Portal

---

# 7. AI Assessment Engine

The Assessment Engine evaluates users based on their combination of `educationLevel` and `careerObjective`. All tests run using an autosave mechanism, letting users save partial selections, pause, and resume. The backend scores the sections dynamically using a Map layout to calculate weights without static schema constraints.

## Class 10 (explore_stream)
* No Aptitude Test.
* AI Profile Analysis ➔ Stream Recommendation.

---

## Class 11 (explore_career / explore_stream)
* Assessment: Career Aptitude Assessment.
* Result: Career suggestions, stream validation.

---

## Class 12 (explore_degree / higher_studies)
* Assessment: Degree Selection Assessment.
* Result: Degree and college recommendations, entrance exam details.

---

## Undergraduate (explore_career)
* Assessment: Skill & Career Assessment.
* Result: Career recommendations, skill gap roadmaps.

---

## Postgraduate (explore_career)
* Assessment: Career Readiness Assessment.
* Result: Job roles and specialization guidance.

---

## UG/PG + find_internship
* Assessment: Internship Readiness Assessment.
* Result: Internship matches, project requirements, resume tips.

---

## UG/PG/Diploma + find_job
* Assessment: Job Readiness Assessment.
* Result: Job recommendations, interview preparation guides, salary matching.

---

## Assessment State Actions
* **Autosave**: Each question response triggers a partial PUT to `/api/v1/assessments/:id/progress` storing:
  `answers: [{ questionId, selectedOption, answeredAt }]`
* **Resume**: Fetching `GET /api/v1/assessments/:id/progress` pre-populates previous answers and sets `currentQuestionIndex`.
* **Submit**: Calling `POST /api/v1/assessments/:id/submit` calculates scores on the backend, saves results to `assessment_results`, and clears active `assessment_progress`.
* **History**: Calling `GET /api/v1/assessments/history` renders past test scores, dates, and matched recommendations.

---

# 8. AI Recommendation Engine

Input Sources

* Education Details
* Student Profile
* Assessment Results
* Skills
* Projects
* Resume
* Career Goals

Google Gemini generates

* Personalized recommendations
* Career explanations
* Learning roadmap
* Skill gap analysis
* Internship suggestions
* Job suggestions

---

# 9. Career Roadmap Flow

User selects

View Career Roadmap

↓

AI generates

* Career milestones
* Certifications
* Skills
* Projects
* Timeline

↓

User can save roadmap.

---

# 10. Learning Roadmap Flow

User selects

Learning Roadmap

↓

AI generates

* Weekly learning plan
* Courses
* Practice goals
* Skill development plan

---

# 11. Resume Builder Flow

Users can manage their resumes via two distinct mechanisms:

### Option A: Uploaded Resume
1. User uploads a PDF/DOCX resume file.
2. File is processed using a secure, private upload setting on Cloudinary.
3. Access to file URLs is protected by signed URLs and backend authorization ownership checks.
4. The backend extracts minimal text and passes it for Gemini analysis.
5. AI performs ATS Analysis ➔ Generates improvement suggestions and key missing skills.

### Option B: Custom Resume Builder
1. User enters structured details into the React builder interface (Personal Info, Summary, Education, Experience, Skills, Projects, Certifications, Achievements).
2. Data is saved as drafts/revisions in the `user_resumes` collection (`POST /api/v1/resumes/builder`).
3. Frontend uses `@react-pdf/renderer` to generate custom styled resume outputs.
4. User downloads generated PDF locally.

---

# 12. Internship Recommendation Flow

Input

* Skills
* Projects
* Resume
* Assessment Results

↓

AI Matching

↓

Recommended

* Internship Roles
* Required Skills
* Resume Tips

---

# 13. Job Recommendation Flow

Input

* Skills
* Resume
* Career Goal
* Assessment Score

↓

AI Matching

↓

Recommended

* Job Roles
* Companies
* Salary Insights
* Interview Preparation

---

# 14. User Navigation Structure

```text
Landing Page
│
├── Login
├── Register
│
└── Dashboard
     │
     ├── Profile
     ├── Education Details
     ├── Assessments
     ├── AI Recommendations
     ├── Career Roadmap
     ├── Learning Roadmap
     ├── Resume Builder
     ├── Internship Portal
     ├── Job Portal
     ├── Notifications
     └── Settings
```

---

# 15. Sidebar Navigation

* Dashboard
* Profile
* Education Details
* Assessments
* AI Recommendations
* Career Roadmap
* Learning Roadmap
* Resume Builder
* Internship Portal
* Job Portal
* Notifications
* Settings
* Help & Support

---

# 16. Conditional Application Flow

### Class 10 (explore_stream)
Profile ➔ AI Stream Recommendation ➔ Career Exploration

---

### Class 11 (explore_career)
Aptitude Test ➔ Career Suggestions ➔ Learning Roadmap

---

### Class 12 (explore_degree)
Degree Test ➔ Degree & College Recommendations ➔ Career Roadmap

---

### UG / PG + explore_career
Skill/Readiness Test ➔ Skill Gap Analysis ➔ Custom Resume Builder ➔ Career/Learning Roadmap

---

### UG / PG + find_internship
Internship Readiness Test ➔ Private Resume Upload ➔ AI Matcher ➔ Saved Internships List

---

### UG / PG + find_job
Job Readiness Test ➔ Private Resume Upload ➔ Interview Prep / Salary Insights ➔ Saved Jobs List

---

### UG / PG + higher_studies
Readiness Test ➔ Specialization Recommendations ➔ Higher Studies Guide ➔ Career Roadmap

---

# 17. Logout Flow

Settings ➔ Logout ➔ Clear JWT Session (Client-side & HttpOnly cookie) ➔ Redirect to Login

---

# 18. Account Deletion Flow

Settings
↓
Select Delete Account
↓
Verify Authentication (Input password confirmation)
↓
Express Endpoint (DELETE /api/v1/auth/account)
↓
Remove User records from MongoDB (Profile, Results, Resumes, Recommendations, Progress)
↓
Delete private files from Cloudinary
↓
Clear JWT Session & Redirect to Login Page
↓
Confirm Deletion Toast Message
