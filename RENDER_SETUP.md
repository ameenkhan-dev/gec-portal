# 🚀 GEC Portal - Render Deployment Guide

## Database Setup on Render (CRITICAL STEP)

The application is currently failing to login because **the PostgreSQL database on Render hasn't been set up yet**.

### Option 1: Use Render's Blueprint (Automatic - Recommended)

1. Go to https://render.com/dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository (ameenkhan-dev/gec-portal)
4. Point to `backend/render.yaml`
5. Render will automatically:
   - Create the PostgreSQL database
   - Deploy the Node.js backend
   - Set all environment variables
   - Run migrations automatically

**Status**: ✅ You've already deployed manually. The database may not exist yet.

### Option 2: Manually Create Database on Render

If you already have the backend deployed:

1. Go to https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `gec-portal-db`
   - **Database Name**: `gec_event_portal`
   - **User**: `gec_admin`
   - **Plan**: Free tier
   - **Region**: Same as your web service

4. After creation, copy the **Internal Database URL** (look like `postgresql://...`)

5. Add to your Render web service environment variables:
   - Go to your web service settings
   - Click "Environment"
   - Add:
     ```
     DATABASE_URL = postgresql://...  (paste the Internal Database URL)
     ```
   - Click "Deploy"

6. Render will redeploy and run migrations automatically

### Option 3: Manually Create Test Users (Quick Fix)

If database is already created but has no tables/users:

1. SSH into Render (if available) or use Render Shell:
   - Dashboard → Web Service → Shell (if available)
   - Run: `node backend/seed.js`

2. Or use psql directly:
   ```bash
   psql "postgresql://user:pass@host:5432/gec_event_portal" -f POSTGRES_SETUP.sql
   ```

---

## Testing the Database

After setup, check the health endpoint:

```bash
curl https://gec-portal-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "GEC Portal API running",
  "database": {
    "type": "PostgreSQL",
    "status": "connected"
  }
}
```

If `status: "disconnected"`, the database isn't accessible.

---

## Test Credentials (After Seed)

Once database is set up, use these to login:

| Email | Password | Role |
|-------|----------|------|
| admin@gec.ac.in | Admin123 | Super Admin |
| student@gec.ac.in | Student123 | Student |
| clubadmin@gec.ac.in | ClubAdmin123 | Club Admin |

---

## Troubleshooting

### Error: "500 error on login"
- Database isn't responding
- Tables don't exist
- **Fix**: Check `/api/health` endpoint for database status

### Error: "Cannot find database service"
- Database service never created on Render
- **Fix**: Manually create PostgreSQL service (Option 2 above)

### Error: "Permission denied"
- Database credentials wrong
- Internal URL is being used from external service (shouldn't happen)
- **Fix**: Check DATABASE_URL environment variable is correct

### Migrations not running
- Check Render logs for error messages
- Manually run: `npm run migrate` via Render shell

---

## Environment Variables Needed

Your web service should have:

```
NODE_ENV = production
PORT = 10000
DATABASE_URL = postgresql://gec_admin:PASSWORD@host:5432/gec_event_portal
JWT_SECRET = (auto-generated)
JWT_REFRESH_SECRET = (auto-generated)
JWT_EXPIRES_IN = 7d
JWT_REFRESH_EXPIRES_IN = 30d
ALLOWED_EMAIL_DOMAIN = gec.ac.in
```

---

## Commands to Run Locally (Testing)

If you want to test locally first:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with local MySQL config
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_NAME=gec_event_portal

# Run migrations to create tables
npm run migrate

# Seed test users
node seed.js

# Start server
npm run dev
```

---

## Next Steps

1. ✅ Check `https://gec-portal-api.onrender.com/api/health`
2. ⏳ Set up PostgreSQL database on Render if not already done
3. 🌱 Run seed script or migrations
4. 🔐 Test login with credentials above
5. 🎉 Celebrate!
