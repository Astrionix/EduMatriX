# Deployment Guide for MCA Portal

## Prerequisites
- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account.
- Your **Supabase** project URL and Keys.
- Your **Groq** API Key.

## Step 1: Push Code to GitHub
1. Initialize git if you haven't:
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   ```
2. Create a new repository on GitHub.
3. Link and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel
1. Log in to your Vercel dashboard.
2. Click **"Add New..."** > **"Project"**.
3. Select your `MCA` repository and click **Import**.
4. **Configure Project:**
   - **Framework Preset:** Next.js (should be auto-detected).
   - **Root Directory:** `./` (default).
5. **Environment Variables:**
   Expand the "Environment Variables" section and add the following (copy values from your `.env.local`):
   
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` |
   | `GROQ_API_KEY` | `your_groq_api_key` |
   | `GEMINI_API_KEY` | `your_gemini_api_key` (if applicable) |

6. Click **Deploy**.
7. Wait for the build to complete. You will get a live URL (e.g., `https://mca-portal.vercel.app`).

## Step 3: Configure Supabase for Production
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project.
3. Navigate to **Authentication** > **URL Configuration**.
4. **Site URL:** Change this to your new Vercel URL (e.g., `https://mca-portal.vercel.app`).
5. **Redirect URLs:** Add your Vercel URL here as well:
   - `https://mca-portal.vercel.app/**`
6. Click **Save**.

## Step 4: Database & Storage Policies
- Ensure your RLS (Row Level Security) policies are secure.
- If you used any SQL scripts locally (like `broadcast_schema.sql`), make sure they are run in the Supabase SQL Editor if they weren't part of the initial migration.

## Troubleshooting
- **Build Failed?** Check the Vercel logs. Common issues are type errors (`npm run build` locally to check).
- **Login Not Working?** Double-check the Supabase URL Configuration (Step 3).
- **AI Not Working?** Verify the `GROQ_API_KEY` is set correctly in Vercel Environment Variables.

## Future Updates
- Whenever you push changes to the `main` branch on GitHub, Vercel will automatically redeploy your application!
