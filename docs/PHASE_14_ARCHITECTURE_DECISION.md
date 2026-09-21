# Phase 14 — Architecture Decision Record: Internship & Jobs

This document outlines the resolved architecture details, database models, and workflow constraints for the Internship + Jobs matching portal.

---

## 1. Confirmed Requirements & Workflow

The module connects students to verified testing/development job and internship listings matching their career tracks.
- **Workflow**:
  - Class 11/12: Restricted. Directed to educational roadmaps.
  - Diploma/UG/PG: Enabled if career objective is `find_internship` or `find_job`. Requires completion of the corresponding `internship_readiness` or `job_readiness` assessment.
- **Actions**:
  - Browse available listings (Filtered by skills and location).
  - Save opportunities to a personal tracking dashboard.
  - Track application status and write personal interview preparation notes.
  - Open external application links (Applications are completed off-platform).

---

## 2. Server-Side Eligibility Pipeline

The backend independently enforces access constraints via middleware validation:
1. **JWT Verification**: Checks active session user ID `req.user.id`.
2. **Allowed Education Level**: Allows only `Diploma`, `UG`, and `PG`. If user is `Class11` or `Class12`, returns `403 Forbidden` ("This resource is not available for your education level. Focus on educational roadmap planning first.").
3. **Career Objective Match**: Assures careerObjective matches:
   - `find_internship` for Internship listings.
   - `find_job` for Job listings.
   - Otherwise returns `403 Forbidden` ("Your career objective must be set to find_internship/find_job to access opportunities.").
4. **Profile Completion**: Asserts profile completeness `profileCompletion.completionPercentage === 100`. Returns `403 Forbidden` ("Please complete your profile to 100% first.").
5. **Readiness Assessment Check**:
   - Mapped to:
     - `find_internship` ➔ `internship_readiness` assessment result exists.
     - `find_job` ➔ `job_readiness` assessment result exists.
   - If missing, returns `403 Forbidden` ("Please complete your career readiness assessment first.").
6. **Resume Checklist Verification**: Checks `UserResume.findOne({ userId })`. If none exists, returns `403 Forbidden` ("Please construct and save a resume using the Resume Builder first.").

---

## 3. SavedOpportunity Uniqueness Index

To track bookmarks, application progress, and notes without altering platform-level listings, a new user-owned Mongoose collection is introduced:

### `saved_opportunities`
- Schema fields:
  - `userId`: ObjectId (ref: 'User', required)
  - `opportunityType`: String (enum: ['job', 'internship'], required)
  - `opportunityId`: ObjectId (required)
  - `status`: String (enum: ['saved', 'applied', 'interviewing', 'accepted', 'rejected'], default: 'saved')
  - `notes`: String (max 1000 characters)

- **Compound Unique Index**:
  - A unique compound index is defined on:
    `{ userId: 1, opportunityType: 1, opportunityId: 1 }`
  - This prevents duplicate bookmarks while allowing different users (e.g. User A and User B) to save the same listing independently.

---

## 4. Deterministic Opportunity Matching Formula

No AI or external APIs are used for matching. The match score is computed dynamically on the server:

$$\text{Match Score} = \frac{|\text{User Skills} \cap \text{Opportunity Required Skills}|}{|\text{Opportunity Required Skills}|} \times 100$$

- **Inputs**: User's skills array from `StudentProfile` and the required skills array from the platform listing.
- **Constraints**: If the opportunity requires no skills, the score defaults to 100%. The output is a deterministic integer score from 0 to 100.

---

## 5. Security & URL Redirect Restrictions

External redirect links `applicationLink` must pass strict security checks before rendering or redirecting:
- **HTTPS Enforced**: Must begin with `https://`.
- **Private Networks Blocked**: Must not point to private address ranges (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) or localhost/loopback interfaces.
- **Protocol Safety**: Rejects scripts (e.g. `javascript:`) or data schemes to prevent cross-site scripting (XSS).
- **Redirection Dialog**: Frontend displays a notice card: *"You are leaving AI Career Mentor to apply on an external website. This application status is manually tracked by you."*

---

## 6. Seed Data & Test Listing Transparency

- Seed datasets (`jobs.seed.ts` and `internships.seed.ts`) contain an attribute `isTestData: { type: Boolean, default: true }`.
- Frontend listings render a prominent amber warning label:
  `[Demo Entry]: This is a test seed listing for development and readiness checks and does not represent a live vacancy.`

---

## 7. Platform vs User Ownership
- **Platform Opportunities**: `Job` and `Internship` collections are read-only for regular users. Write operations are restricted to admin credentials.
- **User Actions**: `SavedOpportunity` collections are writable only by their verified owner, checked via JWT `req.user.id`.

---

## 8. Application Status Semantics
- Supported Enum: `saved` | `applied` | `interviewing` | `accepted` | `rejected`.
- **Status Updates**: Updated manually by the student for tracking purposes. The status is not synchronized with external employers.

---

## 9. Intentionally Deferred Items
- **On-platform applications**: No automated email submissions or employer portals are supported. All applications are tracked manually by status toggles after external redirect.
- **Automatic Resume Parsing**: Local file PDF uploads and Cloudinary ATS feedback is deferred to later phases.
