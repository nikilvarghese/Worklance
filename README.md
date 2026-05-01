# Worklance

Worklance is a full-stack job marketplace with two role-based workspaces:

- Job seekers can browse jobs, filter listings, apply, save roles, and track application status.
- Employers can post jobs, edit/archive listings, review applicants, and manage a hiring pipeline.

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, Heroicons, Axios
- Backend: Node.js, Express, JWT auth, Multer uploads
- Database: MongoDB with Mongoose
- Auth: JWT bearer tokens stored in local storage for this local build

## Run In VS Code

Open two terminals from `C:\Users\NIKIL\Documents\jobportal`.

Terminal 1:

```powershell
npm run server
```

Terminal 2:

```powershell
npm run client
```

Then open:

- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/api/health

If your MongoDB database is empty, seed demo data:

```powershell
npm run seed
```

Demo accounts after seeding:

- Job seeker: `user@demo.com` / `password123`
- Employer: `hr@demo.com` / `password123`

## Environment

Create `.env` from `.env.example` if needed:

```powershell
Copy-Item .env.example .env
```

Required values:

- `MONGO_URI`
- `JWT_SECRET`
- `PORT` defaults to `5000`
- `CLIENT_URL` defaults to `http://localhost:3000`

## Project Structure

```text
jobportal/
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  scripts/seed.js
  client/
    src/
      components/
      pages/
      styles/
      utils/
```

## API Surface

- `POST /api/auth/user/register`
- `POST /api/auth/hr/register`
- `POST /api/auth/user/login`
- `POST /api/auth/hr/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `GET /api/jobs`
- `POST /api/jobs`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `GET /api/applications`
- `POST /api/applications`
- `PUT /api/applications/:id/status`
- `GET /api/saved`
- `POST /api/saved`
- `DELETE /api/saved/:id`
- `GET /api/dashboard`

## Deployment Notes

- Build the frontend with `npm run build`.
- The Express server serves `client/build` in production.
- Use MongoDB Atlas or a managed MongoDB instance.
- Set `JWT_SECRET`, `MONGO_URI`, and `CLIENT_URL` in the host environment.
- Recommended hosts: Render/Railway/Fly.io for API, Vercel/Netlify for frontend, or a single Node host serving both.

## Monetization Ideas

- Premium employer job posts with featured placement.
- Candidate boost with priority applications and profile insights.
- Employer analytics for pipeline conversion, applicant quality, and source tracking.
- Email notification add-on for interview reminders and application updates.
