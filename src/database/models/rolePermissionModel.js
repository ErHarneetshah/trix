import { DataTypes } from "sequelize";
import sequelize from "../queries/dbConnection.js";
import role from "./roleModel.js";

const rolePermission = sequelize.define(
  "role_permissions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modules: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    // hooks: {
    //   async beforeCreate(role_permissions, options) {

    //     const validationMap = {
    //       departmentId: department,
    //       designationId: designation,
    //       roleId: role,
    //       teamId: team,
    //     };

    //     // Iterate through the fields to validate
    //     for (const [field, model] of Object.entries(validationMap)) {
    //       if (user[field]) {
    //         const recordExists = await model.findOne({
    //           where: { id: user[field] },
    //           transaction: options.transaction,
    //         });

    //         if (!recordExists) {
    //           throw new Error(
    //             `${field.replace(/Id$/, "")} with ID ${
    //               user[field]
    //             } does not exist.`
    //           );
    //         }
    //       }
    //     }
    //   },
    //   async beforeUpdate(user, options) {
    //     // Hash the password if it's being updated
    //     if (user.password) {
    //       user.password = await bcrypt.hash(user.password, 10);
    //     }

    //     // Define a mapping of fields to their respective models
    //     const validationMap = {
    //       departmentId: department,
    //       designationId: designation,
    //       roleId: role,
    //       teamId: team,
    //     };

    //     // Iterate through the fields to validate
    //     for (const [field, model] of Object.entries(validationMap)) {
    //       if (user[field]) {
    //         const recordExists = await model.findOne({
    //           where: { id: user[field] },
    //           transaction: options.transaction,
    //         });

    //         if (!recordExists) {
    //           throw new Error(
    //             `${field.replace(/Id$/, "")} with ID ${
    //               user[field]
    //             } does not exist.`
    //           );
    //         }
    //       }
    //     }
    //   },
    // },
  }
);


export default rolePermission;
