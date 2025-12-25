// Auth0 Configuration
// Get these values from your Auth0 Dashboard: https://manage.auth0.com/

const AUTH0_CONFIG = {
    domain: 'dev-2dbdsy0a433gccmf.us.auth0.com', // Replace with your Auth0 domain
    clientId: 'aTYwYMLiJmkDS6NyW31My0d4y43ttgLG', // Replace with your Auth0 Client ID
    // redirectUri automatically uses your current domain (works with GitHub Pages, Netlify, etc.)
    redirectUri: window.location.origin + '/admin.html',
    audience: '', // Optional: leave empty for basic auth
    scope: 'openid profile email'
};

// Whitelist of allowed admin emails (users who can publish content)
const ADMIN_WHITELIST = [
    'joshivivaan19@gmail.com',
    'alex9091nj@gmail.com',
    // Add more email addresses here that should have admin access
];

// Check if email is in whitelist
function isEmailWhitelisted(email) {
    return ADMIN_WHITELIST.includes(email.toLowerCase());
}

// Get whitelist (for admin to view/manage)
function getWhitelist() {
    return ADMIN_WHITELIST;
}

