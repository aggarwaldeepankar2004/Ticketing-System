import { body } from 'express-validator';
import { ROLE_VALUES } from '../utils/constants.js';

export const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 120 }).withMessage('Name must be between 2 and 120 characters.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, and a number.'),
  body('role').optional().isIn(ROLE_VALUES).withMessage('Invalid role.'),
  body('department').optional({ nullable: true }).trim().isLength({ max: 100 }),
];

export const loginValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
