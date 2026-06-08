export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  SUPPORT_AGENT: 'Support Agent',
};

export const ROLE_VALUES = Object.values(ROLES);

export const TICKET_STATUSES = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened'];

export const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const ACTIVITY_TYPES = {
  TICKET_CREATED: 'Ticket created',
  TICKET_ASSIGNED: 'Ticket assigned',
  STATUS_CHANGED: 'Status changed',
  PRIORITY_CHANGED: 'Priority changed',
  COMMENT_ADDED: 'Comment added',
  ATTACHMENT_UPLOADED: 'Attachment uploaded',
};
