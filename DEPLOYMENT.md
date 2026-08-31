# Deploy runbook

## Option A — Local single-port (current dev flow)

```bash
cd backend && npm install && npx prisma migrate deploy && node seed.js && node src/server.js   # API on :5000
cd ../frontend && npm install && npm run build
cd .. && node proxy.js   # app on :8080
```

## Option B — Docker (all-in-one)

```bash
docker compose up --build   # app on :8080, db + backend inside compose
```

## Option C — Render (free cloud) + GitHub Pages (frontend)

### C1. Deploy the API + DB on Render

1. In Render: **New → Blueprint** → connect this repo (it reads `render.yaml` at the repo root).
2. Render creates a free Postgres and a `loyalty-backend` web service, wiring `DATABASE_URL` and generating `JWT_SECRET` automatically.
3. After the backend is live, run its seed once (Render → service → Shell):
   ```bash
   node seed.js
   ```

### C2. Point GitHub Pages at that backend

In the repo: **Settings → Secrets and variables → Actions → Variables**, add:

- `API_URL` = `https://loyalty-backend.onrender.com`
- `UPLOADS_URL` = `https://loyalty-backend.onrender.com/uploads`

Then push anything to `main` (or run the **Deploy to GitHub Pages** workflow manually). The Pages site will call that backend.

### C3. URLs

- Frontend: `https://<username>.github.io/Loyalty-Program-voucher/`
- Backend health: `https://loyalty-backend.onrender.com/health`

## Notes

- Render free tier sleeps after idle — first request after sleep can take ~30s (cold start). This is expected on free plans.
- CORS: the backend allows `bavi2005.github.io` and `localhost:8080` by default. Extend via the `CORS_ORIGINS` env var (comma-separated).
