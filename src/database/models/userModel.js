import { DataTypes } from "sequelize";
import bcrypt from 'bcryptjs';
import sequelize from "../queries/db_connection.js";

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true, // Ensures the value is a valid email
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
        isNumeric: true,
        len: [1, 10],
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    designationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    workstationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
    hooks: {
      async beforeCreate(user) {
        if (user.password) {
          // Hash the password before saving it
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      async beforeUpdate(user) {
        if (user.password) {
          // Hash the password before updating it
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Add a custom method to compare password
User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default User;
