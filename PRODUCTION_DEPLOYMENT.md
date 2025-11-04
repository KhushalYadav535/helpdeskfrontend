# 🚀 Production Deployment Guide

## Frontend (Vercel) Configuration

### Step 1: Set Environment Variable in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `helpdeskfrontend`
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add this variable:

   **Name:** `NEXT_PUBLIC_API_URL`  
   **Value:** `https://helpdeskbackend-0r8s.onrender.com/api`  
   **Environment:** Production, Preview, Development (select all)

6. Click **Save**
7. **Important:** Redeploy your application after adding the variable:
   - Go to **Deployments** tab
   - Click the **⋮** (three dots) on latest deployment
   - Click **Redeploy**

### Step 2: Verify the Configuration

After redeploy, check:
1. Open your frontend: https://helpdeskfrontend-eta.vercel.app/
2. Open browser DevTools (F12) → Console
3. Try to login/register
4. Check Network tab - API calls should go to: `https://helpdeskbackend-0r8s.onrender.com/api`

---

## Backend (Render) Configuration

### Step 1: Update CORS in Backend

Your backend CORS is already configured to accept your Vercel frontend. 

If you need to update it, set the `CORS_ORIGIN` environment variable in Render:

1. Go to Render Dashboard: https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Add or update:

   **Key:** `CORS_ORIGIN`  
   **Value:** `https://helpdeskfrontend-eta.vercel.app`  
   
   Or for multiple origins (comma-separated):
   ```
   http://localhost:3000,https://helpdeskfrontend-eta.vercel.app
   ```

5. Click **Save Changes**
6. Render will automatically redeploy

### Step 2: Verify Backend Health

Test your backend:
```bash
curl https://helpdeskbackend-0r8s.onrender.com/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

---

## Local Development Setup

### Frontend (.env.local)

Create `.env.local` in frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)

Your backend `.env` should have:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Troubleshooting

### Issue: CORS Error in Browser

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. Check backend `CORS_ORIGIN` includes your Vercel URL
2. Make sure backend is redeployed after changing CORS
3. Check browser console for exact error

### Issue: API Calls Going to Localhost in Production

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Make sure you redeployed after adding the variable
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: 404 Not Found on API Calls

**Error:** `404 Route not found`

**Solution:**
1. Check backend URL is correct: `https://helpdeskbackend-0r8s.onrender.com/api`
2. Make sure backend service is running on Render
3. Check backend logs in Render dashboard

### Issue: 401 Unauthorized

**Solution:**
1. Check JWT token is being sent in Authorization header
2. Verify backend JWT_SECRET matches
3. Check token expiry

---

## Quick Checklist

- [ ] Frontend: `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] Frontend: Redeployed after adding env variable
- [ ] Backend: `CORS_ORIGIN` includes Vercel URL
- [ ] Backend: Service running on Render
- [ ] Backend: Health endpoint working
- [ ] Test: Login/Register working
- [ ] Test: API calls going to production backend

---

## URLs Reference

- **Frontend (Production):** https://helpdeskfrontend-eta.vercel.app/
- **Backend (Production):** https://helpdeskbackend-0r8s.onrender.com
- **Backend API:** https://helpdeskbackend-0r8s.onrender.com/api
- **Backend Health:** https://helpdeskbackend-0r8s.onrender.com/health

---

## Need Help?

1. Check browser DevTools Console for errors
2. Check Network tab for API call details
3. Check Render logs for backend errors
4. Check Vercel logs for frontend errors


