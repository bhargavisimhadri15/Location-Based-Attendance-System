# Location-Based Attendance System

Geofenced attendance tracking built with the MERN stack. Employees can **check in / check out only when physically within an allowed radius** of an admin-defined location, with basic anti-spoofing checks (GPS accuracy threshold) and role-based access control.

## Key features
- **Geofencing** using the **Haversine** distance formula
- **GPS accuracy filtering** (rejects poor/likely spoofed readings)
- **JWT auth + RBAC** (Admin vs Employee)
- **Atomic sessions** (no double check-in without check-out)
- **Admin tools** for managing locations and viewing attendance logs

## Tech stack
- **Frontend:** React + Vite, TailwindCSS, Framer Motion
- **Backend:** Node.js + Express
- **DB:** MongoDB + Mongoose (`2dsphere` indexing for locations)

## Project structure
- `backend/` Express API
- `frontend/` React app
- `DOCUMENTATION.md` detailed system notes + API list

## Quick start (local)

### 1) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend env (`backend/.env`):
- `PORT` (default in example: `5001`)
- `MONGO_URI` (local example: `mongodb://127.0.0.1:27017/attendance-system`)
- `JWT_SECRET`

### 2) Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend env (`frontend/.env`):
- `VITE_API_BASE_URL` (example: `http://localhost:5001`)

## API (high level)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Attendance: `POST /api/attendance/checkin`, `POST /api/attendance/checkout`, `GET /api/attendance/status`
- Admin: `POST /api/admin/locations`, `GET /api/admin/locations`, `GET /api/admin/attendance`, `GET /api/admin/users`

## Notes
- Desktop testing: use Chrome DevTools → **Sensors** to simulate location coordinates.

