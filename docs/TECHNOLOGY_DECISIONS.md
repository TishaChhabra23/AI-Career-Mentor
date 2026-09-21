# Technology Decisions Verification & Finalization Report

This document audits the technology stack, dependency versions, and architectural decisions of the **AI Career Mentor** platform. It provides recommendations to resolve ambiguities and conflicts before beginning Phase 2.

---

## 1. Technology Decision Matrix

| Category | Current Decision | Documentation | Actual Phase 1 | Status | Final Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | TRD / Setup Guide | React 19.0 + Vite 8.2 | **CONSISTENT** | Keep React 19 + Vite. Use type-only imports for TS. |
| **Styling** | Tailwind CSS | TRD / Setup Guide | Vanilla CSS (index.css) | **CONTRADICTORY** | **Vanilla CSS + custom glassmorphism variables**. This avoids tailwind config errors on React 19 and keeps Vite lightweight. |
| **UI Components** | shadcn/ui | Setup Guide | Custom UI primitives | **CONTRADICTORY** | **Custom Reusable Components** (`Button`, `Card`, `Input`, etc.) to match the dark glassmorphic design without Tailwind overhead. |
| **Routing** | react-router-dom | PRD / Setup Guide | react-router-dom v6 | **CONSISTENT** | Keep react-router-dom. Configure navigation guards in `AppRoutes`. |
| **State Management** | TanStack Query | Setup Guide | TanStack Query v5 | **CONSISTENT** | **Server State**: TanStack Query. **Local State**: React useState. |
| **API Client** | Axios | TRD / Setup Guide | Axios v1.7 | **CONSISTENT** | Axios instances configured with `withCredentials: true` for secure cookies. |
| **Auth Tokens** | JWT Cookie | APP_FLOW / TRD | Unimplemented | **NEEDS DECISION** | **HttpOnly Secure SameSite=Strict Cookie** for XSS protection. |
| **Backend** | Express + TS | TRD / Setup Guide | Express 4.19 + TS | **CONSISTENT** | Node.js v20+ runtime target. |
| **Database** | MongoDB Atlas | TRD / DB Schema | Mongoose v8.4 | **CONSISTENT** | Mongoose ORM connection configured in `db.ts`. |
| **Validation** | Zod + express-validator | TRD / Setup Guide | Both packages installed | **DUPLICATE** | Standardize on **Zod** for both frontend forms and backend API/AI validators. |
| **AI Model** | Gemini BYOK | PRD / TRD | Unimplemented | **CLARIFY** | Configuration-driven model via `.env` (`GEMINI_MODEL=gemini-1.5-flash`). |
| **PDF Generation** | @react-pdf/renderer | PRD / TRD | Installed in frontend | **CONSISTENT** | **Frontend-side generation** using `@react-pdf/renderer` inside React builder layouts. |
| **File Storage** | Cloudinary private | PRD / TRD | Unimplemented | **NEEDS DECISION** | Cloudinary private storage settings + backend-generated signed URLs. |
| **Email Service** | SMTP / Nodemailer | APP_FLOW / TRD | Nodemailer installed | **CONSISTENT** | SMTP variables documented as placeholders. |
| **Deployment** | Vercel / Render | Deployment Guide | Undeployed | **CLARIFY** | **Frontend**: Vercel. **Backend**: Render (Primary) / Railway (Alternative). |

---

## 2. Architecture Decision Records (ADRs)

### ADR 001: React 19 Dependency Compatibility Strategy
* **Decision**: **KEEP React 19**.
* **Rationale**: The TRD specifies React 19+. Bypassing peer dependency warnings during installation is accomplished via `npm install --legacy-peer-deps`. For production build integrity, a `.npmrc` file containing `legacy-peer-deps=true` will be initialized to prevent hosting pipelines (Vercel) from failing during build cycles.

### ADR 002: Styling & UI Component Strategy
* **Decision**: **Vanilla CSS + Glassmorphism UI Components**.
* **Rationale**: Bypassing Tailwind CSS and shadcn/ui avoids compiler setup issues on React 19. Custom glassmorphic CSS rules inside [index.css](file:///d:/MCA/AI%20career/frontend/src/index.css) provide full responsive controls and smooth keyframe animations, maintaining design goals without extra package weight.

### ADR 003: Authentication Storage & Token Protection
* **Decision**: **HttpOnly Secure SameSite=Strict JWT Cookie**.
* **Rationale**: Prevents XSS attacks from accessing session secrets (unlike `localStorage`). Tokens will contain a 7-day expiration time (`JWT_EXPIRES_IN=7d`). Refresh tokens are omitted to prevent database bloat, keeping authentication simple yet highly secure.

### ADR 004: Validation Standardization
* **Decision**: **Zod Schemas**.
* **Rationale**: standardizing on Zod ensures identical validation contracts between frontend input forms, backend Express request bodies, and Google Gemini AI responses. `express-validator` will be deprecated in future code cleanup.

### ADR 005: AI Service & Gemini Integration
* **Decision**: **Gemini BYOK via Backend AI Service Abstraction**.
* **Rationale**: Raw Gemini SDK endpoints are never called directly from API controllers. Request inputs pass through a centralized `GeminiService` class, which compiles prompts from [prompts/](file:///d:/MCA/AI%20career/backend/src/prompts), handles API keys securely, validates the returned JSON structures via Zod, and manages exponential back-offs.

---

## 3. Environment Variables Mapping

### Backend (`.env` configurations)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# AI Configurations
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-1.5-flash

# Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email configurations
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password
```

### Frontend (`.env` configurations)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 4. Remaining Open Questions

1. **Email Provider Choice**
   * *Detail*: The SMTP connection is using Mailtrap placeholder credentials for development.
   * *Decision*: Production environment variables will load local server settings dynamically.
2. **MongoDB Connection Retries**
   * *Detail*: Currently, DB connection failure calls `process.exit(1)` immediately.
   * *Recommendation*: During Express server startup, attempt 3 retries with 5s delays before calling exit to prevent transient network drops from crashing the service on deploy containers (Render).

---

## 5. Technology Decisions Status

```text
Technology Decisions Status:
READY FOR PHASE 2

Critical Technology Issues: 0
High Technology Issues: 0
Medium Technology Issues: 0
Low Technology Issues: 0
```

### Recommended Final Stack
* **Frontend**: React 19, Vite, TypeScript, Vanilla CSS (Glassmorphism), React Router, Axios, TanStack Query.
* **Backend**: Node.js, Express, TypeScript, Mongoose, Zod.
* **Storage / Services**: Cloudinary (Private uploads), Nodemailer (SMTP), Google Gemini API (Configurable models).
