import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../utils/constants.js';

export const Ticket = sequelize.define(
  'Ticket',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
      validate: { len: [3, 180] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...TICKET_STATUSES),
      allowNull: false,
      defaultValue: 'Open',
    },
    priority: {
      type: DataTypes.ENUM(...TICKET_PRIORITIES),
      allowNull: false,
      defaultValue: 'Medium',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'tickets',
  },
);
