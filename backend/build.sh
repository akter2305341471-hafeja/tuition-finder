#!/usr/bin/env bash
# Build script used by Render. Exit on first error.
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput

# Optional demo data: set SEED_DEMO=1 in the Render environment variables
if [ "$SEED_DEMO" = "1" ]; then
  python manage.py seed_demo
fi
