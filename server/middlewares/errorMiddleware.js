import { ValidationError, UniqueConstraintError } from 'sequelize';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';
  let details = error.details || null;

  if (error instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with the provided value already exists.';
    details = error.errors.map((item) => ({ field: item.path, message: item.message }));
  }

  if (error instanceof ValidationError) {
    statusCode = 422;
    message = 'Validation failed.';
    details = error.errors.map((item) => ({ field: item.path, message: item.message }));
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: env.nodeEnv === 'development' ? error.stack : undefined,
  });
};
