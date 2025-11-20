# Netlify Deployment Configuration for TinyLink

This file documents how to deploy TinyLink to Netlify (frontend + serverless functions).

## Option 1: Render (Recommended) ✅

**Best for:** Full Node.js backend + persistent database

### Steps:
1. Push your code to GitHub (✅ done)
2. Go to https://dashboard.render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repository `Aganitha-Task`
5. Render will automatically detect `render.yaml` and configure deployment
6. Set environment variables (if needed):
   - `NODE_ENV=production`
   - `DATABASE_URL=file:./dev.db` (or use Render PostgreSQL)
7. Click "Create Web Service"
8. Deploy will start automatically (~2-3 minutes)

**URL:** `https://aganitha-task.onrender.com` (auto-generated subdomain)

---

## Option 2: Netlify (Workaround)

**Best for:** Static frontend + serverless API functions

### Limitations:
- Netlify's free tier has function execution time limits (10s)
- SQLite persists in memory during execution (data may be lost between requests)
- Better for CI/CD + preview deployments

### Alternative: Full-Stack on Netlify with Node.js Adapter

If you want to deploy full stack on Netlify, you'd need:
1. Wrap Express app with serverless-http adapter
2. Add `netlify.toml` configuration
3. Convert to serverless functions

**This is more complex and Render is simpler for this project.**

---

## Option 3: Vercel (Alternative)

Similar to Render but focuses on Next.js/JAM stack apps.
Would require converting Express to Vercel Functions (less straightforward).

---

## Recommended: Render

✅ **Why Render is best for TinyLink:**
- Supports full Node.js + Express
- Persistent SQLite database on disk
- Free tier available (with limitations)
- Easy GitHub integration
- Auto-deploys on push to `main`
- Environment variables managed in dashboard
- Logs viewable in real-time

---

## Post-Deployment Checklist

After deploying to Render:

- [ ] Visit your deployed app at `https://aganitha-task.onrender.com`
- [ ] Test creating a link (dashboard)
- [ ] Test redirect (click a short code)
- [ ] Test API endpoints:
  - `GET https://aganitha-task.onrender.com/healthz`
  - `POST https://aganitha-task.onrender.com/api/links`
  - `GET https://aganitha-task.onrender.com/api/links`
- [ ] Check server logs in Render dashboard for errors
- [ ] Set custom domain (if you have one)

---

## Custom Domain (Optional)

1. In Render dashboard → Settings → Custom Domain
2. Add your domain (e.g., `tinylinks.com`)
3. Update DNS records to point to Render

---

## Database Migrations on Deploy

The `render.yaml` includes a `preDeployCommand` that runs migrations automatically:
```bash
npx prisma migrate deploy || npx prisma migrate dev --name init
```

This ensures your database schema is up-to-date on every deploy.

---

## Free Tier Limits (Render)

- **Compute:** Shared CPU, 0.5 GB RAM
- **Execution:** Request timeout 30 seconds
- **Database:** File-based SQLite (no external DB)
- **Bandwidth:** Limited
- **Sleep:** Free tier services spin down after 15 minutes of inactivity

**For production use:** Upgrade to paid plans or use PostgreSQL add-on.

---

## Troubleshooting

### 500 Error on Deploy
- Check Render logs: Dashboard → Your Service → Logs
- Ensure all environment variables are set
- Verify Prisma migrations ran successfully

### Database Not Found
- Check `DATABASE_URL` is set to `file:./dev.db`
- Run migrations manually in Render shell (if needed)

### Port Issues
- Render sets `PORT` automatically; don't override it
- Your app reads from `process.env.PORT || 3000` ✅ (already correct)

---

## Deploy Now!

Ready? Go to: **https://dashboard.render.com** → "New Web Service" → Select your GitHub repo → Deploy!
