# AI Career Mentor: Personalized Career Guidance Platform

AI Career Mentor is an intelligent web application designed to guide students and professionals through their academic and career journey—from selecting streams in Class 10 to securing employment.

---

## 1. Project Purpose
To provide tailored career path mapping, learning roadmaps, skills assessment scoring, resume optimization advice, and job/internship recommendations matched specifically against individual academic background and aspirations.

---

## 2. Technology Stack
* **Frontend**: React 19, Vite, TypeScript, Vanilla CSS (Glassmorphism), React Router, Axios
* **Backend**: Node.js, Express, TypeScript, Mongoose
* **Database**: MongoDB Atlas
* **AI Engine**: Google Gemini API (BYOK) via structured prompt validation
* **Storage**: Cloudinary (Private upload settings + signed URLs)

---

## 3. Repository Structure
```text
ai-career-mentor/
├── frontend/             # React SPA client
├── backend/              # Node.js Express service
├── docs/                 # Systems design & planning blueprint documents
├── .gitignore            # Git filter rules
└── README.md             # Project metadata summary
```

---

## 4. Local Setup Commands

### Prerequisites
* Node.js (v20+), npm, MongoDB Atlas cluster, and Google Gemini API key.

### Backend Setup
1. Move to backend folder and configure environment:
   ```bash
   cd backend
   cp .env.example .env
   # Edit backend/.env to include MongoDB and Gemini credentials
   ```
2. Install packages and start backend developer mode:
   ```bash
   npm install
   npm run dev
   ```
   * Access URL: `http://localhost:5000`

### Frontend Setup
1. Move to frontend folder and configure environment:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
2. Install packages and start Vite developer mode:
   ```bash
   npm install --legacy-peer-deps
   npm run dev
   ```
   * Access URL: `http://localhost:5173`

---

## 5. Documentation Location
All architectural specification files reside in the [docs/](file:///d:/MCA/AI%20career/docs) folder:
* **Product Requirements**: [PRD.md](file:///d:/MCA/AI%20career/docs/PRD.md)
* **Application Flows**: [APP_FLOW.md](file:///d:/MCA/AI%20career/docs/APP_FLOW.md)
* **Technical Spec**: [TRD.md](file:///d:/MCA/AI%20career/docs/TRD.md)
* **Software Design**: [SDD.md](file:///d:/MCA/AI%20career/docs/SDD.md)
* **Database Models**: [DATABASE_SCHEMA.md](file:///d:/MCA/AI%20career/docs/DATABASE_SCHEMA.md)

---

## 6. Development Status
* **Phase 1: Project Foundation**: Completed. Core directory structures, environment parameters, API health endpoint checks, custom design primitives, and React routing placeholding are fully configured and verified.
