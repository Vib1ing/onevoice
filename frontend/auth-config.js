// Auth0 Configuration
// Get these values from your Auth0 Dashboard: https://manage.auth0.com/

const AUTH0_CONFIG = {
    domain: 'dev-2dbdsy0a433gccmf.us.auth0.com',
    clientId: 'aTYwYMLiJmkDS6NyW31My0d4y43ttgLG',
    redirectUri: window.location.origin + '/login.html',
    audience: 'https://onevoice-api/',
    scope: 'openid profile email',
    // Point to your Render URL in production, or localhost in development
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? '/api' // Uses the local proxy
        : 'https://onevoice-95s3.onrender.com/api' // Your Render API URL
};