import { User } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'Authentication token is required.');
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is unavailable.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Invalid or expired token.'));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action.'));
  }

  return next();
};
