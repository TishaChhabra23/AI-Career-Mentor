# Phase 14 — Internship & Jobs: Pre-Implementation Architecture Audit

This audit reviews the current architecture blueprint and codebase status for the upcoming Internship + Jobs module, identifying gaps, consistency constraints, and security requirements prior to coding.

---

## 1. Documentation Audit Summary

Based on `PRD.md`, `APP_FLOW.md`, `DATABASE_SCHEMA.md`, `TRD.md`, and `SDD.md`, the approved architecture defines:
* **Scope**: Platform-level whitelisted job and internship listings filtered by user eligibility metrics.
* **Filtering & Matching**: Matching should check matching skills, career goals, and qualifications.
* **Application Workflow**:
  - `UG / PG + find_internship`: Internship Readiness Test ➔ Private Resume Upload ➔ AI Matcher ➔ Saved Internships List.
  - `UG / PG + find_job`: Job Readiness Test ➔ Private Resume Upload ➔ Interview Prep / Salary Insights ➔ Saved Jobs List.
- **Ownership Model**: Jobs and internships are platform-wide read-only collections. Users cannot edit, delete, or create them. However, user-specific listings (e.g. saved/bookmarked entries, application tracking progress) must be scoped to the authenticated user's JWT ID.
- **External Redirects**: Applications are completed externally via whitelisted `applicationLink` redirects.

---

## 2. Existing Codebase Audit

### Current Status
* **Models**: No Mongoose schemas exist for `Job`, `Internship`, or user-specific `SavedOpportunities` / `Applications`.
* **Controllers & Routes**: No REST endpoints or controller structures are declared.
* **Services & Validators**: No validation checks or filtering pipelines are written.
* **Seed Scripts**:
  - `jobs.seed.ts` and `internships.seed.ts` exist under `backend/src/seed/` as basic array placeholders (containing 1 entry each).
  - Seed runner `seedRunner.ts` **does not** import or execute these files.
* **Frontend Pages**:
  - `Internships` and `Jobs` components in `frontend/src/pages/Placeholders.tsx` are static placeholders returning static empty states.

---

## 3. Database Schema Verification & Gaps

### Gaps Identified
While the database schema defines `internships` (Collection 11) and `jobs` (Collection 12) for platform opportunities, it **completely lacks** any collection or schema definitions for:
1. **Saved Opportunities** / **Bookmarks** (e.g. `saved_jobs` or `saved_internships`).
2. **Application Tracking** (e.g. tracking state: `Applied`, `Interview`, `Rejected`, `Accepted`, `Saved`).

> [!WARNING]
> To comply with the architecture rules, we should not create any new undocumented collections. We must document this database schema gap and obtain user review on how to track saved opportunities (e.g. whether we should create user-owned collections for saved opportunities, or map them as arrays in `StudentProfile`).

---

## 4. Data Source Strategy
- **Seeded Listings**: The platform uses controlled seed datasets (`jobs.seed.ts` and `internships.seed.ts`) representing development/testing opportunities.
- **No Web Scraping**: The architecture explicitly prohibits web scraping and third-party job feed integrations.
- **Transparency**: Listings must be clearly represented to users as seed test data.

---

## 5. Eligibility Logic Rules
1. **Class 11/12**: Restricts access to job/internship listings (prompts "Focus on educational roadmaps").
2. **UG/PG / Diploma**: Grants access depending on objective (`find_internship` or `find_job`).
3. **Assessment Check**: Enforces that the user has completed the relevant readiness assessment (e.g. `internship_readiness` or `job_readiness`).

---

## 6. Security & Privacy Requirements
- **JWT Scope**: Scopes all user actions (saving opportunities, loading bookmarks) to `req.user.id`.
- **URL Sanity**: External whitelisted `applicationLink` URLs are validated to prevent cross-site scripting (XSS) or unsafe internal redirects.
- **Platform Read-Only**: Users must not have permissions to modify, delete, or create platform opportunities.

---

## 7. Categorized Risks & Architecture Gaps

### Critical Gaps
* **Missing Saved Opportunities Collection**: The `DATABASE_SCHEMA.md` lists `internships` and `jobs` collections but lacks any table mapping user bookmarks or applications.
* **Orphaned Seed Scripts**: Seed datasets are not compiled or run by the seed manager `seedRunner.ts`.

### High Gaps
* **Unresolved Resume Linkages**: The PRD outlines attaching resumes to applications, but since applications redirect to external links, the resume attachment is a static checklist verification before redirecting.

---

## 8. Recommended Phase 14 Implementation Order

1. **Step 1: Database Setup** - Implement `Job` and `Internship` schemas, and define a schema for `SavedOpportunity` to handle user bookmarks.
2. **Step 2: Seed Setup** - Wire up `jobs.seed.ts` and `internships.seed.ts` to run automatically via `seedRunner.ts`.
3. **Step 3: API Service Layer** - Build controllers and validator schemas for CRUD bookmarks and opportunities listing.
4. **Step 4: Frontend UI Portal** - Replace placeholders with interactive listing feeds, filters, search, and external redirects.
