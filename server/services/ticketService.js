import { Op } from 'sequelize';
import { ActivityLog, Ticket, User } from '../models/index.js';
import { ACTIVITY_TYPES, ROLES } from '../utils/constants.js';
import { ApiError } from '../utils/apiError.js';

const includeUsers = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'email', 'role', 'department'] },
  { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email', 'role', 'department'] },
];

const canModifyTicket = (user, ticket) =>
  [ROLES.ADMIN, ROLES.MANAGER].includes(user.role) ||
  Number(ticket.createdById) === Number(user.id) ||
  Number(ticket.assignedToId) === Number(user.id);

const buildTicketWhere = (query, user) => {
  const andConditions = [];
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const activeStatusFilter = { status: { [Op.notIn]: ['Resolved', 'Closed'] } };

  if (query.search) {
    andConditions.push({
      [Op.or]: [{ title: { [Op.like]: `%${query.search}%` } }, { description: { [Op.like]: `%${query.search}%` } }],
    });
  }

  if (query.status) andConditions.push({ status: query.status });
  if (query.priority) andConditions.push({ priority: query.priority });
  if (query.assignedToId) andConditions.push({ assignedToId: query.assignedToId });
  if (query.due === 'overdue') andConditions.push({ dueDate: { [Op.lt]: now }, ...activeStatusFilter });
  if (query.due === 'dueSoon') andConditions.push({ dueDate: { [Op.between]: [now, sevenDaysFromNow] }, ...activeStatusFilter });
  if (query.due === 'unassigned') andConditions.push({ assignedToId: null });
  if (query.scope === 'assignedToMe') andConditions.push({ assignedToId: user.id });
  if (query.scope === 'raisedByMe') andConditions.push({ createdById: user.id });

  if (user.role === ROLES.EMPLOYEE) {
    andConditions.push({ createdById: user.id });
  } else if (user.role === ROLES.SUPPORT_AGENT) {
    andConditions.push({ [Op.or]: [{ assignedToId: user.id }, { createdById: user.id }] });
  }

  return andConditions.length ? { [Op.and]: andConditions } : {};
};

export const listTickets = async (query, user) => {
  const sortBy = query.sortBy || 'updatedAt';
  const sortDir = query.sortDir || 'DESC';

  return Ticket.findAll({
    where: buildTicketWhere(query, user),
    include: includeUsers,
    order: [[sortBy, sortDir]],
  });
};

export const getTicketById = async (id, user) => {
  const ticket = await Ticket.findByPk(id, { include: includeUsers });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (!canModifyTicket(user, ticket)) {
    throw new ApiError(403, 'You do not have access to this ticket.');
  }

  return ticket;
};

export const createTicket = async (payload, user) => {
  const ticket = await Ticket.create({
    title: payload.title,
    description: payload.description,
    status: payload.status || 'Open',
    priority: payload.priority || 'Medium',
    dueDate: payload.dueDate || null,
    assignedToId: payload.assignedToId || null,
    createdById: user.id,
  });

  await ActivityLog.create({
    action: ACTIVITY_TYPES.TICKET_CREATED,
    metadata: { title: ticket.title },
    ticketId: ticket.id,
    actorId: user.id,
  });

  if (ticket.assignedToId) {
    await ActivityLog.create({
      action: ACTIVITY_TYPES.TICKET_ASSIGNED,
      metadata: { assignedToId: ticket.assignedToId },
      ticketId: ticket.id,
      actorId: user.id,
    });
  }

  return Ticket.findByPk(ticket.id, { include: includeUsers });
};

export const updateTicket = async (id, payload, user) => {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (!canModifyTicket(user, ticket)) {
    throw new ApiError(403, 'You do not have permission to update this ticket.');
  }

  const previous = ticket.get({ plain: true });
  const updates = { ...payload };
  if (updates.assignedToId === '') updates.assignedToId = null;
  if (updates.dueDate === '') updates.dueDate = null;

  await ticket.update(updates);

  const logs = [];
  if (payload.assignedToId !== undefined && Number(previous.assignedToId || 0) !== Number(ticket.assignedToId || 0)) {
    logs.push({
      action: ACTIVITY_TYPES.TICKET_ASSIGNED,
      metadata: { from: previous.assignedToId, to: ticket.assignedToId },
      ticketId: ticket.id,
      actorId: user.id,
    });
  }
  if (payload.status && previous.status !== ticket.status) {
    logs.push({
      action: ACTIVITY_TYPES.STATUS_CHANGED,
      metadata: { from: previous.status, to: ticket.status },
      ticketId: ticket.id,
      actorId: user.id,
    });
  }
  if (payload.priority && previous.priority !== ticket.priority) {
    logs.push({
      action: ACTIVITY_TYPES.PRIORITY_CHANGED,
      metadata: { from: previous.priority, to: ticket.priority },
      ticketId: ticket.id,
      actorId: user.id,
    });
  }

  if (logs.length) {
    await ActivityLog.bulkCreate(logs);
  }

  return Ticket.findByPk(ticket.id, { include: includeUsers });
};

export const deleteTicket = async (id, user) => {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  if (![ROLES.ADMIN, ROLES.MANAGER].includes(user.role) && Number(ticket.createdById) !== Number(user.id)) {
    throw new ApiError(403, 'You do not have permission to delete this ticket.');
  }

  await ticket.destroy();
};
