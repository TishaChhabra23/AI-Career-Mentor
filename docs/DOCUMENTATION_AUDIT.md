# AI Career Mentor – Documentation Audit Report

This audit evaluates the complete project blueprint consisting of the 10 planning and design documents inside [docs/](file:///d:/MCA/AI%20career/docs). The goal is to verify that the project requirements, architecture, data schemas, and workflows are consistent and technically ready for implementation.

---

## 1. Documentation Consistency Audit

This section lists contradictions and design issues found by cross-referencing all documentation files.

### Issue AUD-001: Missing Assessment Answers Collection
* **Severity**: **CRITICAL**
* **Source Documents**: [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md), [APP_FLOW.md](file:///d:/MCA/AI%20career/docs/APP_FLOW.md), [TASK_BREAKDOWN.md](file:///d:/MCA/AI%20career/docs/TASK_BREAKDOWN.md)
* **Problem**: The user flow and task lists mention "Save answer/progress" and "Submit assessment". However, the database schema contains no collection or structure for storing individual user answers, question states, or progress. It only has `assessment_results` (final scores).
* **Why it matters**: If a user gets disconnected halfway through a 60-question test, their progress is lost. Furthermore, the backend cannot calculate or verify scores, nor show a review page (what they got right/wrong) without saving individual selections.
* **Recommended Correction**: Create a new collection `assessment_progress` (or `user_answers`) structured as:
  ```javascript
  {
    _id: ObjectId,
    userId: ObjectId,
    assessmentId: ObjectId,
    answers: [{ questionId: ObjectId, selectedOption: String, isCorrect: Boolean }],
    isCompleted: Boolean,
    updatedAt: Date
  }
  ```

---

### Issue AUD-002: Hardcoded Section Scores in MDB Schema
* **Severity**: **CRITICAL**
* **Source Documents**: [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md), [SDD.md](file:///d:/MCA/AI%20career/docs/SDD.md)
* **Problem**: The `assessment_results` schema explicitly defines `sectionScores` with hardcoded keys: `logicalReasoning`, `analyticalThinking`, `communication`, `personality`, `technicalKnowledge`, and `careerInterest`.
* **Why it matters**: Different assessments have different sections. For example, a UG "Skill & Career Assessment" or PG "Career Readiness Assessment" will test entirely different fields (e.g. `coding`, `experience`, `specialization`). Hardcoding these keys in the database layer prevents scalability and breaks validation for other assessments.
* **Recommended Correction**: Convert `sectionScores` into a dynamic map:
  ```javascript
  sectionScores: {
    type: Map,
    of: Number
  }
  ```

---

### Issue AUD-003: Mismatch of Forgot / Reset Password Backend Implementation
* **Severity**: **HIGH**
* **Source Documents**: [PRD.md](file:///d:/MCA/AI%20career/docs/PRD.md), [TASK_BREAKDOWN.md](file:///d:/MCA/AI%20career/docs/TASK_BREAKDOWN.md), [ROADMAP.md](file:///d:/MCA/AI%20career/docs/ROADMAP.md), [FINAL_BROWSER_CHECKLIST.md](file:///d:/MCA/AI%20career/docs/FINAL_BROWSER_CHECKLIST.md)
* **Problem**: "Forgot Password" and "Reset Password" forms are required on the frontend and tested in the checklist. However, there are no tasks in `TASK_BREAKDOWN.md` or `ROADMAP.md` to build the backend endpoints, configure an email service (like Nodemailer), or store reset tokens in MongoDB.
* **Why it matters**: Developing the password reset frontend without the backend endpoints and supporting libraries will lead to an incomplete, un-integratable feature.
* **Recommended Correction**: Add an email package (e.g., `nodemailer`) to the backend dependencies and add reset fields to the `users` schema:
  ```javascript
  resetPasswordToken: String,
  resetPasswordExpires: Date
  ```
  Add backend endpoints under Phase 3 (Authentication).

---

### Issue AUD-004: Inability to Support Dual User Goals (Career Objective Mismatch)
* **Severity**: **HIGH**
* **Source Documents**: [PRD.md](file:///d:/MCA/AI%20career/docs/PRD.md), [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md), [APP_FLOW.md](file:///d:/MCA/AI%20career/docs/APP_FLOW.md)
* **Problem**: The target user list specifies separate categories like "Internship Seekers" and "Job Seekers". However, `DATABASE_SCHEMA.md` only contains an `educationLevel` enum (`"Class10" | "Class11" | "Class12" | "Diploma" | "UG" | "PG"`). There is no field to capture the user's career objective.
* **Why it matters**: A user can be an "Undergraduate + Internship Seeker" or a "Postgraduate + Job Seeker". Without a separate `careerObjective` field, the dashboard and assessment engine cannot tell which assessment to load (e.g., general UG vs. Internship Readiness).
* **Recommended Correction**: Add a `careerObjective` field to the `student_profiles` collection:
  ```javascript
  careerObjective: "explore_stream" | "explore_degree" | "explore_career" | "find_internship" | "find_job" | "higher_studies"
  ```

---

### Issue AUD-005: Missing Profile Fields in MDB Schema
* **Severity**: **HIGH**
* **Source Documents**: [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md), [SDD.md](file:///d:/MCA/AI%20career/docs/SDD.md)
* **Problem**: The profiles require `learningStyle` for Class 12 and `experience` details for PG. However, neither `learningStyle` nor `experience` are defined in the `student_profiles` database schema in `DATABASE_SCHEMA.md`.
* **Why it matters**: Attempting to save these profile configurations on the frontend will either result in database schema validation failure (if strict queries are used) or database dropouts.
* **Recommended Correction**: Add `learningStyle: String` and `experience: []` (containing job history objects) to the `student_profiles` collection.

---

### Issue AUD-006: Mismatch of Resume Builder Data Model
* **Severity**: **HIGH**
* **Source Documents**: [PRD.md](file:///d:/MCA/AI%20career/docs/PRD.md), [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md), [TASK_BREAKDOWN.md](file:///d:/MCA/AI%20career/docs/TASK_BREAKDOWN.md)
* **Problem**: The documents describe an AI-assisted "Resume Builder" module where users enter values to generate/export a resume. However, the database schema only defines a `resumes` collection storing a `resumeUrl` (PDF upload) and score metrics. There is no collection for storing structured fields of a custom-built resume.
* **Why it matters**: If a user builds a resume via the builder, their data cannot be saved to the database, meaning they will lose their custom-built resume details on logout or refresh.
* **Recommended Correction**: Create a new collection `user_resumes` that stores custom-built profiles:
  ```javascript
  {
    _id: ObjectId,
    userId: ObjectId,
    templateId: String,
    summary: String,
    experience: [{ company: String, role: String, startDate: Date, endDate: Date, details: String }],
    education: [{ institution: String, degree: String, year: Number }],
    skills: [String],
    projects: [{ title: String, details: String }]
  }
  ```

---

### Issue AUD-007: Mismatch of Backend Folder Naming
* **Severity**: **MEDIUM**
* **Source Documents**: [TRD.md](file:///d:/MCA/AI%20career/docs/TRD.md), [SETUP_GUIDE.md](file:///d:/MCA/AI%20career/docs/SETUP_GUIDE.md)
* **Problem**: The `SETUP_GUIDE.md` specifies installing and running commands under a `backend/` folder. The `TRD.md` section 5 maps the backend layout under a `server/` root folder.
* **Why it matters**: This leads to directory structure inconsistencies during environment setup and deployment configurations.
* **Recommended Correction**: Standardize the folder name to `backend/` throughout all files (including `TRD.md`).

---

### Issue AUD-008: Missing Libraries for Frontend PDF Generation
* **Severity**: **HIGH**
* **Source Documents**: [SETUP_GUIDE.md](file:///d:/MCA/AI%20career/docs/SETUP_GUIDE.md), [TASK_BREAKDOWN.md](file:///d:/MCA/AI%20career/docs/TASK_BREAKDOWN.md)
* **Problem**: The frontend tasks include "PDF Export" for resumes, but the frontend dependencies list in `SETUP_GUIDE.md` has no PDF rendering libraries (like `@react-pdf/renderer` or `jspdf`).
* **Why it matters**: Building a PDF exporter from scratch in React without libraries will cause major project delays and low-quality exports.
* **Recommended Correction**: Add `@react-pdf/renderer` to the frontend `npm install` list in the setup guide.

---

### Issue AUD-009: Lack of Job/Internship Ingestion
* **Severity**: **MEDIUM**
* **Source Documents**: [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md), [TASK_BREAKDOWN.md](file:///d:/MCA/AI%20career/docs/TASK_BREAKDOWN.md)
* **Problem**: There are database collections for `jobs` and `internships` (which suggest a searchable database). However, there is no admin panel, job ingestion system, or cron scraper defined in the APIs or tasks.
* **Why it matters**: The collections will remain completely empty unless a populating script or ingestion flow is defined.
* **Recommended Correction**: Create a database seeder script (`seed.js`) or define an initial ingestion process in the tasks.

---

## 2. User Journey Audit

The planned user journey flow is reviewed below:

```text
Landing Page ➔ Create Account ➔ Education Details ➔ Dynamic Student Profile ➔ Dashboard ➔ Assessment ➔ AI Recommendation ➔ Career/Learning Roadmap ➔ Resume ➔ Internship/Job Recommendations
```

### Flow Validation by Education Level
* **Class 10**: **PASSED**. No assessment is given. The profile collects favorite subjects, interests, strengths, hobbies, and career aspirations. AI generates stream recommendations directly.
* **Class 11**: **PASSED**. Career Aptitude Assessment maps to validating streams and exploring paths.
* **Class 12**: **PASSED**. Degree Selection Assessment supports degree, college, and entrance exam matching.
* **Undergraduate**: **PASSED**. Skill & Career Assessment evaluates gaps and internship readiness.
* **Postgraduate**: **PASSED**. Career Readiness Assessment prepares for jobs and specialization.
* **Internship Seeker / Job Seeker**: **FAILED** (due to **Issue AUD-004**). The workflow incorrectly forces "Internship" and "Employment" to be treated as education levels in the assessment lists, but they are objectives that a UG or PG student holds. 

---

## 3. Education-Level Audit

The system must clearly separate **Education Level** from **Career Objective**.

* **Education Level** determines the user's current academic status (e.g., `UG` or `PG`).
* **Career Objective** determines what action they are taking (e.g., `Find Internship` or `Find Job`).

Currently, the schema does not support these overlapping statuses. A user cannot be stored as `educationLevel: "UG"` and at the same time take the `Internship Readiness Assessment` because the dashboard and assessment logic lack a selector for the objective. 

**Correction Recommended**: Introduce `careerObjective` to `student_profiles` to isolate target assessments.

---

## 4. Dynamic Profile Audit

The dynamic fields required by each profile:

| Education Level | Fields | DB Schema Support | Status |
|---|---|---|---|
| **Class 10** | Interests, Subjects, Strengths, Hobbies, Career Goals | Yes | ✅ Supported |
| **Class 11** | Current Stream, Interests, Goals, Strengths, Hobbies | Partially (Stream is in Edu Details) | ⚠️ Indirect |
| **Class 12** | Current Stream, Goals, Preferred Degree, Learning Style | No (`learningStyle` missing) | ❌ Inconsistent |
| **UG** | Skills, Projects, Certifications, Resume, LinkedIn, GitHub | Yes | ✅ Supported |
| **PG** | Skills, Experience, Certifications, Resume, Career Goal | No (`experience` missing) | ❌ Inconsistent |

### Missing Fields Summary
* `learningStyle` (Class 12 Profile)
* `experience` (PG Profile)

---

## 5. Dashboard Audit

The Dashboard behaves as the central hub:

* **Dynamic Behavior**: The SDD states it dynamically adapts widgets according to `educationLevel`.
* **Missing Feature**: There is no specific unified API endpoint for dashboard state. Making separate calls for each widget could cause visual lag on page load.
* **Recommendation**: Add a `/api/v1/dashboard/summary` endpoint which returns the compiled widgets state in a single payload.

---

## 6. Assessment Architecture Audit

Evaluating the Assessment engine logic:
* **Question Configurations**: Supported (MCQ, Likert, Scenario, Situational, Self-Rating).
* **Question Associations**: Supported via `assessmentId`.
* **Missing Schemas**:
  1. **Answers/Progress Storage**: No database fields exist to store user answers before submission (**Issue AUD-001**).
  2. **Flexible Section Scores**: Hardcoded fields inside the database collection block different assessments (**Issue AUD-002**).

---

## 7. AI Architecture Audit

* **Server-side Security**: **PASSED**. The Google Gemini API is accessed solely through the Express service layer (`GEMINI_API_KEY` is restricted to the backend `.env`). React has no direct access.
* **Data Flow**: The flow from React UI ➔ Express API ➔ Gemini API ➔ Response Validator ➔ MongoDB is consistent across all documentation.

---

## 8. AI Responsibility Audit

* **Functional Partitioning**: **PASSED**. The backend executes deterministic validation and Likert/MCQ test scoring. Gemini is restricted to qualitative, interpretive tasks (e.g. roadmap generation, resume reviews, skill-gap descriptions).
* **Consistency**: There is no sign of Gemini being used to calculate raw numeric test scores directly.

---

## 9. Database Audit

Evaluating [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md):

* **Missing Collections**:
  1. `assessment_progress` (for ongoing tests)
  2. `user_resumes` (for custom-built resumes)
* **Missing Fields**:
  1. `learningStyle` and `experience` inside `student_profiles`
  2. `careerObjective` inside `student_profiles`
* **Schema Indexes**: No compound indexes defined.
* **Timestamps**: Missing automatic timestamps on multiple tables.
* **Recommendation Structure**: The dynamic payload `{}` is well-structured for storing polymorphic JSON recommendations from Gemini.

---

## 10. API Audit

Evaluating the Express REST endpoints:

* **Missing Authentication APIs**: `Forgot Password` and `Reset Password` (backend endpoints missing from plans).
* **Missing Assessment APIs**: `Save Answer Progress` (autosave) and `Resume Assessment`.
* **Missing Resume APIs**: `Build Custom Resume` (saving structured data fields, rather than just PDF URL).
* **Missing Search APIs**: Pagination and filtering endpoint specs for `jobs` and `internships`.

---

## 11. Frontend Architecture Audit

* **UI stack**: React 19 + Vite + Tailwind + shadcn/ui provides a modern dark-theme SaaS capability.
* **Missing Package**: PDF generator (like `@react-pdf/renderer`) is missing from the list.

---

## 12. Security Audit

* **Basic Security**: Standard tools (JWT, bcrypt, CORS, Helmet, Rate Limiter) are configured.
* **Access Control**: No detailed specification of access control levels (middleware checks for user ownership on dynamic resources like profiles/roadmaps).

---

## 13. Resume Security Audit

* **PII Leakage**: No mention of sanitizing sensitive user data (e.g. address, phone) from the resume text before sending it to the Google Gemini API.
* **Cloudinary Privacy**: Resume uploads are set to standard public URLs. Storing sensitive resumes with public URLs poses a minor privacy risk. They should be stored using private Cloudinary options and accessed with signed URLs.

---

## 14. Internship and Job Recommendation Audit

* **Distinction**: **PASSED**. The design defines distinct assessments, databases, and UI representations for internships vs. jobs.
* **Data Structure**: `internships` has stipend and work modes, while `jobs` has salary range and experience parameters.

---

## 15. Deployment Audit

* **Consistency**: The Vercel + Render/Railway + Atlas + Gemini BYOK + Cloudinary stack is consistent throughout the blueprints.
* **Build Configuration**: Commands (`npm run build` and `npm start`) are uniform.

---

## 16. Missing Requirements

The following features should be added to the specs before development:
1. **Zod JSON Schema Validation**: Backend validation of Gemini's JSON responses to prevent server crashes on malformed AI returns.
2. **Account Deletion (GDPR Compliance)**: Clean deletion of MongoDB records and corresponding uploads on Cloudinary.
3. **Assessment Resume Feature**: Auto-saving answers as the test is taken.

---

## 17. Recommended Architecture Improvements

### Must Fix Before Development
1. **Implement Dynamic Section Scores**: Adjust `assessment_results` schema in [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md) to support dynamic key-value pairs instead of hardcoded sections.
2. **Add Assessment Progress Schema**: Create the database model to store user test selections during active test-taking.
3. **Add Career Objective Field**: Add `careerObjective` to `student_profiles` schema to support users having simultaneous education levels and search targets.
4. **Implement Missing Profile Fields**: Include `learningStyle` and `experience` fields in `student_profiles`.
5. **Include Forgot/Reset Password Backend**: Include backend tasks for reset tokens and email dispatch services.
6. **Define Custom Resume Schema**: Add `user_resumes` schema to hold custom builder fields.
7. **Add Exporter Package**: Add `@react-pdf/renderer` to the setup guide dependencies list.

### Should Fix Before Production
1. **Gemini JSON Schema Enforcement**: Force the AI service layer to use Gemini JSON Schema format mode.
2. **Secure Upload URLs**: Use Cloudinary private access settings for uploaded resume attachments.
3. **Local PDF Parsing**: Use `pdf-parse` on the backend to extract text rather than forcing Gemini to process documents visually, reducing API latency.

### Optional Future Improvements
1. **AI Caching**: Use a cache store (like Redis) to store generated roadmaps, checking for updates only when the user's assessment or profile changes.
2. **Unified Dashboard Endpoint**: Implement a single endpoint to fetch dashboard overview metrics.

---

## 18. Final Consistency Matrix

| Requirement | PRD | APP_FLOW | DB | TRD | SDD | TASKS | ROADMAP | Status |
|---|---|---|---|---|---|---|---|---|
| **User Authentication** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Forgot/Reset Password** | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ Inconsistent |
| **Education Details** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Dynamic Profile** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ Partially Consistent |
| **Dynamic Dashboard** | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Assessment Engine** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Test Progress Storage** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ Inconsistent |
| **Google Gemini (BYOK)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Career/Learning Roadmaps**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Resume PDF Upload** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Resume Custom Builder** | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ Partially Consistent |
| **Internship Module** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Job Module** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Cloudinary Storage** | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |
| **Deployment Setup** | — | — | — | ✅ | ✅ | ✅ | ✅ | ✅ Consistent |

---

## 19. Final Audit Summary

```text
Total Issues: 12
Critical: 2 (Assessment progress missing, hardcoded section scores)
High: 5 (Forgot password backend missing, missing careerObjective, missing profile fields, missing resume builder schema, missing PDF library)
Medium: 3 (Backend directory name conflict, lack of job/internship ingestion, public resume URLs)
Low: 2 (Cloudinary key inconsistency, wording differences)

Documentation Ready for Development: NO
```

### Necessary Action Before Development
The project should **not** begin development until:
1. The **assessment progress model** is added to the database design.
2. The **section scores** mapping is made dynamic in the schema.
3. The **careerObjective** option is integrated to handle dual student/seeker statuses.
4. The backend tasks for **Forgot/Reset Password** and email configuration are added.
