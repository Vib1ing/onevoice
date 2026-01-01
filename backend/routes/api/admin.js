const express = require('express');
const router = express.Router();
const { checkJwt } = require('../../middleware/auth');

// Admin status for current token/user
router.get('/me', checkJwt, (req, res) => {
  const user = req.user || {};
  // Prefer roles claim if present
  const roles = user['https://your-domain/roles'] || user['roles'];
  const isAdmin = Array.isArray(roles) && roles.includes('admin') || (user.email && process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(user.email.toLowerCase()));
  res.json({ isAdmin, email: user.email, name: user.name });
});

module.exports = router;
