# Render Deployment Guide

## Prerequisites
1. Push backend code to GitHub repository
2. Create Render account at https://render.com

## Database Setup (PostgreSQL)
1. In Render dashboard, create a new PostgreSQL database:
   - Name: `crew-generator-db`
   - Database: `CrewManagement`
   - User: (auto-generated)
   - Password: (auto-generated)
   - Copy the DATABASE_URL for later use

2. Connect to database and run schema:
   ```bash
   # Use the DATABASE_URL from Render dashboard
   psql "postgresql://username:password@hostname:port/CrewManagement" < database/postgresql_schema.sql
   psql "postgresql://username:password@hostname:port/CrewManagement" < database/postgresql_seed.sql
   ```

## Web Service Setup
1. In Render dashboard, create a new Web Service:
   - Connect your GitHub repository
   - Branch: `main` (or your deployment branch)
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

## Environment Variables
Add these environment variables in Render dashboard:

### Required Variables
- `DATABASE_URL`: (auto-populated from PostgreSQL service)
- `NODE_ENV`: `production`
- `PORT`: `8080`
- `FRONTEND_URL`: `https://toddms.github.io`

### Google OAuth
- `GOOGLE_CLIENT_ID`: `426083525831-kc55rvgeo24eokfcuij09tm3b81djc26.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET`: `PGOCSPX-BJZc4en2tSnJrNMjdYZYgx9IZvSl`

### Session & Upload Config
- `SESSION_SECRET`: `your_super_secret_session_key_here_production_random123`
- `MAX_FILE_SIZE`: `5242880`
- `UPLOAD_DIR`: `src/assets/club-logos`

## Deployment Steps
1. Push code to GitHub
2. Create PostgreSQL database in Render
3. Run database schema and seed scripts
4. Create Web Service in Render
5. Configure environment variables
6. Deploy service

## Post-Deployment
1. Test API endpoints: `https://your-service-name.onrender.com`
2. Update frontend `.env.production` with your Render URL
3. Redeploy frontend to GitHub Pages

## Troubleshooting
- Check Render logs for deployment errors
- Ensure all environment variables are set correctly
- Verify database connection string
- Test API endpoints with curl or Postman