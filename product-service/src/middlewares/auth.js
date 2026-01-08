import { ApiError } from './errorHandler.js';

/**
 * Middleware to extract user info from headers set by API Gateway
 * Gateway passes: x-user-id, x-user-email, x-user-role
 */
export function extractUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  if (userId && userEmail && userRole) {
    req.user = {
      id: userId,
      email: userEmail,
      role: userRole,
    };
  }
  next();
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
}
