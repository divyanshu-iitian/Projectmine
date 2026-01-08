import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export function verifyJwt(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: { message: 'Missing Authorization header' } });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
}/**
 * Middleware to verify JWT and forward user info as headers to downstream services
 */
export function verifyAndForwardUser(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      // Forward user info via headers
      req.headers['x-user-id'] = payload.sub;
      req.headers['x-user-email'] = payload.email;
      req.headers['x-user-role'] = payload.role;
      req.user = payload;
    } catch (err) {
      // Token invalid - let downstream service handle if auth is required
      console.warn('[api-gateway] Invalid token, proceeding without user context');
    }
  }
  next();
}
