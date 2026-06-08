import { body, param } from 'express-validator';
import { ROLE_VALUES } from '../utils/constants.js';

export const userIdValidation = [param('id').isInt({ min: 1 }).withMessage('Valid user id is required.')];

export const createUserValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number.'),
  body('role').isIn(ROLE_VALUES).withMessage('Invalid role.'),
  body('department').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Department is too long.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false.'),
];

export const updateUserValidation = [
  ...userIdValidation,
  body('name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),
  body('email').optional().trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password')
    .optional({ nullable: true, checkFalsy: true })
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number.'),
  body('role').optional().isIn(ROLE_VALUES).withMessage('Invalid role.'),
  body('department').optional({ nullable: true }).trim().isLength({ max: 100 }).withMessage('Department is too long.'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false.'),
];
