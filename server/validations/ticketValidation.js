import { body, param, query } from 'express-validator';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../utils/constants.js';

export const ticketIdValidation = [param('id').isInt({ min: 1 }).withMessage('Valid ticket id is required.')];

export const ticketQueryValidation = [
  query('search').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Search is too long.'),
  query('status').optional({ checkFalsy: true }).isIn(TICKET_STATUSES).withMessage('Invalid status.'),
  query('priority').optional({ checkFalsy: true }).isIn(TICKET_PRIORITIES).withMessage('Invalid priority.'),
  query('assignedToId').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Invalid assigned user.'),
  query('due').optional({ checkFalsy: true }).isIn(['overdue', 'dueSoon', 'unassigned']).withMessage('Invalid due filter.'),
  query('scope').optional({ checkFalsy: true }).isIn(['all', 'assignedToMe', 'raisedByMe']).withMessage('Invalid ticket scope.'),
  query('sortBy').optional({ checkFalsy: true }).isIn(['updatedAt', 'createdAt', 'dueDate', 'priority']).withMessage('Invalid sort field.'),
  query('sortDir').optional({ checkFalsy: true }).isIn(['ASC', 'DESC']).withMessage('Invalid sort direction.'),
];

export const createTicketValidation = [
  body('title').trim().isLength({ min: 3, max: 180 }).withMessage('Title must be between 3 and 180 characters.'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters.'),
  body('priority').optional().isIn(TICKET_PRIORITIES).withMessage('Invalid priority.'),
  body('status').optional().isIn(TICKET_STATUSES).withMessage('Invalid status.'),
  body('assignedToId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid assigned user.'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date.'),
];

export const updateTicketValidation = [
  ...ticketIdValidation,
  body('title').optional().trim().isLength({ min: 3, max: 180 }).withMessage('Title must be between 3 and 180 characters.'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters.'),
  body('priority').optional().isIn(TICKET_PRIORITIES).withMessage('Invalid priority.'),
  body('status').optional().isIn(TICKET_STATUSES).withMessage('Invalid status.'),
  body('assignedToId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid assigned user.'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date.'),
];
