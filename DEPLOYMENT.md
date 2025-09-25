# 🚀 Clubify Deployment Guide

## Quick Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Step 1: Deploy Backend to Railway
1. Go to [Railway.app](https://railway.app) and sign up with GitHub
2. Create a new project
3. Connect your GitHub repository
4. Select your `server` folder as the root directory
5. Add environment variables:
   - `PORT=5001`
   - `MONGODB_URI=your-mongodb-atlas-connection-string`
   - `NODE_ENV=production`
6. Deploy and note the generated URL (e.g., `https://your-app.railway.app`)

#### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Import your GitHub repository
3. Set the root directory to `client`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-app.railway.app`
5. Deploy

### Option 2: Full-Stack on Railway
1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add two services:
   - Frontend service (root: `client`)
   - Backend service (root: `server`)
4. Configure environment variables for both services
5. Deploy both services

### Option 3: Vercel + Vercel Functions
1. Deploy frontend to Vercel
2. Move backend API routes to Vercel Functions
3. Deploy as a single application

## Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `<username>`, `<password>`, and `<dbname>` in the connection string

## Environment Variables

### Backend (.env)
```
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clubify?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## Pre-Deployment Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Set up MongoDB Atlas database
- [ ] Configure environment variables
- [ ] Test locally with production environment variables
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update frontend environment variables with backend URL
- [ ] Test deployed application

## Post-Deployment

1. Create your first admin user
2. Configure system settings
3. Test all functionality
4. Set up custom domain (optional)
5. Configure SSL certificates (automatic with most platforms)

## Troubleshooting

### Common Issues:
- CORS errors: Ensure backend allows your frontend domain
- Database connection: Check MongoDB Atlas IP whitelist
- Environment variables: Verify all variables are set correctly
- Build errors: Check for missing dependencies

### Support:
- Check platform-specific documentation
- Review application logs
- Test API endpoints independently
