# Phase 9 Verification — Assessment Engine

| Field                | Value         |
| -------------------- | ------------- |
| Phase                | 9             |
| Name                 | Assessment Engine |
| Date                 | 2026-08-09    |
| Build Status Backend | ✅ PASS       |
| Build Status Frontend| ✅ PASS       |

---

## 1. Backend Models

| Model                | File                                     | Status |
| -------------------- | ---------------------------------------- | ------ |
| Assessment           | `backend/src/models/Assessment.ts`       | ✅ Created |
| AssessmentQuestion    | `backend/src/models/AssessmentQuestion.ts` | ✅ Created |
| AssessmentProgress    | `backend/src/models/AssessmentProgress.ts` | ✅ Created |
| AssessmentResult      | `backend/src/models/AssessmentResult.ts` | ✅ Created |

### Assessment Model
- ✅ `assessmentName`, `assessmentType`, `version`, `description`
- ✅ `duration`, `totalSections`, `totalQuestions`
- ✅ Compound unique index on `assessmentType + version`
- ✅ `isActive` flag for soft-archival

### AssessmentQuestion Model
- ✅ `assessmentId` ref, `sectionId`, `sectionName`
- ✅ `questionType` enum: `mcq`, `likert`, `self_rating`
- ✅ `question`, `options`
- ✅ `correctAnswer` (MCQ), `scoringMetadata` (Likert/self-rating)
- ✅ `order` for deterministic sequencing

### AssessmentProgress Model (Attempt)
- ✅ `userId`, `assessmentId`, `assessmentVersion`
- ✅ `status`: `in_progress`, `completed`, `abandoned`
- ✅ `answers[]` with `questionId` and `selectedOption`
- ✅ `currentQuestionIndex`, `startedAt`
- ✅ Compound unique index on `userId + assessmentId + status` for preventing duplicates

### AssessmentResult Model
- ✅ `userId`, `assessmentId`, `attemptId`, `assessmentVersion`
- ✅ `sectionScores` as `Map<string, number>` (0–100 normalized)
- ✅ `overallScore` (0–100)
- ✅ `completedAt` timestamp
- ✅ Compound unique index on `attemptId` for preventing duplicate result creation

---

## 2. Backend Services

### Assessment Selection Service
- ✅ Maps `educationLevel + careerObjective` → `assessmentType`
- ✅ Class 10 → `null` (no assessment available)
- ✅ Class 11 → `class_11_stream`
- ✅ Class 12 → `class_12_degree`
- ✅ Diploma + internship → `internship_readiness`
- ✅ Diploma + job → `job_readiness`
- ✅ Diploma + other → `null`
- ✅ UG + internship → `internship_readiness`
- ✅ UG + job → `job_readiness`
- ✅ UG + other → `ug_career`
- ✅ PG + internship → `internship_readiness`
- ✅ PG + job → `job_readiness`
- ✅ PG + other → `pg_career`

### Assessment Scoring Service
- ✅ Server-authoritative scoring (backend only)
- ✅ MCQ: compares against `correctAnswer` from question bank
- ✅ Likert/self-rating: uses `scoringMetadata` or fallback (1–5)
- ✅ Section scores normalized 0–100
- ✅ Overall score = mean of section scores
- ✅ `correctAnswer` and `scoringMetadata` never sent to frontend

---

## 3. Backend Controller & Routes

| Endpoint                                   | Method | Purpose                      | Status |
| ------------------------------------------ | ------ | ---------------------------- | ------ |
| `GET /api/v1/assessments/available`        | GET    | Check availability for user  | ✅     |
| `POST /api/v1/assessments/start`           | POST   | Start new attempt            | ✅     |
| `GET /api/v1/assessments/attempts/:id`     | GET    | Get attempt + sanitized Qs   | ✅     |
| `PATCH /api/v1/assessments/attempts/:id/progress` | PATCH | Autosave progress     | ✅     |
| `POST /api/v1/assessments/attempts/:id/submit` | POST | Submit + score + finalize   | ✅     |
| `GET /api/v1/assessments/history`          | GET    | Get user's result history    | ✅     |
| `GET /api/v1/assessments/results/:id`      | GET    | Get single result detail     | ✅     |

### Security Verification
- ✅ All routes protected with `protect` middleware (JWT cookie)
- ✅ All ownership checks use `req.user.id` (never client-provided userId)
- ✅ `correctAnswer` and `scoringMetadata` stripped from question payloads
- ✅ Timer expiry checked server-side (`startedAt + duration`)
- ✅ Duplicate submission prevented (checks existing result for attemptId)
- ✅ Duplicate results prevented (unique index on attemptId)

---

## 4. Frontend API Client

| API Helper                    | Endpoint                          | Status |
| ----------------------------- | --------------------------------- | ------ |
| `getAvailableAssessmentApi()` | `GET /assessments/available`      | ✅     |
| `startAssessmentApi()`        | `POST /assessments/start`         | ✅     |
| `getAttemptApi()`             | `GET /assessments/attempts/:id`   | ✅     |
| `saveProgressApi()`           | `PATCH /assessments/attempts/:id/progress` | ✅ |
| `submitAssessmentApi()`       | `POST /assessments/attempts/:id/submit` | ✅  |
| `getResultsHistoryApi()`      | `GET /assessments/history`        | ✅     |
| `getResultApi()`              | `GET /assessments/results/:id`    | ✅     |

---

## 5. Frontend Assessment UI

### Assessment Page (`/assessment`)
- ✅ **Loading** state with skeleton placeholders
- ✅ **Unavailable** state (Class 10, Diploma explore) with reason message
- ✅ **Intro** page with assessment metadata (sections, questions, duration)
- ✅ **Resume** page for in-progress attempts
- ✅ **Questions** view with:
  - ✅ Radio button option selection
  - ✅ Section navigation tabs (with completion indicators)
  - ✅ Numbered question navigation dots
  - ✅ Timer countdown with red warning under 2 minutes
  - ✅ Auto-save on every answer selection
  - ✅ Previous/Next navigation with progress save
- ✅ **Review** page showing answered/unanswered counts
- ✅ **Submitting** state with loading indicator
- ✅ **Completed/Result** view with:
  - ✅ Overall score with color-coded label
  - ✅ Section-level performance breakdown
  - ✅ Navigation to history and dashboard

### Assessment History Page (`/assessment/history`)
- ✅ Lists all completed assessment results
- ✅ Shows assessment name, date, and score
- ✅ Click navigates to result detail page
- ✅ Empty state when no history exists

### Assessment Result Detail Page (`/assessment/result/:resultId`)
- ✅ Full result display with section breakdown
- ✅ Progress bars per section
- ✅ Color-coded scoring labels (Strong/Good/Developing/Needs Improvement)
- ✅ Assessment version displayed

---

## 6. Routes

| Route                          | Component              | Protected | Status |
| ------------------------------ | ---------------------- | --------- | ------ |
| `/assessment`                  | `Assessment`           | ✅        | ✅     |
| `/assessment/history`          | `AssessmentHistory`    | ✅        | ✅     |
| `/assessment/result/:resultId` | `AssessmentResultDetail` | ✅      | ✅     |

---

## 7. Dashboard Integration

- ✅ Dashboard service imports `AssessmentProgress` and `AssessmentResult` models
- ✅ Assessment status is real (queries database), not hardcoded
- ✅ Assessment status reflects: `not_started`, `in_progress`, or `completed`
- ✅ Completed assessments show `overallScore` on dashboard
- ✅ Next step engine adapts to assessment completion status
- ✅ Career journey steps update based on assessment status
- ✅ Quick actions update based on assessment status
- ✅ Activity log includes assessment-related entries

---

## 8. Seed Script

- ✅ `backend/src/seed/seedRunner.ts` created
- ✅ Seeds 8 assessment types with 5–6 questions each
- ✅ Questions distributed across 2–3 sections per assessment
- ✅ Includes MCQ, Likert, and self-rating question types
- ⚠️ **Not executed** — requires MongoDB to be running locally

---

## 9. Build Verification

```
Backend: npm run build → ✅ PASS (0 errors)
Frontend: npm run build → ✅ PASS (0 errors, 1930 modules, 488 kB gzipped)
```

---

## 10. Constraints Verified

| Constraint                                          | Status |
| --------------------------------------------------- | ------ |
| Class 10 does NOT receive assessment                | ✅     |
| Selection uses both `educationLevel` + `careerObjective` | ✅ |
| Data-driven sections and questions (not hardcoded in React) | ✅ |
| Assessment versioning preserved across all models   | ✅     |
| `attemptId` uniquely identifies attempts            | ✅     |
| Duplicate submissions prevented                     | ✅     |
| Duplicate results prevented                         | ✅     |
| Backend authoritative for scoring                   | ✅     |
| Backend authoritative for timer expiration          | ✅     |
| Frontend never receives correct answers             | ✅     |
| Frontend never receives scoring metadata            | ✅     |
| No Gemini AI integration                            | ✅     |
| No recommendation/roadmap engine                    | ✅     |

---

## Summary

```
Phase 9 Status: PASS
Critical Issues: 0
High Issues: 0
Medium Issues: 0
Low Issues: 1 (seed not executed — requires MongoDB service)
```
