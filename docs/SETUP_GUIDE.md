# SETUP_GUIDE.md

# AI Career Mentor – Setup Guide

---

# 1. Prerequisites

Before starting, install the following software:

### Required

* Node.js (v20 LTS or later)
* npm (v10+)
* Git
* VS Code
* MongoDB Atlas Account
* Google AI Studio Account (BYOK)
* Cloudinary Account

### Recommended VS Code Extensions

* ESLint
* Prettier
* Tailwind CSS IntelliSense
* MongoDB for VS Code
* Error Lens
* GitLens
* Thunder Client (or Postman)

---

# 2. Clone the Repository

```bash
git clone <repository-url>

cd ai-career-mentor
```

---

# 3. Project Structure

```text
ai-career-mentor/

frontend/

backend/

docs/

README.md
```

---

# 4. Frontend Setup

Move to the frontend folder.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Default URL

```text
http://localhost:5173
```

---

# 5. Backend Setup

Move to the backend folder.

```bash
cd backend
```

Install dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

Default URL

```text
http://localhost:5000
```

---

# 6. Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_super_secret_key

JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_google_ai_studio_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173

# Email configurations (Nodemailer credentials placeholder)
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password
```

---

# 7. Frontend Environment

Create a `.env` file inside the frontend folder.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

# 8. MongoDB Setup

1. Create a MongoDB Atlas cluster.
2. Create a database named:

```text
ai_career_mentor
```

3. Create a database user.
4. Whitelist your IP (or use 0.0.0.0/0 for development).
5. Copy the connection string into `MONGODB_URI`.

---

# 9. Google AI Studio (BYOK) Setup

1. Sign in to Google AI Studio.
2. Create an API key.
3. Store it in:

```env
GEMINI_API_KEY
```

The backend will use this key for:

* Stream recommendations
* Career recommendations
* Degree recommendations
* Learning roadmap
* Resume analysis
* Internship guidance
* Job recommendations

---

# 10. Cloudinary Setup

1. Create a Cloudinary account.
2. Copy:

* Cloud Name
* API Key
* API Secret

3. Add them to the backend `.env`.

Cloudinary stores:

* Resume PDFs
* Profile Photos
* Optional user uploads

---

# 11. Install Frontend Dependencies

```bash
npm install react-router-dom

npm install @tanstack/react-query

npm install react-hook-form

npm install zod

npm install @react-pdf/renderer

npm install framer-motion

npm install recharts

npm install sonner

npm install lucide-react

npm install axios

npm install clsx

npm install tailwind-merge
```

Initialize shadcn/ui.

```bash
npx shadcn@latest init
```

---

# 12. Install Backend Dependencies

```bash
npm install express

npm install mongoose

npm install dotenv

npm install cors

npm install helmet

npm install bcrypt

npm install jsonwebtoken

npm install multer

npm install cloudinary

npm install nodemailer

npm install zod

npm install pdf-parse

npm install axios

npm install express-rate-limit

npm install express-validator

npm install morgan
```

Development dependencies

```bash
npm install -D nodemon
```

---

# 13. Folder Structure

## Frontend

```text
src/

assets/

components/

context/

hooks/

layouts/

pages/

routes/

services/

utils/

constants/

types/
```

## Backend

```text
config/

controllers/

middleware/

models/

prompts/

repositories/

routes/

services/

utils/

validators/
```

---

# 14. Running the Application

Start the backend.

```bash
cd backend

npm run dev
```

Open a new terminal.

Start the frontend.

```bash
cd frontend

npm run dev
```

Application URLs

Frontend

```text
http://localhost:5173
```

Backend

```text
http://localhost:5000
```

---

# 15. Initial Development Order

1. Authentication
2. Education Details
3. Student Profile
4. Dashboard
5. Assessment Engine
6. Gemini Integration
7. Recommendations
8. Career Roadmap
9. Learning Roadmap
10. Resume Builder
11. Internship Module
12. Job Module

---

# 16. Build Commands

Frontend

```bash
npm run build
```

Backend

```bash
npm run start
```

---

# 17. Coding Standards

* Use TypeScript if enabled (recommended).
* Keep components small and reusable.
* Use async/await for all asynchronous operations.
* Validate all inputs on both frontend and backend.
* Do not expose API keys in the frontend.
* Use environment variables for all secrets.

---

# 18. Git Workflow

Create a feature branch.

```bash
git checkout -b feature/module-name
```

Commit changes.

```bash
git add .

git commit -m "Add dashboard module"
```

Push changes.

```bash
git push origin feature/module-name
```

Merge after review.

---

# 19. Troubleshooting

### MongoDB Connection Error

* Verify `MONGODB_URI`.
* Check Atlas network access.
* Ensure the database user has correct permissions.

### Gemini API Error

* Verify `GEMINI_API_KEY`.
* Check API quota and model availability.
* Ensure the backend is sending valid requests.

### CORS Error

* Verify `CLIENT_URL`.
* Confirm CORS middleware configuration.

### Cloudinary Upload Error

* Verify Cloudinary credentials.
* Check file size and supported formats.

---

# 20. Verification Checklist

Before starting development, verify:

* Node.js installed
* Dependencies installed
* MongoDB Atlas connected
* Google Gemini API key configured
* Cloudinary configured
* Frontend starts successfully
* Backend starts successfully
* API responds correctly
* Database connection established

---

# 21. Next Steps

Once setup is complete:

1. Register a new user.
2. Complete Education Details.
3. Fill the Student Profile.
4. Open the Dashboard.
5. Test an AI Assessment.
6. Generate AI Recommendations.
7. Verify MongoDB data.
8. Confirm Gemini responses.
9. Test resume upload.
10. Validate internship and job recommendation flows.

The project is now ready for feature development and integration.
