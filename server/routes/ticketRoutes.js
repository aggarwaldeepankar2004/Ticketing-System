import { Router } from 'express';
import {
  downloadTicketAttachment,
  showTicketDetails,
  storeTicketAttachment,
  storeTicketComment,
} from '../controllers/ticketDetailController.js';
import { getTicket, getTickets, patchTicket, removeTicket, storeTicket } from '../controllers/ticketController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { uploadAttachment } from '../middlewares/uploadMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  attachmentParamValidation,
  createCommentValidation,
  ticketParamValidation,
} from '../validations/commentValidation.js';
import {
  createTicketValidation,
  ticketIdValidation,
  ticketQueryValidation,
  updateTicketValidation,
} from '../validations/ticketValidation.js';

const router = Router();

router.use(authenticate);

router.get('/', ticketQueryValidation, validateRequest, getTickets);
router.post('/', createTicketValidation, validateRequest, storeTicket);
router.get('/:id', ticketIdValidation, validateRequest, getTicket);
router.get('/:id/details', ticketParamValidation, validateRequest, showTicketDetails);
router.post('/:id/comments', createCommentValidation, validateRequest, storeTicketComment);
router.post('/:id/attachments', ticketParamValidation, validateRequest, uploadAttachment.single('file'), storeTicketAttachment);
router.get('/:id/attachments/:attachmentId/download', attachmentParamValidation, validateRequest, downloadTicketAttachment);
router.patch('/:id', updateTicketValidation, validateRequest, patchTicket);
router.delete('/:id', ticketIdValidation, validateRequest, removeTicket);

export default router;
