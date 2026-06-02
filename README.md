
# Lifeline

## Overview

Lifeline is a React + Vite frontend with a Node + Express API and a MySQL (XAMPP MariaDB) database.

Default local addresses:

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Database: MySQL/MariaDB on port 3306

## Quick Start (Most Important)

Use two terminals every time you run the system.

Terminal A (API):

```bash
npm run api
```

Terminal B (Frontend):

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

If you run only the frontend, login/register/chat will fail.

## First-Time Setup (Fresh Clone)

1. Install dependencies.

```bash
npm install
```

2. Start MySQL in XAMPP.

3. Import schema from [db/lifeline_schema.sql](db/lifeline_schema.sql).



## Phone / LAN Testing

1. Find your PC LAN IP (example: 10.0.0.108).

2. Run frontend with host enabled:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

3. Keep API running:

```bash
npm run api
```

4. Open on phone:

- http://YOUR_PC_LAN_IP:5173

5. Verify API from phone browser:

- http://YOUR_PC_LAN_IP:3001/health

If phone can open health but app still fails, hard refresh phone browser and ensure Windows Firewall allows Node.js on Private network.

## Google Sign-In Notes

1. Use OAuth 2.0 Client ID (Web application) in Google Cloud.

2. Authorized JavaScript origins should include at least:

- http://localhost
- http://localhost:5173

3. Use the same client ID in both:

- server/.env -> GOOGLE_CLIENT_ID
- project .env -> VITE_GOOGLE_CLIENT_ID

4. If you change origins/client IDs, restart both servers.

## Demo Accounts

Student:

- Email: student@uic.edu.ph
- Password: student123

Counselor:

- Email: counselor@uic.edu.ph
- Password: counselor123

## Troubleshooting

### Unable to connect to the server / Failed to fetch

1. Confirm API is running at http://localhost:3001.
2. Confirm MySQL is running and server/.env DB values are correct.
3. Confirm frontend is also running.
4. For phone/LAN, use host mode on Vite and open LAN IP, not localhost.

### Google origin error (unregistered_origin)

1. Confirm browser origin exactly matches an Authorized JavaScript origin in Google Cloud.
2. Save OAuth settings, wait a few minutes, restart servers, hard refresh browser.

## Install Notes

- If npm install warns about recharts@2.15.2, that version is deprecated upstream. The app can still run.
- If npm reports vulnerabilities, check npm audit before using npm audit fix --force.
  