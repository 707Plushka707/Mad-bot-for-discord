import pkg from "sequelize";
const { Sequelize, DataTypes } = pkg;
import { config } from "dotenv";
config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

const Quote = sequelize.define(
  "Quote",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    q: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: "compositeIndex",
    },
    a: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "compositeIndex",
    },
    h: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
  }
);

export { sequelize, Quote };
