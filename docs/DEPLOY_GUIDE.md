# Deploy Guide: put the website online (Render, free)

After this, your website gets a public link like `https://tuition-finder-xxxx.onrender.com` that anyone can open.

## Before you start
- The project must already be on GitHub (see DEMO_AND_GITHUB_GUIDE.md). Make sure the folder `backend/frontend_dist` is on GitHub too.
- Use the **Singapore** region everywhere (closest to Bangladesh).
- Free plan facts (checked on Render's docs, they can change): a free web service goes to sleep after 15 minutes without visitors and takes about 1 minute to wake up. A free database expires 30 days after creation.

## Step 1: Create a Render account
Go to render.com → **Get Started** → **Sign up with GitHub** → allow access.

## Step 2: Create the database
1. Dashboard → **New +** → **PostgreSQL**.
2. Name: `tuition-db`. Region: **Singapore**. Plan: **Free**. Click **Create Database**.
3. Wait until the status is "Available". Open the database page and copy the **Internal Database URL**. Keep it ready for Step 3.

## Step 3: Create the web service
1. Dashboard → **New +** → **Web Service** → connect your `tuition-finder` GitHub repository.
2. Fill in:
   - **Name:** tuition-finder
   - **Region:** Singapore
   - **Root Directory:** `backend`
   - **Runtime / Language:** Python 3
   - **Build Command:** `bash build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
   - **Instance Type:** Free
3. Under **Environment Variables**, add these 5:

| Key | Value |
|---|---|
| PYTHON_VERSION | 3.12.3 |
| DJANGO_DEBUG | 0 |
| DJANGO_SECRET_KEY | a long random text (see below) |
| DATABASE_URL | the Internal Database URL from Step 2 |
| SEED_DEMO | 1 |

To make a secret key, run this on your laptop and paste the result:
```
python -c "import secrets; print(secrets.token_urlsafe(50))"
```
4. Click **Create Web Service**.

## Step 4: Wait and open
The first build takes about 5 to 10 minutes. Watch the **Logs** tab. When you see "Your service is live", click the link at the top of the page. Login with `admin / admin12345` to test.

## Step 5: Secure it (important)
`SEED_DEMO` creates demo accounts with passwords you have shared, so anyone could log in as admin on a public link.
1. In Render → your service → Environment → change `SEED_DEMO` to `0`.
2. Open `https://YOUR-LINK/django-admin/`, login as admin → **Users** → admin → change the password.

## Before presenting
- Open your link **5 minutes before** the presentation so the sleeping server wakes up.
- Keep the laptop version (README) ready as a backup in case the internet fails.
- Create the database no more than a few days before the presentation (it expires after 30 days).

## Updating the website later
1. Change the code. If you changed anything inside `frontend/`, run `npm run build` inside `frontend/` (this updates `backend/frontend_dist`).
2. `git add .` → `git commit -m "your message"` → `git push`.
3. Render deploys automatically.

## If something goes wrong
- **Build failed:** open the Logs tab, copy the last red lines and send them to your helper.
- **Page shows "Frontend build not found":** `backend/frontend_dist` was not pushed. Run `npm run build` in `frontend/`, then `git add .`, commit and push.
- **Site is slow the first time:** normal, it was asleep.
- **"Cannot reach the server" on login:** refresh after the build finishes; check the Logs tab for errors.

Render's screens may look slightly different from the labels above. If so, the official docs are at render.com/docs.
