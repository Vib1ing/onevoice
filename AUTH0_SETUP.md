# Auth0 Setup Instructions

This guide will help you set up Auth0 authentication for your OneVoice website with a whitelist system.

## Step 1: Create Auth0 Account

1. Go to [https://auth0.com](https://auth0.com) and sign up for a free account
2. Log in to your Auth0 Dashboard

## Step 2: Create an Application

1. In the Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Name it "OneVoice Admin" (or any name you prefer)
4. Select **Single Page Application** as the application type
5. Click **Create**

## Step 3: Configure Application Settings

1. Go to the **Settings** tab of your application
2. Find these settings and configure them:

### Allowed Callback URLs
Add your website URL (use your free hosting subdomain):
```
https://yourusername.github.io/onevoice/admin.html
https://onevoice.netlify.app/admin.html
```
**Or if using a custom domain:**
```
https://yourdomain.com/admin.html
```

### Allowed Logout URLs
Add your website URL:
```
https://yourusername.github.io/onevoice/index.html
https://onevoice.netlify.app/index.html
```
**Or if using a custom domain:**
```
https://yourdomain.com/index.html
```

### Allowed Web Origins
Add your website origin (without the path):
```
https://yourusername.github.io
https://onevoice.netlify.app
```
**Or if using a custom domain:**
```
https://yourdomain.com
```

**Note:** Don't use `localhost` unless testing locally. Use your free hosting URL (GitHub Pages, Netlify, etc.). See `FREE_HOSTING_SETUP.md` for free hosting options!

3. Scroll down and click **Save Changes**

## Step 4: Get Your Credentials

From the **Settings** tab, copy these values:

- **Domain**: Looks like `your-tenant.auth0.com`
- **Client ID**: A long alphanumeric string

## Step 5: Configure Your Website

1. Open `auth-config.js` in your project
2. Replace the placeholder values:

```javascript
const AUTH0_CONFIG = {
    domain: 'your-tenant.auth0.com', // Paste your Domain here
    clientId: 'your-client-id-here', // Paste your Client ID here
    redirectUri: window.location.origin + '/admin.html',
    audience: '', // Optional: leave empty for now
    scope: 'openid profile email'
};
```

## Step 6: Set Up Whitelist

1. Open `auth-config.js`
2. In the `ADMIN_WHITELIST` array, add the email addresses of users who should have admin access:

```javascript
const ADMIN_WHITELIST = [
    'admin@onevoice.org',
    'editor@onevoice.org',
    'your-email@example.com',
    // Add more emails here
];
```

**Important**: Only email addresses in this whitelist will be able to access the admin panel and publish content.

## Step 7: Test the Setup

1. Start your website (open `index.html` in a browser or use a local server)
2. Click **Login** in the navbar
3. Click **Sign In**
4. You'll be redirected to Auth0's login page
5. Sign in with an email that's in your whitelist
6. You should be redirected to the admin panel

## Troubleshooting

### "Invalid redirect_uri" Error
- Make sure you've added the exact URL to **Allowed Callback URLs** in Auth0 Dashboard
- Check that the URL matches exactly (including http/https, port numbers, etc.)

### "Your email is not authorized" Message
- Make sure the email you're using is in the `ADMIN_WHITELIST` array in `auth-config.js`
- Check that the email is written exactly as it appears (case-sensitive)

### Auth0 Not Loading
- Check browser console for errors
- Make sure the Auth0 CDN script is loaded (check `login.html` and `admin.html`)
- Verify your domain and client ID are correct in `auth-config.js`

## Security Notes

1. **Never commit `auth-config.js` with real credentials to public repositories**
   - Consider using environment variables or a config file that's in `.gitignore`
   - For production, use environment variables or a secure config service

2. **Keep your whitelist updated**
   - Remove emails when people no longer need admin access
   - Regularly review who has access

3. **Use HTTPS in production**
   - Auth0 requires HTTPS for production applications
   - Use a service like Netlify, Vercel, or GitHub Pages (which provide HTTPS)

## Advanced: Using Environment Variables

For better security, you can load Auth0 config from environment variables or a separate config file that's not committed to git.

## Support

- Auth0 Documentation: https://auth0.com/docs
- Auth0 Community: https://community.auth0.com

