import { sequelize } from '../config/database.js';
import { ActivityLog } from './ActivityLog.js';
import { Attachment } from './Attachment.js';
import { Comment } from './Comment.js';
import { Ticket } from './Ticket.js';
import { User } from './User.js';

User.hasMany(Ticket, { as: 'createdTickets', foreignKey: { name: 'createdById', allowNull: false } });
Ticket.belongsTo(User, { as: 'createdBy', foreignKey: { name: 'createdById', allowNull: false } });

User.hasMany(Ticket, { as: 'assignedTickets', foreignKey: { name: 'assignedToId', allowNull: true } });
Ticket.belongsTo(User, { as: 'assignedTo', foreignKey: { name: 'assignedToId', allowNull: true } });

Ticket.hasMany(Comment, { as: 'comments', foreignKey: { name: 'ticketId', allowNull: false }, onDelete: 'CASCADE' });
Comment.belongsTo(Ticket, { as: 'ticket', foreignKey: { name: 'ticketId', allowNull: false } });
User.hasMany(Comment, { as: 'comments', foreignKey: { name: 'userId', allowNull: false } });
Comment.belongsTo(User, { as: 'author', foreignKey: { name: 'userId', allowNull: false } });

Ticket.hasMany(Attachment, { as: 'attachments', foreignKey: { name: 'ticketId', allowNull: false }, onDelete: 'CASCADE' });
Attachment.belongsTo(Ticket, { as: 'ticket', foreignKey: { name: 'ticketId', allowNull: false } });
User.hasMany(Attachment, { as: 'attachments', foreignKey: { name: 'uploadedById', allowNull: false } });
Attachment.belongsTo(User, { as: 'uploadedBy', foreignKey: { name: 'uploadedById', allowNull: false } });

Ticket.hasMany(ActivityLog, { as: 'activityLogs', foreignKey: { name: 'ticketId', allowNull: false }, onDelete: 'CASCADE' });
ActivityLog.belongsTo(Ticket, { as: 'ticket', foreignKey: { name: 'ticketId', allowNull: false } });
User.hasMany(ActivityLog, { as: 'activityLogs', foreignKey: { name: 'actorId', allowNull: false } });
ActivityLog.belongsTo(User, { as: 'actor', foreignKey: { name: 'actorId', allowNull: false } });

export { ActivityLog, Attachment, Comment, sequelize, Ticket, User };
