import designation from "../../../database/models/designationModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class desigController {
  getAllDesig = async (req, res) => {
    try {
      const allData = await designation.findAll();
      if (!allData)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          error.message
        );

      return helper.sendResponse(
        res,
        variables.Success,
        1,
        { data: allData },
        "Data Fetched Succesfully"
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

  addDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.BadRequest,
          0,
          null,
          "Name is Required!"
        );

      const existingDesig = await designation.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });

      if (existingDesig)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "Designation Already Exists"
        );

      // Create and save the new user
      const addNewDesig = await designation.create(
        { name },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        1,
        null,
        "Designation Added Successfully!"
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

  updateDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, newName, newStatus } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          "Name is Required!"
        );

      const existingDesig = await designation.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDesig)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Designation does not exists!"
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
          "No new values provided for updation!"
        );
      }

      // Perform the update operation
      const [updatedRows] = await designation.update(updateData, {
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
          "Designation updated Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          0,
          null,
          "Unable to update the designation!"
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

  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.BadRequest,
          0,
          null,
          "Name is Required!"
        );

      const existingDesig = await designation.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDesig)
        return helper.sendResponse(
          res,
          variables.NotFound,
          0,
          null,
          "Designation does not exists!"
        );

      // Create and save the new user
      const deleteDesig = await designation.destroy({
        where: { name },
        transaction: dbTransaction,
      });

      if (deleteDesig) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          1,
          null,
          "Designation deleted Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          0,
          null,
          "Unable to delete designation!"
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

export default desigController;
