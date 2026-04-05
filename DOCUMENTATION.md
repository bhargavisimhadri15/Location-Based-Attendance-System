# Location-Based Attendance System

## 1. Project Overview
A robust MERN stack application designed to enforce geographic boundaries for employee check-in and check-out operations. The system ensures that attendance is only recorded when a user is physically present within a predefined radius of an authorized location.

---

## 2. Architecture & Design Decisions

### **Geospatial Validation**
- **Haversine Formula**: We utilize the Haversine formula for calculating the distance between two points on the Earth's surface. This is more reliable for short distances (geofencing) than direct Euclidean distance.
- **Accuracy Thresholds**: The system rejects any location data with an accuracy reading higher than **50 meters** to prevent spoofing or poor GPS signal issues.
- **Persistence**: Admin-predefined locations are stored with MongoDB `2dsphere` indices to allow for future scalability and advanced geospatial queries.

### **Authentication & Authorization**
- **JWT-Based**: Secure stateless authentication using JSON Web Tokens.
- **RBAC (Role-Based Access Control)**: Strictly differentiates between 'Admin' and 'Employee' roles. Admins manage the infrastructure, while Employees perform field actions.
- **Provisioning Model**: The first registered account bootstraps the system as **Admin**. After bootstrap, the Admin creates employee accounts and assigns permissible work sites (locations).

### **Concurrency & Consistency**
- **Atomic Sessions**: Employees cannot check in twice without checking out first.
- **Check-Out Validation**: Distance validation is performed *both* at check-in and check-out to ensure the employee remained on-site or returned to the site for shift completion.

---

## 3. API Documentation

### **Auth Endpoints**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Bootstrap admin (first user only) | Public |
| POST | `/api/auth/login` | Authenticate and receive JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Auth |

### **Attendance Endpoints**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/attendance/checkin` | Check in with GPS data | Employee |
| POST | `/api/attendance/checkout` | Check out from current session | Employee |
| GET | `/api/attendance/status` | Get current active session | Employee |

### **Admin Endpoints**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/admin/locations` | Define a new geofence site | Admin |
| GET | `/api/admin/locations` | List all available sites | Auth |
| PUT | `/api/admin/locations/:id` | Update a geofence site | Admin |
| DELETE | `/api/admin/locations/:id` | Delete a geofence site | Admin |
| GET | `/api/admin/attendance` | View all system-wide logs | Admin |
| GET | `/api/admin/users` | List all registered employees | Admin |
| POST | `/api/admin/users` | Create an employee | Admin |
| PUT | `/api/admin/users/:id` | Update employee profile/assignments | Admin |
| DELETE | `/api/admin/users/:id` | Delete an employee (blocked if attendance exists) | Admin |

### **Locations (Role-aware)**
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/api/locations` | Admin: all locations; Employee: assigned locations only | Auth |

---

## 4. Setup Instructions

### **Prerequisites**
- Node.js (v16+)
- MongoDB (Running locally on 27017 or a cloud URI)

### **Backend Setup**
1. Navigate to the `backend/` directory.
2. Create a `.env` file from the `.env.example` template.
3. Install dependencies: `npm install`.
4. Start the server: `npm run dev`.

### **Frontend Setup**
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`.
3. Start the Vite development server: `npm run dev`.
4. Access the app at `http://localhost:5173`.

---

## 5. Testing & Simulations

### **Simulating Geolocation**
To test the system from a desktop browser:
1. Open **Chrome DevTools** (F12).
2. Click the three dots (⋮) → **More tools** → **Sensors**.
3. Under **Location**, choose "Other..." and enter coordinates that match your defined sites in the Admin Console.
4. Refresh the page and perform a Check-In.

---

## 6. Implementation Status
- [x] Secure RBAC Authentication
- [x] Real-time Geolocation validation
- [x] Radius & Accuracy threshold enforcement
- [x] Admin Dashboard for Location Mgmt
- [x] Attendance Analytics for Admin
- [x] Premium Glassmorphic UI with Framer Motion
