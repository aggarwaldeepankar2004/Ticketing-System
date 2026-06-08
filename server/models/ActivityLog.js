import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ActivityLog = sequelize.define(
  'ActivityLog',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: 'activity_logs',
    updatedAt: false,
  },
);
