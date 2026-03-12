# Mera Clinic Deployment Guide

This setup assumes:

- Frontend: `https://clinic.mrsinghdev.com`
- API: `https://api.clinic.mrsinghdev.com`
- Frontend is deployed as a static Vite build
- Backend is deployed as Laravel behind Nginx + PHP-FPM

## Status

The project can be deployed with this domain split, but only with production env values and a fresh frontend build.

Use these files as the source of truth:

- [frontend/.env.production.example](/abs/path/c:/Users/Rohan%20Raj%20Singh/Projects/MeraClinic/MeraClinic/frontend/.env.production.example)
- [backend/.env.production.example](/abs/path/c:/Users/Rohan%20Raj%20Singh/Projects/MeraClinic/MeraClinic/backend/.env.production.example)
- [deploy/nginx/frontend.conf](/abs/path/c:/Users/Rohan%20Raj%20Singh/Projects/MeraClinic/MeraClinic/deploy/nginx/frontend.conf)
- [deploy/nginx/api.conf](/abs/path/c:/Users/Rohan%20Raj%20Singh/Projects/MeraClinic/MeraClinic/deploy/nginx/api.conf)

## Server Layout

Recommended paths:

- App root: `/var/www/meraclinic`
- Frontend build output served from: `/var/www/meraclinic/frontend/dist`
- Laravel app root: `/var/www/meraclinic/backend`
- Laravel public root: `/var/www/meraclinic/backend/public`

## Frontend

Create `frontend/.env.production` from the example and set:

```env
VITE_API_URL=https://api.clinic.mrsinghdev.com/api
```

Build:

```bash
cd /var/www/meraclinic/frontend
npm install
npm run build
```

Important:

- Do not deploy an old `dist/` build created against localhost.
- Rebuild after setting `VITE_API_URL`.

## Backend

Create `backend/.env` from the example and set at minimum:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.clinic.mrsinghdev.com
FRONTEND_URL=https://clinic.mrsinghdev.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mera_clinic
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

SANCTUM_STATEFUL_DOMAINS=clinic.mrsinghdev.com,api.clinic.mrsinghdev.com
```

Install and prepare:

```bash
cd /var/www/meraclinic/backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Nginx

Use separate server blocks:

- `clinic.mrsinghdev.com` serves only the frontend static build
- `api.clinic.mrsinghdev.com` serves Laravel from `backend/public`

Do not proxy `/api` through the frontend domain in production. The frontend should call the API domain directly via `VITE_API_URL`.

## SSL

Example:

```bash
sudo certbot --nginx -d clinic.mrsinghdev.com -d api.clinic.mrsinghdev.com
```

## Deploy Steps

```bash
cd /var/www/meraclinic
git pull

cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

cd ../frontend
npm install
npm run build
```

## Verification

Frontend:

```bash
curl -I https://clinic.mrsinghdev.com
```

API:

```bash
curl -I https://api.clinic.mrsinghdev.com/api/v1/auth/me
```

Storage:

- Uploaded files should resolve through `https://api.clinic.mrsinghdev.com/...`
- Run `php artisan storage:link` if file URLs break

## Notes

- Mail is still local in the current repo config. Replace Mailpit with a real SMTP provider in production.
- OTP/email flows will not be production-ready until SMTP is configured.
- If you change env values, rerun `php artisan config:clear && php artisan config:cache`.
