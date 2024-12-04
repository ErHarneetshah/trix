import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../queries/dbConnection.js";
import department from "./departmentModel.js";
import designation from "./designationModel.js";
import role from "./roleModel.js";
import team from "./teamModel.js";

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    fullname: {
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
      allowNull: true,
      validate: {
        notEmpty: true, // Prevents empty string
      },
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: true, // Prevents empty string
        isNumeric: true,
        len: [1, 10],
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
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
      async beforeCreate(user, options) {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }

        const validationMap = {
          departmentId: department,
          designationId: designation,
          roleId: role,
          teamId: team,
        };

        // Iterate through the fields to validate
        for (const [field, model] of Object.entries(validationMap)) {
          if (user[field]) {
            const recordExists = await model.findOne({
              where: { id: user[field] },
              transaction: options.transaction,
            });

            if (!recordExists) {
              throw new Error(
                `${field.replace(/Id$/, "")} with ID ${
                  user[field]
                } does not exist.`
              );
            }
          }
        }
      },
      async beforeUpdate(user, options) {
        // Hash the password if it's being updated
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }

        // Define a mapping of fields to their respective models
        const validationMap = {
          departmentId: department,
          designationId: designation,
          roleId: role,
          teamId: team,
        };

        // Iterate through the fields to validate
        for (const [field, model] of Object.entries(validationMap)) {
          if (user[field]) {
            const recordExists = await model.findOne({
              where: { id: user[field] },
              transaction: options.transaction,
            });

            if (!recordExists) {
              throw new Error(
                `${field.replace(/Id$/, "")} with ID ${
                  user[field]
                } does not exist.`
              );
            }
          }
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
