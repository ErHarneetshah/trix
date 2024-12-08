import { Op } from "sequelize";
import shift from "../../../database/models/shiftModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import variables from "../../config/variableConfig.js";

class shiftController {
  getAllShift = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page } = req.query;
      let searchable = ["name", "status"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);

      const alldata = await shift.findAndCountAll({
        where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getShiftDropdown = async (req, res) => {
    try {
      const alldata = await shift.findAll({
        where:{status:true},
        attributes: { exclude: ["createdAt", "updatedAt", "status"] },
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, "Unable to fetch data");
    }
  };

  getSpecificShift = async (req, res) => {
    try {
      const requestData = req.body;

      const specificData = await shift.findOne({
        where: {
          name: requestData.name,
          start_time: requestData.start_time,
          end_time: requestData.end_time,
          days: JSON.stringify(requestData.days), // Ensure days are correctly formatted for comparison
        },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      if (!specificData) return helper.failed(res, variables.NotFound, `Data not Found of matching attributes `);

      return helper.success(res, variables.Success, "Data Fetched Succesfully", specificData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addShift = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;

      if (requestData.start_time == requestData.end_time) {
        return helper.failed(res, variables.ValidationError, "Start Time and End Time Cannot be the same");
      }
      //Validating the request data
      const validationResult = await teamsValidationSchema.shiftValid(requestData, res);

      //checkecing existing shift
      const existingShift = await shift.findOne({
        where: {
          name: requestData.name,
          start_time: requestData.start_time,
          end_time: requestData.end_time,
          days: JSON.stringify(requestData.days), // Ensure days are correctly formatted for comparison
        },
        transaction: dbTransaction,
      });
      if (existingShift) return helper.failed(res, variables.ValidationError, "Shift Already Exists!");

      // Calulating total_hours in the shift
      // let total_hours = await this.calTotalHr(requestData.start_time, requestData.end_time);

      // Create and save the new user
      const newShift = await shift.create(requestData, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Shift Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateShift = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      console.log("===============================================")
      console.log(updateFields.days);
      console.log("===============================================")


      //* Check if there is a dept already exists
      const existingShift = await shift.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists!");

      //* Check if there is a dept with a name in a different id
      const existingShiftWithName = await shift.findOne({
        where: {
          name: updateFields.name,
          id: { [Op.ne]: id }, // Exclude the current record by id
        },
        transaction: dbTransaction,
      });
      if (existingShiftWithName) {
        return helper.failed(res, variables.ValidationError, "Shift name already exists in different record!");
      }

      //* if the id has the same value in db
      const alreadySameShift = await shift.findOne({
        where: { id: id, name: updateFields.name },
        transaction: dbTransaction,
      });
      if (alreadySameShift) return helper.success(res, variables.Success, "Shift Re-Updated Successfully!");

      // Check if the status updation request value is in 0 or 1 only >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // if (updateFields.status !== 0 && updateFields.status !== 1) {
      //   return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
      // }

      console.log(updateFields.days);

      const [updatedRows] = await shift.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Shift Updated Successfully");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to update the shift");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteShift = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingShift = await shift.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists!");

      // Create and save the new user
      const deleteShift = await shift.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteShift) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Shift deleted Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the Shift!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default shiftController;
