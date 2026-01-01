const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
require('dotenv').config();
const https = require('https');

// Validate JWTs issued by Auth0
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

const adminOnly = async (req, res, next) => {
  // Support both req.auth (newer express-jwt) and req.user (legacy)
  const user = req.auth || req.user || {};

  // 1. Check roles claim
  const roles = user['https://your-domain/roles'] || user['roles'];
  const hasAdminRole = Array.isArray(roles) && roles.includes('admin');

  // 2. Check email whitelist fallback (same logic as in admin route)
  let userEmail = user.email || user['https://onevoice.com/email'] || user['email'];

  // If email is missing from token (common for custom APIs), fetch it from /userinfo
  if (!userEmail && user.sub) {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        userEmail = await new Promise((resolve, reject) => {
          const options = {
            hostname: process.env.AUTH0_DOMAIN,
            path: '/userinfo',
            headers: { 'Authorization': authHeader }
          };
          https.get(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
              try {
                const profile = JSON.parse(data);
                resolve(profile.email);
              } catch (e) { resolve(null); }
            });
          }).on('error', (e) => reject(e));
        });
        if (userEmail) console.log(`[Auth] Discovered email via /userinfo: ${userEmail}`);
      }
    } catch (error) {
      console.error('[Auth] Error fetching userinfo:', error.message);
    }
  }

  const normalizedEmail = userEmail ? userEmail.toLowerCase().trim() : null;
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
    : [];
  const isWhitelisted = normalizedEmail && adminEmails.includes(normalizedEmail);

  if (hasAdminRole || isWhitelisted) {
    // Attach email back to auth object for future use
    if (req.auth) req.auth.email = normalizedEmail;
    else if (req.user) req.user.email = normalizedEmail;
    return next();
  }

  console.warn(`[Auth] Forbidden access attempt by: ${normalizedEmail || user.sub || 'unknown'}`);
  res.status(403).json({ error: 'Forbidden: Admins only' });
};

module.exports = { checkJwt, adminOnly };
