import pkg from 'sequelize';
import { config } from 'dotenv';

const { Sequelize, DataTypes } = pkg;

config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  },
);

const Quote = sequelize.define(
  'Quote',
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    q: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: 'compositeIndex',
    },
    a: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeIndex',
    },
    h: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {},
);

export { sequelize, Quote };
