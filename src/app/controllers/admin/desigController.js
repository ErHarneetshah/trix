import designation from "../../../database/models/designationModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class desigController {
  getAllDesig = async (req, res) => {
    try {
        const alldata = await designation.findAll();
        if(!alldata) return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          error.message
        );

        return helper.sendResponse(
          res,
          variables.Success,
          { data: allData },
          "Data Fetched Succesfully"
        );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
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
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingDesig = await designation.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (existingDesig)
        return responseUtils.errorResponse(
          res,
          "Designation Already Exists",
          400
        );

      // Create and save the new user
      const addNewDesig = await designation.create(
        { name },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return responseUtils.successResponse(
        res,
        { message: "Designation added successfully" },
        200
      );
    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  updateDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, newName, newStatus } = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingDesig = await designation.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDesig)
        return responseUtils.errorResponse(
          res,
          "Designation does not Exists",
          400
        );

        const updateData = {};
        if (newName) updateData.name = newName;
        if (newStatus) updateData.status = newStatus;
    
        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
          return responseUtils.errorResponse(
            res,
            "No fields provided to update",
            400
          );
        }
    
        // Perform the update operation
        const [updatedRows] = await designation.update(updateData, {
          where: { name },
          transaction: dbTransaction,
        });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return responseUtils.successResponse(
          res,
          { message: "Designation updated successfully" },
          200
        );
      } else {
        await dbTransaction.rollback();
        return responseUtils.errorResponse(
          res,
          { message: "Unable to update the designation" },
          200
        );
      }
    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingDesig = await designation.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDesig)
        return responseUtils.errorResponse(
          res,
          "Designation does not Exists",
          400
        );

      // Create and save the new user
      const deleteDesig = await designation.destroy({
        where: { name },
        transaction: dbTransaction,
      });

      if (deleteDesig) {
        await dbTransaction.commit();
        return responseUtils.successResponse(
          res,
          { message: "Designation deleted successfully" },
          200
        );
      } else {
        await dbTransaction.rollback();
        return responseUtils.errorResponse(
          res,
          { message: "Unable to delete the designation" },
          200
        );
      }
    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };
}

export default desigController;
