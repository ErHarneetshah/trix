import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class deptController {
  getAllDept = async (req, res) => {
    try {
      const allData = await department.findAll();

      if (!allData)
        return helper.sendResponse(
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

  addDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );

      const existingDept = await department.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (existingDept)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "Department Already Exists in our system"
        );

      // Create and save the new user
      const addNewDept = await department.create(
        { name },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        { data: allData },
        "Data Fetched Succesfully"
      );
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        null,
        error.message
      );
    }
  };

  updateDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, newName, newStatus } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );

      const existingDept = await department.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDept)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Department does not found in our system"
        );

      const updateData = {};
      if (newName) updateData.name = newName;
      if (newStatus) updateData.status = newStatus;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "No Updation Data is Provided"
        );
      }

      // Perform the update operation
      const [updatedRows] = await department.update(updateData, {
        where: { name },
        transaction: dbTransaction,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Data Updated Succesfully"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.InternalServerError,
          null,
          "Unable to update the deppartment"
        );
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
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
          variables.NotFound,
          null,
          "Name is Required!"
        );

      const existingDept = await department.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDept)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Department does not found in our system"
        );

      // Create and save the new user
      const deleteDept = await department.destroy({
        where: { name },
        transaction: dbTransaction,
      });

      if (deleteDept) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Department Successfully Deleted"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to delete department"
        );
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.sendResponse(
        res,
        variables.BadRequest,
        null,
        error.message
      );
    }
  };
}

export default deptController;
