import { Sequelize } from 'sequelize';
import { env } from './env.js';
import fs from 'fs';

export const sequelize = new Sequelize(
  env.db.database,
  env.db.username,
  env.db.password,
  {
    host: env.db.host,
    port: env.db.port,
    dialect: 'mysql',

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    logging: env.nodeEnv === 'development' ? console.log : false,

    define: {
      underscored: true,
      timestamps: true,
      paranoid: false,
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

try {
  await sequelize.authenticate();
  console.log("Connected to Aiven MySQL successfully!");
} catch (error) {
  console.error("Unable to connect:", error);
}