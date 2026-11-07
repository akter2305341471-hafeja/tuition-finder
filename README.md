# Tuition Finder

**Software Engineering Design Capstone Project** (SE331, Group 09, Fall 2026)

Tuition Finder is a web platform where guardians find qualified tutors and tutors find tuition jobs in one organized place. Guardians post tuition requirements, verified tutors apply, and guardians accept or reject applications. An admin verifies tutors, moderates posts and monitors the system.

Proposal: [docs/Project_Proposal.pdf](docs/Project_Proposal.pdf)

## Tech Stack
| Layer | Technology |
|---|---|
| Language | Python (backend), JavaScript (frontend) |
| Frontend | React (Vite) |
| Backend | Django + Django REST Framework |
| Styling | Bootstrap 4 |
| ORM | Django ORM (SQLite for development, PostgreSQL for production) |
| Auth | JWT (SimpleJWT), passwords hashed with bcrypt |
| Deployment | Cloud (Render for the demo, AWS-compatible: Django + PostgreSQL) |

## Features (all requirements from the proposal)
| Module | Feature | Where |
|---|---|---|
| 1. User & Authentication | Register / login with role (Guardian, Tutor), role-based access | `accounts/` |
| | Tutor profile create / edit | `accounts/`, `ProfileForm.jsx` |
| | Guardian profile create / edit | `accounts/`, `ProfileForm.jsx` |
| | Admin tutor verification (approve / reject) | `AdminDashboard.jsx` |
| 2. Tuition Management | Guardian creates, edits, deletes tuition posts | `tuitions/`, `GuardianDashboard.jsx` |
| | Search and filter (class, subject, area, salary) | `Tuitions.jsx` |
| | Tutor applies to a post | `TuitionDetail.jsx` |
| | Guardian accepts / rejects applications | `GuardianDashboard.jsx` |
| 3. Review & Admin | Guardian reviews and rates a tutor | `reviews/` |
| | Admin manages users (view, block, unblock) | `AdminDashboard.jsx` |
| | Admin moderates posts (approve, remove) | `AdminDashboard.jsx` |
| | Admin dashboard (users, posts, matches) | `AdminDashboard.jsx` |

**Non-functional requirements**
- Performance: lightweight pages, API responses are simple queries.
- Security: bcrypt password hashing, JWT authentication, every route protected by role.
- Usability: Bootstrap 4 responsive layout.
- Reliability: a tutor cannot apply twice (database constraint + check); blocked users cannot log in.

## Project Structure
```
tuition-finder/
  backend/
    config/       Django settings and URLs
    accounts/     Module 1: users, profiles, auth, tutor verification, user management
    tuitions/     Module 2: posts, search, applications
    reviews/      Module 3: reviews and admin dashboard stats
  frontend/
    src/pages/        Page components
    src/components/   Navbar, ProfileForm, shared UI
  docs/             Proposal and guides
```

## Run Locally

### Backend (http://localhost:8000)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows   (Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo      # demo users and posts
python manage.py runserver
```

### Frontend (http://localhost:5173)
```bash
cd frontend
npm install
npm run dev
```

### Demo accounts (created by `seed_demo`)
| Role | Username | Password |
|---|---|---|
| Admin | admin | admin12345 |
| Guardian | guardian1, guardian2 | password123 |
| Tutor (verified) | tutor1, tutor2 | password123 |
| Tutor (pending) | tutor3 | password123 |

### Run tests
```bash
cd backend
python manage.py test
```

## API Overview
| Method | Endpoint | Who |
|---|---|---|
| POST | `/api/auth/register/`, `/api/auth/login/` | Public |
| GET / PUT | `/api/profile/` | Guardian, Tutor |
| GET | `/api/tutors/`, `/api/tutors/<id>/` | Public |
| GET / POST | `/api/posts/` | Public / Guardian |
| GET / PUT / DELETE | `/api/posts/<id>/` | Public / owner Guardian |
| POST | `/api/posts/<id>/apply/` | Verified Tutor |
| GET | `/api/posts/<id>/applications/` | owner Guardian |
| POST | `/api/applications/<id>/decide/` | owner Guardian |
| POST | `/api/reviews/` | Guardian (hired tutors only) |
| GET / POST | `/api/admin/...` (users, tutors, posts, dashboard) | Admin |

## Deployment
The built React app is served by Django, so the whole project runs as **one** web service plus a PostgreSQL database. Step-by-step: [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md).

After changing anything in `frontend/`, run `npm run build` inside `frontend/` before committing. This refreshes `backend/frontend_dist`.

## Team
| ID | Name |
|---|---|
| 232-35-784 | Nowshin Rahman |
| 232-35-471 | Hafeja Akter |
