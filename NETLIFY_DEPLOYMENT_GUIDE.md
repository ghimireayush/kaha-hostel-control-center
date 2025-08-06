# Netlify Deployment Guide for Kaha Hostel Control Center

## Prerequisites
- GitHub account
- Netlify account (free tier available)
- Your backend API deployed and accessible

## Step 1: Prepare Your Repository

1. **Update Environment Variables**
   - Edit `.env.production` and replace `https://your-production-api-domain.com/api/v1` with your actual production API URL
   - If you're using Clerk for authentication, add your Clerk publishable key:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
     ```

2. **Test Local Build**
   ```bash
   cd kaha-hostel-control-center
   npm install
   npm run build
   npm run preview
   ```

## Step 2: Deploy to Netlify

### Option A: Git-based Deployment (Recommended)

1. **Push to GitHub**
   - Ensure your code is pushed to a GitHub repository on the `backend` branch
   - Make sure the `netlify.toml` file is in your repository root

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your repository
   - **Important**: Change the branch from `main` to `backend` in the deploy settings
   - Netlify will auto-detect the build settings from `netlify.toml`

3. **Configure Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add your production environment variables:
     - `VITE_API_BASE_URL`: Your production API URL
     - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk key (if using Clerk)
     - Any other environment variables your app needs

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your site automatically

### Option B: Manual Deployment

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

## Step 3: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify

## Step 4: Set up Continuous Deployment

With Git-based deployment, every push to your `backend` branch will trigger a new deployment automatically.

### Branch Configuration
- **Production branch**: `backend`
- **Deploy previews**: Any pull requests to `backend` branch
- **Branch deploys**: Only `backend` branch (you can add other branches if needed)

## Important Notes

1. **API CORS**: Ensure your backend API allows requests from your Netlify domain
2. **Environment Variables**: Never commit sensitive keys to your repository
3. **Build Optimization**: The build is optimized for production with code splitting and minification
4. **SPA Routing**: The `_redirects` file ensures React Router works correctly on Netlify

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Ensure all dependencies are listed in `package.json`
- Verify environment variables are set correctly

### API Requests Fail
- Check CORS settings on your backend
- Verify the API URL in environment variables
- Check browser network tab for specific error messages

### 404 Errors on Page Refresh
- Ensure `_redirects` file is in the `public` folder or root
- Check that the redirect rule is working in Netlify dashboard

## Build Configuration Details

The `netlify.toml` file configures:
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js version: 18
- SPA redirect rules for React Router
- Environment-specific configurations

Your site will be available at: `https://your-site-name.netlify.app`