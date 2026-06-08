import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Comment = sequelize.define(
  'Comment',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
  },
  {
    tableName: 'comments',
  },
);
