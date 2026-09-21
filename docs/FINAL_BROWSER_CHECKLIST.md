# FINAL_BROWSER_CHECKLIST.md

# AI Career Mentor – Final Browser Checklist

---

# Purpose

This checklist verifies that every feature, page, API, AI integration, and user flow is working correctly before the application is considered production-ready.

---

# 1. Browser Compatibility

Verify the application works correctly in:

| Browser                | Status |
| ---------------------- | ------ |
| Google Chrome (Latest) | ☐      |
| Microsoft Edge         | ☐      |
| Mozilla Firefox        | ☐      |
| Safari                 | ☐      |

Checks

* Layout renders correctly
* Navigation works
* Animations work
* Forms work
* Charts render
* Responsive layout maintained

---

# 2. Responsive Design

Test on:

| Device  | Status |
| ------- | ------ |
| Mobile  | ☐      |
| Tablet  | ☐      |
| Laptop  | ☐      |
| Desktop | ☐      |

Verify

* Sidebar
* Navbar
* Dashboard Cards
* Forms
* Tables
* Charts
* Resume Builder
* Assessment Pages

---

# 3. Authentication & Account Deletion

## Register
* ☐ Create account works
* ☐ Form Zod validation works
* ☐ Duplicate email prevention handles HTTP conflict codes
* ☐ Password encryption check in database
* ☐ User record stored in MongoDB

---

## Login
* ☐ JWT token cookie generated (HttpOnly verified)
* ☐ Invalid login handled correctly
* ☐ Protected frontend and backend routes return 401/403 where unauthorized
* ☐ Password Reset Request (Forgot password sends template email via Nodemailer)
* ☐ Token validation for resetting passwords (expired tokens return explicit messages)
* ☐ Reset password saves and invalidates token

---

## Logout & Account Deletion
* ☐ Session cleared on client and cookie removed
* ☐ Redirect to Login page immediately
* ☐ Delete Account requests verification
* ☐ Account deletion API (DELETE /api/v1/auth/account) clears all MDB documents (Profile, results, progress, roadmaps)
* ☐ Cloudinary private attachments deleted successfully
* ☐ User redirected to login with account confirmation toast

---

# 4. Education & Objective Details

Verify
* ☐ Class 10 form fields
* ☐ Class 11 form fields
* ☐ Class 12 form fields
* ☐ Diploma form fields
* ☐ UG form fields
* ☐ PG form fields

Dynamic & Career Objective Fields
* ☐ Stream selector
* ☐ Course selector
* ☐ Semester / CGPA selectors
* ☐ Career Objective enum input ("explore_stream" | "explore_degree" | "explore_career" | "find_internship" | "find_job" | "higher_studies")

---

# 5. Student Profile

## Class 10
* ☐ Interests subjects, strengths, hobbies inputs
* ☐ Career goals / aspirations

---

## Class 11
* ☐ Current Stream details
* ☐ Interests, strengths, hobbies inputs
* ☐ Career goals

---

## Class 12
* ☐ Preferred Degree & Career Goals
* ☐ Learning Style text input (Class 12 relevant)

---

## Undergraduate (UG) / Diploma
* ☐ Skills, Projects, and Certifications arrays
* ☐ Work Experience custom array (if applicable)
* ☐ Resume reference checks
* ☐ LinkedIn and GitHub URLs
* ☐ Career Objective options

---

## Postgraduate (PG)
* ☐ Skills and Certifications arrays
* ☐ Work Experience structured details (company, role, dates, details)
* ☐ Resume reference checks
* ☐ LinkedIn and GitHub URLs
* ☐ Career Goal and Career Objective settings

---

# 6. Dashboard Summary API

Verify
* ☐ Single unified GET summary payload loading (`GET /api/v1/dashboard/summary`)
* ☐ Dynamic dashboard widgets adjust for UG + find_internship flow
* ☐ Dynamic dashboard widgets adjust for UG + find_job flow
* ☐ Dynamic dashboard widgets adjust for PG + find_internship flow
* ☐ Dynamic dashboard widgets adjust for PG + find_job flow
* ☐ Profile completion progress percentage bar
* ☐ Next recommended actions card fetches correct route links
* ☐ Notifications and recent activities summary loaded

---

# 7. AI Assessment Engine

Verify
* ☐ Available assessments load based on Education Level + Career Objective combinations
* ☐ Start assessment API triggers progress tracking record creation in `assessment_progress`
* ☐ Autosave: Partial selections trigger PUT requests to `/api/v1/assessments/:id/progress`
* ☐ Resume: Refreshing the browser or logging back in fetches incomplete test selections and sets current index
* ☐ Submit: calculates dynamically mapped section scores on the backend and saves to `assessment_results`
* ☐ Assessment history: Previous results table renders scores, dates, and matches

Assessment Flow Rules
* ☐ Class 10 (explore_stream) -> no test, AI profile recommendation triggers immediately
* ☐ Class 11 (explore_career) -> Aptitude test triggers
* ☐ Class 12 (explore_degree) -> Degree selection test triggers
* ☐ UG (explore_career) -> Skill & Career test triggers
* ☐ PG (explore_career) -> Career readiness test triggers
* ☐ UG/PG + find_internship -> Internship readiness test triggers
* ☐ UG/PG/Diploma + find_job -> Job readiness test triggers

---

# 8. Google Gemini Integration

Verify

* ☐ API Key configured
* ☐ Backend integration working
* ☐ Prompt generation successful
* ☐ JSON response validated
* ☐ AI explanation displayed
* ☐ Error handling implemented
* ☐ Retry logic works

---

# 9. Recommendations

Verify

* ☐ Stream Recommendation
* ☐ Degree Recommendation
* ☐ Career Recommendation
* ☐ Skill Gap Analysis
* ☐ Alternative Suggestions
* ☐ Confidence Score
* ☐ Save Recommendation
* ☐ Regenerate Recommendation

---

# 10. Career Roadmap

Verify

* ☐ Timeline
* ☐ Milestones
* ☐ Certifications
* ☐ Projects
* ☐ Save
* ☐ Export

---

# 11. Learning Roadmap

Verify

* ☐ Weekly Plan
* ☐ Monthly Goals
* ☐ Recommended Courses
* ☐ Certifications
* ☐ Practice Projects

---

# 12. Resume Module

Verify Option A: Uploaded Resume
* ☐ Resume file uploader accepts PDF/DOCX format
* ☐ Private upload configuration on Cloudinary verified
* ☐ Signed URL token required to read resume file
* ☐ PDF text extraction (`pdf-parse`) succeeds on the backend
* ☐ ATS Score and AI layout recommendations generate without exposing files to public URLs

Verify Option B: Custom Resume Builder
* ☐ Custom builder template selection renders layouts correctly
* ☐ Edits saved to `user_resumes` collection (`POST/PUT /api/v1/resumes/builder`)
* ☐ Frontend PDF generation with `@react-pdf/renderer` exports layout templates accurately

---

# 13. Internship Module

Verify

* ☐ Internship Listing
* ☐ Search
* ☐ Filters
* ☐ AI Matching
* ☐ Save Internship
* ☐ View Details

---

# 14. Job Module

Verify

* ☐ Job Listing
* ☐ Search
* ☐ Filters
* ☐ AI Matching
* ☐ Salary Insights
* ☐ Save Job

---

# 15. Notifications

Verify

* ☐ Toast Notifications
* ☐ Notification Panel
* ☐ Read / Unread
* ☐ Notification History

---

# 16. Settings

Verify

* ☐ Update Profile
* ☐ Change Password
* ☐ Notification Preferences
* ☐ Account Settings

---

# 17. File Upload

Verify

* ☐ Resume PDF
* ☐ Profile Photo
* ☐ Invalid File Handling
* ☐ File Size Validation
* ☐ Cloudinary Upload

---

# 18. API Testing

Verify

* ☐ Authentication APIs
* ☐ Education APIs
* ☐ Profile APIs
* ☐ Assessment APIs
* ☐ Recommendation APIs
* ☐ Resume APIs
* ☐ Internship APIs
* ☐ Job APIs

---

# 19. Database

Verify

* ☐ User Created
* ☐ Education Saved
* ☐ Profile Saved
* ☐ Assessment Stored
* ☐ Recommendation Stored
* ☐ Resume Stored
* ☐ Notifications Stored

---

# 20. Performance

Verify

* ☐ Lazy Loading
* ☐ Skeleton Loading
* ☐ Fast Navigation
* ☐ Image Optimization
* ☐ API Response Time
* ☐ AI Loading State

---

# 21. Security & Resource Ownership

Verify
* ☐ JWT Authentication cookies are secure & HttpOnly
* ☐ Password encryption check
* ☐ Protected route redirection
* ☐ Input sanitization validation
* ☐ Rate limiting triggers after request spikes
* ☐ Resource Ownership Checks: Logged-in user attempting to fetch or update another user's profile, assessment progress, results, resumes, saved jobs, or roadmaps directly throws a `403 Forbidden` response and logs the breach
* ☐ Environment variables contain no raw credentials in repositories

---

# 22. Accessibility

Verify

* ☐ Keyboard Navigation
* ☐ Focus Indicators
* ☐ Labels for Inputs
* ☐ Color Contrast
* ☐ ARIA Labels (where applicable)

---

# 23. Error Handling

Verify
* ☐ Form validator display error labels
* ☐ API server error alerts (500 codes)
* ☐ Google Gemini API failures handled (app displays retry/backoff button)
* ☐ Zod schema validation mismatch on Gemini response triggers fallback recommendations rather than crash
* ☐ Database connectivity errors handled
* ☐ Invalid upload formats or file size excess rejected
* ☐ Empty database search listings display clean UI placeholders

---

# 24. UI / UX

Verify

* ☐ Dark Theme Consistency
* ☐ Responsive Layout
* ☐ Smooth Animations
* ☐ Skeleton Loaders
* ☐ Toast Messages
* ☐ Clean Typography
* ☐ Consistent Spacing
* ☐ Icon Alignment

---

# 25. Production Readiness

Verify

* ☐ Environment Variables
* ☐ MongoDB Atlas Connected
* ☐ Gemini API Working
* ☐ Cloudinary Working
* ☐ Frontend Deployed
* ☐ Backend Deployed
* ☐ Health Endpoint Responding

---

# 26. Final Acceptance Criteria

The project is considered complete only if:

* ☐ All modules function correctly.
* ☐ No critical bugs remain.
* ☐ AI recommendations are generated successfully.
* ☐ All assessments produce valid results.
* ☐ Dashboard is dynamic based on education level.
* ☐ Resume analysis works correctly.
* ☐ Internship and job recommendations are generated.
* ☐ The application is responsive across supported devices.
* ☐ APIs return expected responses.
* ☐ Database operations are reliable.
* ☐ Production deployment is successful.

---

# Project Completion Checklist

| Module               | Status |
| -------------------- | ------ |
| Authentication       | ☐      |
| Education Details    | ☐      |
| Student Profile      | ☐      |
| Dashboard            | ☐      |
| AI Assessment Engine | ☐      |
| Assessment Progress  | ☐      |
| Gemini Integration   | ☐      |
| Zod Validation       | ☐      |
| Recommendations      | ☐      |
| Career Roadmap       | ☐      |
| Learning Roadmap     | ☐      |
| Resume Upload PDF    | ☐      |
| Custom Resume Builder| ☐      |
| Internship Module    | ☐      |
| Job Module           | ☐      |
| Notifications        | ☐      |
| Settings             | ☐      |
| Testing              | ☐      |
| Deployment           | ☐      |

---

# Final Sign-off

**Project Name:** AI Career Mentor

**Version:** 1.0

**Status:** ☐ Ready for Submission

**Frontend:** ☐ Approved

**Backend:** ☐ Approved

**Database:** ☐ Approved

**AI Integration:** ☐ Approved

**Testing:** ☐ Approved

**Deployment:** ☐ Approved

**Overall Project:** ☐ Approved
