// Auth0 Configuration
// Get these values from your Auth0 Dashboard: https://manage.auth0.com/

const AUTH0_CONFIG = {
    domain: 'dev-2dbdsy0a433gccmf.us.auth0.com', // Replace with your Auth0 domain
    clientId: 'aTYwYMLiJmkDS6NyW31My0d4y43ttgLG', // Replace with your Auth0 Client ID
    // Ensure redirectUri works when site is served from a subfolder (e.g., GitHub Pages)
    redirectUri: (function () {
        // Redirect to login.html which has callback handling code
        return window.location.origin + '/login.html';
    })(),
    audience: 'https://onevoice-api/', // Must match Auth0 API identifier exactly
    scope: 'openid profile email'
};