# 🚀 Frontend Deployment Guide (Vercel)

This guide walks you through deploying the GEC Event Portal frontend to **Vercel** (Free Tier).

## 📋 Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (sign up with GitHub for easy integration)
- Your backend already deployed (see `backend/DEPLOYMENT.md`)

---

## 🎯 Quick Deploy (Recommended)

### Step 1: Push Code to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gec-portal.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and click **"Sign Up"**
2. Choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account

### Step 3: Import Project

1. Click **"Add New..."** → **"Project"**
2. Find and select your `gec-portal` repository
3. Click **"Import"**

### Step 4: Configure Project

In the configuration screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` (click "Edit" and select) |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `dist` (auto-detected) |

### Step 5: Add Environment Variables

Click **"Environment Variables"** and add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend-name.onrender.com` |

> ⚠️ **Important**: Replace with your actual Render backend URL

### Step 6: Deploy!

Click **"Deploy"** and wait for the build to complete (usually 1-2 minutes).

---

## 🔗 Your Frontend URL

After deployment, Vercel will give you a URL like:
```
https://gec-portal-xxxxx.vercel.app
```

You can also add a custom domain in the Vercel dashboard.

---

## 🔄 Automatic Deployments

Once connected, Vercel will automatically:
- Deploy when you push to `main` branch
- Create preview deployments for pull requests

---

## ⚙️ Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://gec-portal-api.onrender.com` |

### Adding/Updating Variables

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add or edit variables
4. **Redeploy** for changes to take effect

---

## 🛠️ Troubleshooting

### Build Fails

1. Check the build logs in Vercel Dashboard
2. Ensure all dependencies are in `package.json`
3. Test locally with `npm run build`

### API Connection Issues

1. Verify `VITE_API_URL` is correct
2. Ensure backend is running on Render
3. Check CORS is configured on backend (should allow your Vercel URL)

### 404 on Page Refresh

The `vercel.json` file handles this with rewrites. If issues persist:
- Verify `vercel.json` is in the `frontend` folder
- Check rewrites configuration

---

## 📊 Vercel Free Tier Limits

| Feature | Limit |
|---------|-------|
| Deployments | Unlimited |
| Bandwidth | 100 GB/month |
| Build Minutes | 6,000/month |
| Serverless Functions | 100 GB-hours |

More than enough for a college project! 🎓

---

## 🔒 Security Checklist

- [ ] Never commit `.env` files to Git
- [ ] Use environment variables for all secrets
- [ ] Ensure `VITE_API_URL` points to HTTPS backend
- [ ] Review CORS settings on backend

---

## 📚 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI](https://vercel.com/docs/cli) (for advanced users)
