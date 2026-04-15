# CVT Portal – School Management System

A centralized, secure, and scalable platform for managing academic, administrative, and student-related operations.

## Architecture

| Layer | Technology |
|---|---|
| Backend API | Python 3.12 · Django 6 · Django REST Framework |
| Authentication | JWT (djangorestframework-simplejwt) + TOTP 2FA (pyotp) |
| Frontend | React 18 · React Router v6 · Axios |
| Database | SQLite (dev) → PostgreSQL (production) |
| CORS | django-cors-headers |

---

## Modules Implemented

### 🔑 Authentication & Access
- **Register** – email, registration number, role, password
- **Login** – email *or* registration number + password
- **2FA (TOTP)** – QR-code setup, OTP confirmation, disable flow
- **Password reset** – request link via email, confirm with token
- **JWT session management** – access + refresh tokens, token blacklist on logout
- **Role-based dashboards** – Student, Lecturer, Administrator, Parent/Guardian, External Examiner

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optional
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The React app will be available at `http://localhost:3000`.

---

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register/` | Create a new account | Public |
| POST | `/api/auth/login/` | Sign in (email/reg-no + password) | Public |
| POST | `/api/auth/logout/` | Blacklist refresh token | 🔒 |
| POST | `/api/auth/token/refresh/` | Refresh access token | Public |
| GET/PATCH | `/api/auth/profile/` | View / update profile | 🔒 |
| POST | `/api/auth/change-password/` | Change password | 🔒 |
| POST | `/api/auth/password-reset/` | Request password reset email | Public |
| POST | `/api/auth/password-reset/confirm/` | Confirm reset with token | Public |
| GET | `/api/auth/2fa/setup/` | Generate TOTP secret + QR code | 🔒 |
| POST | `/api/auth/2fa/setup/` | Activate 2FA with OTP | 🔒 |
| POST | `/api/auth/2fa/disable/` | Disable 2FA | 🔒 |

---

## Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@yourschool.ac.ke
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourschool.ac.ke
FRONTEND_URL=https://yourdomain.com
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## Running Tests

### Backend
```bash
cd backend
python manage.py test accounts --verbosity=2
```

### Frontend
```bash
cd frontend
npm test
```
