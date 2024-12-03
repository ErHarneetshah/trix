import role from "../../../database/models/roleModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class roleController {
  getAllRole = async (req, res) => {
    try {
      const alldata = await role.findAll();
      if (!alldata)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "No Data is available!"
        );

      return helper.sendResponse(
        res,
        variables.Success,
        1,
        null,
        "All Data Fetched Successfully!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  addRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Name is Required!"
        );

      const existingRole = await role.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (existingRole)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "This Role Already Exists"
        );

      // Create and save the new user
      const addNewRole = await role.create(
        { name },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        null,
        "Role Added Successfully!"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  updateRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, newName, newStatus } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Name is Required!"
        );

      const existingRole = await role.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingRole)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "Role does not Exists"
        );

      const updateData = {};
      if (newName) updateData.name = newName;
      if (newStatus) updateData.status = newStatus;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "No Updating Values provide to update!"
        );
      }

      // Perform the update operation
      const [updatedRows] = await role.update(updateData, {
        where: { name },
        transaction: dbTransaction,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          null,
          "Role updated Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          0,
          null,
          "Unable to update the role!"
        );
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };

  deleteRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Name is Required!"
        );

      const existingRole = await role.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingRole)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Role does not exists!"
        );

      // Create and save the new user
      const deleteRole = await role.destroy({
        where: { name },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          null,
          "Role deleted successfully"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          0,
          null,
          "Unable to delete the role"
        );
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        0,
        null,
        error.message
      );
    }
  };
}

export default roleController;
