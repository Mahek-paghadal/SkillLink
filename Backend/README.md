# SkillLink Backend

A Node.js + Express backend with MongoDB (Mongoose) for authentication and admin features.

## Tech Stack
- Node.js, Express
- MongoDB Atlas via Mongoose
- JWT auth, bcryptjs for password hashing
- CORS, dotenv

## Getting Started
1. Install dependencies:
   - npm install
2. Configure environment:
   - Copy `.env.example` to `.env` and fill values
3. Run the server:
   - Development: `npm run dev`
   - Production: `npm start`
4. Health check: GET `/` returns "Backend is running"

## Environment Variables
- PORT
- MONGO_URI
- JWT_SECRET

## API
- POST `/api/auth/signup` { email, password, role: student|client }
- POST `/api/auth/login` { email, password }
- Admin (Bearer token required, role=admin):
  - GET `/api/admin/dashboard`
  - GET `/api/admin/users`
  - GET `/api/admin/stats`

## Notes
- Do NOT commit `.env` or secrets. Rotate any exposed secrets immediately.
