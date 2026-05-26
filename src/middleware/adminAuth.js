/**
 * Simple Admin Authentication Middleware
 * Protects upload and delete routes.
 * Pass the secret as: Authorization: Bearer <ADMIN_SECRET>
 */

function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Valid admin token required.' });
  }
  next();
}

module.exports = adminAuth;
