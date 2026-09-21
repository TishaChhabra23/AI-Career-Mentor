# DEPLOYMENT_GUIDE.md

# AI Career Mentor – Deployment Guide

---

# 1. Deployment Overview

This project uses a cloud-based deployment architecture.

```text id="o7j8ha"
                Users
                   │
                   ▼
          Frontend (Vercel)
                   │
                   ▼
       Backend API (Render/Railway)
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
MongoDB Atlas   Gemini API   Cloudinary
```

---

# 2. Production Stack

| Service         | Platform                       |
| --------------- | ------------------------------ |
| Frontend        | Vercel                         |
| Backend         | Render (Recommended) / Railway |
| Database        | MongoDB Atlas                  |
| AI              | Google AI Studio (Gemini BYOK) |
| File Storage    | Cloudinary                     |
| Version Control | GitHub                         |

---

# 3. Deployment Prerequisites

Before deployment ensure:

* GitHub repository is updated
* MongoDB Atlas is configured
* Google Gemini API key is generated
* Cloudinary account is configured
* Environment variables are ready
* Production build runs successfully

---

# 4. Deploy Frontend (Vercel)

## Step 1

Push the frontend code to GitHub.

---

## Step 2

Import the repository into Vercel.

---

## Step 3

Framework

```text id="xbweu7"
Vite
```

---

## Step 4

Build Command

```text id="2r0c2r"
npm run build
```

---

## Step 5

Output Directory

```text id="kh2e6f"
dist
```

---

## Step 6

Environment Variables

```env id="7yx9wd"
VITE_API_BASE_URL=https://your-backend-domain/api/v1
```

---

# 5. Deploy Backend (Render)

## Step 1

Push backend to GitHub.

---

## Step 2

Create a new Web Service.

---

## Step 3

Runtime

```text id="jlwmol"
Node
```

---

## Step 4

Build Command

```text id="x2t8n8"
npm install
```

---

## Step 5

Start Command

```text id="sr8nm9"
npm start
```

(or)

```text id="jx2r4s"
node server.js
```

---

# 6. Backend Environment Variables

```env id="klg7s9"
NODE_ENV=production

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d

CLIENT_URL=https://your-vercel-domain.vercel.app

GEMINI_API_KEY=your_google_ai_studio_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

# Production SMTP Email credentials (no real credentials placed in repository)
MAIL_HOST=your_production_smtp_host
MAIL_USER=your_production_smtp_username
MAIL_PASS=your_production_smtp_password
```

---

# 7. MongoDB Atlas

## Production Checklist

* Cluster created
* Database user created
* IP access configured
* Database backups enabled
* Connection string updated

Database Name

```text id="lfsqz7"
ai_career_mentor
```

---

# 8. Google Gemini (BYOK)

Store the production API key securely.

Never expose the API key in the frontend.

All AI requests must flow through:

```text id="gb2n7z"
Frontend

↓

Backend

↓

Gemini API
```

Gemini Responsibilities

* Career Recommendation
* Degree Recommendation
* Stream Recommendation
* Resume Analysis
* Learning Roadmap
* Career Roadmap
* Internship Guidance
* Job Recommendation

---

# 9. Cloudinary

Upload Types
* Resume PDF
* Profile Image
* User Documents

Cloudinary Upload Security & Privacy Settings
* Resume PDFs must be uploaded with private settings (type: 'private', authenticated: true) to hide them from the public.
* Backend must validate user authorization ownership checks before serving files.
* Backend generates temporary signed URLs on Cloudinary on request to allow reading/analyzing of files.
* Only the parsed text content is sent to Google Gemini API (no raw PDF links sent, minimizing exposed surface).
* Store only secure Cloudinary URLs and metadata inside MongoDB.

---

# 10. Production Folder Structure

```text id="4wjlwm"
frontend/

backend/

docs/

README.md
```

---

# 11. Build Verification

Frontend

```bash id="kph3qi"
npm run build
```

Backend

```bash id="4zyq4q"
npm start
```

Ensure:

* No build errors
* No lint errors
* No missing environment variables

---

# 12. Health Check Endpoint

Create an endpoint:

```text id="9h1ow4"
GET /api/v1/health
```

Example Response

```json id="w1v3yy"
{
  "status": "OK",
  "database": "Connected",
  "ai": "Available",
  "timestamp": "2026-01-01T10:00:00Z"
}
```

Use this endpoint for deployment verification.

---

# 13. Security Checklist

* JWT authentication enabled
* Passwords hashed with bcrypt
* HTTPS enabled
* Environment variables secured
* Helmet middleware enabled
* CORS configured
* Rate limiting enabled
* Input validation implemented
* File upload validation enabled

---

# 14. Performance Checklist

Frontend

* Code splitting
* Lazy loading
* Skeleton loaders
* Image optimization

Backend

* Indexed MongoDB queries
* Pagination
* Efficient aggregation
* API response compression (recommended)

---

# 15. Monitoring

Recommended

* Render logs
* Vercel Analytics
* MongoDB Atlas Monitoring
* Cloudinary Dashboard

Monitor

* API response times
* AI request failures
* Database errors
* Upload failures
* Authentication errors

---

# 16. Backup Strategy

MongoDB

* Daily automated backups

Cloudinary

* Original files retained

GitHub

* Source code backup

Environment Variables

* Secure offline backup

---

# 17. Production Testing

Verify

* Registration
* Login
* Education Details
* Student Profile
* Dashboard
* Assessments
* Gemini Recommendations
* Resume Upload
* Career Roadmap
* Learning Roadmap
* Internship Module
* Job Module

---

# 18. Deployment Validation Flow

```text id="8e6bgz"
Deploy Backend
      │
      ▼
Configure MongoDB
      │
      ▼
Configure Gemini API
      │
      ▼
Configure Cloudinary
      │
      ▼
Deploy Frontend
      │
      ▼
Run Health Check
      │
      ▼
Test All Modules
      │
      ▼
Production Ready
```

---

# 19. Rollback Strategy

If deployment fails:

1. Roll back to the previous stable release.
2. Restore previous environment variables if needed.
3. Verify database connectivity.
4. Validate Gemini API configuration.
5. Redeploy after fixes.

---

# 20. Production Readiness Checklist

* Frontend deployed successfully
* Backend deployed successfully
* MongoDB connected
* Gemini API responding
* Cloudinary uploads working
* Authentication functional
* Protected routes secured
* Resume uploads successful
* AI recommendations generated
* Internship and job modules operational
* HTTPS enabled
* No critical console errors
* Mobile responsiveness verified

---

# 21. Deployment Summary

Production Environment

Frontend:

* Vercel

Backend:

* Render (or Railway)

Database:

* MongoDB Atlas

AI:

* Google Gemini (BYOK)

Storage:

* Cloudinary

This deployment architecture is scalable, secure, cloud-native, and suitable for production deployment of the AI Career Mentor platform.
