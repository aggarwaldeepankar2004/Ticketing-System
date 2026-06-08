import { body, param } from 'express-validator';

export const ticketParamValidation = [param('id').isInt({ min: 1 }).withMessage('Valid ticket id is required.')];

export const attachmentParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid ticket id is required.'),
  param('attachmentId').isInt({ min: 1 }).withMessage('Valid attachment id is required.'),
];

export const createCommentValidation = [
  ...ticketParamValidation,
  body('body').trim().isLength({ min: 2, max: 5000 }).withMessage('Comment must be between 2 and 5000 characters.'),
];
