import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { ActivityLog, Attachment, Comment, Ticket, User } from '../models/index.js';
import { ACTIVITY_TYPES, ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '..', env.upload.dir);

const userAttributes = ['id', 'name', 'email', 'role', 'department'];

const canAccessTicket = (user, ticket) =>
  [ROLES.ADMIN, ROLES.MANAGER].includes(user.role) ||
  Number(ticket.createdById) === Number(user.id) ||
  Number(ticket.assignedToId) === Number(user.id);

export const getTicketDetails = async (id, user) => {
  const ticket = await Ticket.findByPk(id, {
    include: [
      { model: User, as: 'createdBy', attributes: userAttributes },
      { model: User, as: 'assignedTo', attributes: userAttributes },
      {
        model: Comment,
        as: 'comments',
        include: [{ model: User, as: 'author', attributes: userAttributes }],
      },
      {
        model: Attachment,
        as: 'attachments',
        include: [{ model: User, as: 'uploadedBy', attributes: userAttributes }],
      },
      {
        model: ActivityLog,
        as: 'activityLogs',
        include: [{ model: User, as: 'actor', attributes: userAttributes }],
      },
    ],
    order: [
      [{ model: Comment, as: 'comments' }, 'createdAt', 'ASC'],
      [{ model: Attachment, as: 'attachments' }, 'createdAt', 'DESC'],
      [{ model: ActivityLog, as: 'activityLogs' }, 'createdAt', 'DESC'],
    ],
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (!canAccessTicket(user, ticket)) {
    throw new ApiError(403, 'You do not have access to this ticket.');
  }

  return ticket;
};

export const addTicketComment = async (ticketId, payload, user) => {
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (!canAccessTicket(user, ticket)) {
    throw new ApiError(403, 'You do not have access to this ticket.');
  }

  const comment = await Comment.create({
    body: payload.body,
    ticketId,
    userId: user.id,
  });

  await ActivityLog.create({
    action: ACTIVITY_TYPES.COMMENT_ADDED,
    metadata: { commentId: comment.id },
    ticketId,
    actorId: user.id,
  });

  return Comment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: userAttributes }],
  });
};

export const addTicketAttachment = async (ticketId, file, user) => {
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (!canAccessTicket(user, ticket)) {
    throw new ApiError(403, 'You do not have access to this ticket.');
  }

  if (!file) {
    throw new ApiError(400, 'Attachment file is required.');
  }

  const attachment = await Attachment.create({
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: path.join(env.upload.dir, file.filename).replace(/\\/g, '/'),
    ticketId,
    uploadedById: user.id,
  });

  await ActivityLog.create({
    action: ACTIVITY_TYPES.ATTACHMENT_UPLOADED,
    metadata: { attachmentId: attachment.id, originalName: attachment.originalName },
    ticketId,
    actorId: user.id,
  });

  return Attachment.findByPk(attachment.id, {
    include: [{ model: User, as: 'uploadedBy', attributes: userAttributes }],
  });
};

export const getAttachmentForDownload = async (ticketId, attachmentId, user) => {
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (!canAccessTicket(user, ticket)) {
    throw new ApiError(403, 'You do not have access to this ticket.');
  }

  const attachment = await Attachment.findOne({ where: { id: attachmentId, ticketId } });

  if (!attachment) {
    throw new ApiError(404, 'Attachment not found.');
  }

  const filePath = path.resolve(uploadRoot, attachment.storedName);

  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'Attachment file is missing from storage.');
  }

  return { attachment, filePath };
};
