import {
  addTicketAttachment,
  addTicketComment,
  getAttachmentForDownload,
  getTicketDetails,
} from '../services/ticketDetailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const showTicketDetails = asyncHandler(async (req, res) => {
  const ticket = await getTicketDetails(req.params.id, req.user);
  res.status(200).json({ success: true, data: { ticket } });
});

export const storeTicketComment = asyncHandler(async (req, res) => {
  const comment = await addTicketComment(req.params.id, req.body, req.user);
  res.status(201).json({ success: true, message: 'Comment added successfully.', data: { comment } });
});

export const storeTicketAttachment = asyncHandler(async (req, res) => {
  const attachment = await addTicketAttachment(req.params.id, req.file, req.user);
  res.status(201).json({ success: true, message: 'Attachment uploaded successfully.', data: { attachment } });
});

export const downloadTicketAttachment = asyncHandler(async (req, res) => {
  const { attachment, filePath } = await getAttachmentForDownload(req.params.id, req.params.attachmentId, req.user);
  res.download(filePath, attachment.originalName);
});
