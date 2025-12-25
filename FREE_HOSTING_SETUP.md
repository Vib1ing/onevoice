# Free Hosting Setup Guide

You don't need to buy a domain! Here are free hosting options that work perfectly with Auth0.

## Recommended Options

### Option 1: GitHub Pages (Recommended for Students)
**Free subdomain:** `yourusername.github.io` or `yourusername.github.io/onevoice`

**Pros:**
- Completely free
- Easy to set up
- Great for student projects
- Free SSL (HTTPS)
- Can add custom domain later if needed

**Setup:**
1. Create a GitHub account (if you don't have one)
2. Create a new repository named `onevoice`
3. Upload your website files
4. Go to Settings → Pages
5. Select main branch as source
6. Your site will be at: `https://yourusername.github.io/onevoice/`

**Auth0 URL:** `https://yourusername.github.io/onevoice/admin.html`

---

### Option 2: Netlify (Easiest)
**Free subdomain:** `onevoice.netlify.app` or custom name

**Pros:**
- Very easy drag-and-drop deployment
- Automatic HTTPS
- Custom subdomain names
- Great free tier

**Setup:**
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop your website folder
3. Your site will be at: `https://onevoice.netlify.app` (or a random name)
4. You can change the site name in settings

**Auth0 URL:** `https://onevoice.netlify.app/admin.html`

---

### Option 3: Vercel
**Free subdomain:** `onevoice.vercel.app`

**Pros:**
- Fast deployment
- Great for static sites
- Free SSL

**Setup:**
1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repo or upload files
3. Deploy

**Auth0 URL:** `https://onevoice.vercel.app/admin.html`

---

## Quick Setup with GitHub Pages (Step-by-Step)

1. **Create GitHub Repository:**
   - Go to github.com
   - Click "New repository"
   - Name it: `onevoice`
   - Make it Public (required for free Pages)
   - Click "Create repository"

2. **Upload Your Files:**
   ```bash
   # In your project folder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/onevoice.git
   git push -u origin main
   ```
   
   OR use GitHub Desktop (easier):
   - Download GitHub Desktop
   - Add your repository
   - Commit and push your files

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings"
   - Scroll to "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be at: `https://YOUR_USERNAME.github.io/onevoice/`

4. **Update Auth0 Configuration:**
   
   In your Auth0 Dashboard → Application Settings:
   
   **Allowed Callback URLs:**
   ```
   https://YOUR_USERNAME.github.io/onevoice/admin.html
   ```
   
   **Allowed Logout URLs:**
   ```
   https://YOUR_USERNAME.github.io/onevoice/index.html
   ```
   
   **Allowed Web Origins:**
   ```
   https://YOUR_USERNAME.github.io
   ```

5. **Update Your Code:**
   
   In `auth-config.js`, the redirectUri should automatically work with:
   ```javascript
   redirectUri: window.location.origin + '/admin.html'
   ```
   
   This will automatically use your GitHub Pages URL!

---

## Using Netlify (Even Easier!)

1. **Sign up:** Go to netlify.com and create an account

2. **Deploy:**
   - Drag and drop your entire website folder onto Netlify
   - OR connect your GitHub repository

3. **Get Your URL:**
   - Netlify gives you a URL like: `https://onevoice-abc123.netlify.app`
   - You can change it in Site Settings → Change site name

4. **Update Auth0:**
   - Use your Netlify URL in Auth0 settings (same as GitHub Pages instructions above)

---

## Important Notes

### HTTPS is Required!
All free hosting services provide HTTPS automatically, which is required for Auth0. Your URLs will start with `https://`

### No Localhost Needed!
Once deployed, you'll use your free subdomain URL everywhere. No need for localhost!

### Adding a Custom Domain Later (Optional)
If you ever want to use a custom domain like `onevoice.org`:
- Buy a domain ($10-15/year from Namecheap, Google Domains, etc.)
- Add it in your hosting service's settings
- Update Auth0 URLs to use the new domain
- No code changes needed!

---

## Testing Locally First

If you want to test before deploying:

1. **Use a local server:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or use Live Server extension in VS Code
   ```

2. **For Auth0 testing locally only:**
   - Add `http://localhost:8000/admin.html` to Auth0 callback URLs
   - Remove it before deploying to production

---

## Recommended: GitHub Pages

For a student project, GitHub Pages is perfect because:
- ✅ Completely free
- ✅ Professional URL (github.io)
- ✅ Easy version control
- ✅ No credit card needed
- ✅ Works great with Auth0

Your final URL will be: `https://yourusername.github.io/onevoice/`

---

## Quick Checklist

- [ ] Choose hosting service (GitHub Pages recommended)
- [ ] Deploy your website
- [ ] Get your public URL (https://...)
- [ ] Update Auth0 settings with your URL
- [ ] Test login on your live site
- [ ] Done! No domain purchase needed!

