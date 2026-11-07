# Demo and GitHub Guide

## Part A: How to show the website to your teacher

### Before the presentation (do this once, the day before)
1. Run the backend and frontend (see README). Open http://localhost:5173.
2. Run `python manage.py seed_demo` so demo data exists.
3. Open the site in **two browsers** (or one normal + one incognito window). This lets you stay logged in as two roles at once.
4. Make sure `python manage.py test` shows "OK". You can show this as proof of quality.

### Demo script (about 8 to 10 minutes)
Say the sentence in quotes, then do the action.

| Step | Do this | Say this |
|---|---|---|
| 1 | Show the home page | "Tuition is usually arranged through Facebook groups. Our platform makes it organized and trustworthy." |
| 2 | Register a new **tutor** account | "Users register with a role: guardian or tutor. Passwords are hashed with bcrypt." |
| 3 | In Tutor dashboard, fill in profile and save. Point at the **PENDING** badge | "A new tutor must be verified by the admin before applying. This stops fake tutors." |
| 4 | Try opening a tuition post and applying | "The system blocks unverified tutors." |
| 5 | Login as **admin** (other browser) → Tutor Verification → Approve the new tutor | "Admin verification feature." |
| 6 | Back as tutor: apply to a post | "Verified tutors can apply. Applying twice is blocked." (try it) |
| 7 | Login as **guardian1** → My Posts → create a new post | "Guardians create, edit and delete posts." |
| 8 | Login as **admin** → Post Moderation → Approve the post | "Admin moderates posts before they go public." |
| 9 | Open Tuitions page, use search by subject / area / salary | "Search and filter by class, subject, area and salary." |
| 10 | As guardian → Applications → **Accept** one tutor | "Accepting fills the post, rejects other applicants, and shows the tutor's contact." |
| 11 | As guardian → Hired Tutors & Reviews → give 5 stars | "Only hired tutors can be reviewed, once." |
| 12 | Open Tutors page → the tutor's profile | "Rating and reviews are public, which builds trust." |
| 13 | Admin → Overview, then Manage Users → **Block** a user. Try logging in as that user | "Dashboard shows users, posts and matches. Blocked users cannot log in." |
| 14 | Resize the browser narrow | "The UI is mobile responsive." |

### Questions your teacher may ask
- **Why Django + React?** Django gives built-in security (ORM, password hashing, admin) and React gives a fast, interactive UI. They talk through a REST API.
- **How is security handled?** bcrypt password hashing, JWT tokens, role-based permission classes on every API, Django ORM prevents SQL injection.
- **How do you prevent double applications?** A database unique constraint on (post, tutor) plus a check in the API.
- **How does the system stop fake tutors?** Admin must approve a tutor; only approved tutors can apply or appear in the tutor list.
- **What is the database design?** Tables: User, TutorProfile, GuardianProfile, TuitionPost, Application, Review. A tutor applies to many posts; a guardian has many posts and reviews tutors.
- **Future work?** Online payment, in-app chat, notifications, AI-based tutor recommendation.

### If something goes wrong during the demo
- Page shows "Cannot reach the server": the backend is not running. Start it with `python manage.py runserver`.
- Demo data messed up: stop the server, delete `backend/db.sqlite3`, then run `migrate` and `seed_demo` again.

---

## Part B: Upload to GitHub (part by part)

### 1. Create the repository
1. Go to github.com → **New repository** → name it `tuition-finder` → keep it Public or Private → **do not** add README → Create.
2. Invite your teammate: Settings → Collaborators → Add people.

### 2. First upload (one person does this)
Open a terminal in the `tuition-finder` folder:
```bash
git init
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/tuition-finder.git
```

Commit in parts so your history looks like real teamwork:
```bash
git add .gitignore README.md docs
git commit -m "docs: add project proposal, README and guides"

git add backend/config backend/manage.py backend/requirements.txt backend/.env.example
git commit -m "chore: set up Django project and settings"

git add backend/accounts
git commit -m "feat: Module 1 - authentication, profiles, tutor verification"

git add backend/tuitions
git commit -m "feat: Module 2 - tuition posts, search, apply and accept"

git add backend/reviews
git commit -m "feat: Module 3 - reviews and admin dashboard API"

git add frontend
git commit -m "feat: React frontend with role-based dashboards"

git push -u origin main
```

### 3. Teammate workflow
```bash
git clone https://github.com/YOUR-USERNAME/tuition-finder.git
git checkout -b feature/my-change
# ... edit files ...
git add .
git commit -m "feat: describe what you did"
git push origin feature/my-change
```
Then open a **Pull Request** on GitHub and merge it. Both members should have commits in the history.

### 4. Before submitting
- Replace nothing secret: `.env` and `db.sqlite3` are already ignored.
- Open the repo page and check that the README looks right.
- Send your teacher the repository link.

---

## Part C: Put the website online
See [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md). It deploys the whole project (frontend + backend + database) on Render for free, in one place.
For the presentation, keep the laptop version ready as a backup.
