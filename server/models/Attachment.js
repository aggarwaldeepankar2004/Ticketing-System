import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Attachment = sequelize.define(
  'Attachment',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    storedName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    tableName: 'attachments',
  },
);
