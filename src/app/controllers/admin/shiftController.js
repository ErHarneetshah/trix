import { Op } from "sequelize";
import shift from "../../../database/models/shiftModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import variables from "../../config/variableConfig.js";
import team from "../../../database/models/teamModel.js";

class shiftController {
  getAllShift = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      let searchable = ["name", "status"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      // ___________---------- Search, Limit, Pagination ----------_______________

      const alldata = await shift.findAndCountAll({
        where: where,
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
        where: { status: true, company_id: req.user.company_id },
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
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Id is required and in numbers");

      const specificData = await shift.findOne({
        where: {
          company_id: req.user.company_id,
          id: id,
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

      const validationResult = await teamsValidationSchema.shiftValid(requestData, res);
      if (!validationResult.status) return helper.failed(res, variables.ValidationError, validationResult.message);

      // Validation of start_time in 24 hr and HH:MM format only
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(requestData.start_time)) {
        return helper.failed(res, variables.ValidationError, "Start Time must be in HH:MM 24-hour format.");
      }

      // Validation of end_time in 24 hr and HH:MM format only
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(requestData.end_time)) {
        return helper.failed(res, variables.ValidationError, "End Time must be in HH:MM 24-hour format.");
      }

      // validating that both times cannot be same
      if (requestData.start_time == requestData.end_time) {
        return helper.failed(res, variables.ValidationError, "Start Time and End Time Cannot be the same");
      }

      //checkecing existing shift
      const existingShift = await shift.findOne({
        where: {
          company_id: req.user.company_id,
          name: requestData.name,
          start_time: requestData.start_time,
          end_time: requestData.end_time,
          days: JSON.stringify(requestData.days),
        },
        transaction: dbTransaction,
      });
      if (existingShift) return helper.failed(res, variables.ValidationError, "Shift Already Exists!");

      //* Check if there is a dept with a name in a different id
      const existingShiftWithName = await shift.findOne({
        where: {
          name: requestData.name,
          company_id: req.user.company_id,
        },
        transaction: dbTransaction,
      });
      if (existingShiftWithName) {
        return helper.failed(res, variables.ValidationError, "Shift name already exists in different record!");
      }

      const existingSameShift = await shift.findOne({
        where: {
          company_id: req.user.company_id,
          start_time: requestData.start_time,
          end_time: requestData.end_time,
          days: JSON.stringify(requestData.days), // Ensure days are correctly formatted for comparison
        },
        transaction: dbTransaction,
      });
      if (existingSameShift) return helper.failed(res, variables.ValidationError, "Shift Already Exists with same parameters but different name!");

      requestData.company_id = req.user.company_id;

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
      const { id, days, ...updateFields } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      if (updateFields.start_time) {
        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(updateFields.start_time)) {
          return helper.failed(res, variables.ValidationError, "Start Time must be in HH:MM 24-hour format.");
        }
      }

      if (updateFields.end_time) {
        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(updateFields.end_time)) {
          return helper.failed(res, variables.ValidationError, "End Time must be in HH:MM 24-hour format.");
        }
      }

      if (updateFields.start_time && updateFields.end_time) {
        if (updateFields.start_time == updateFields.end_time) {
          return helper.failed(res, variables.ValidationError, "Start Time and End Time Cannot be the same");
        }
      }

      const existingShift = await shift.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists in your company!");

      const existingShiftWithName = await shift.findOne({
        where: {
          name: updateFields.name,
          company_id: req.user.company_id,
          id: { [Op.ne]: id },
        },
        transaction: dbTransaction,
      });
      if (existingShiftWithName) {
        return helper.failed(res, variables.ValidationError, "Shift name already exists in different record!");
      }

      if (updateFields.start_time && updateFields.end_time) {
        const alreadySameShift = await shift.findOne({
          where: { id: id, company_id: req.user.company_id, name: updateFields.name, start_time: updateFields.start_time, end_time: updateFields.end_time, days: JSON.stringify(days) },
          transaction: dbTransaction,
        });
        if (alreadySameShift) return helper.success(res, variables.Success, "Shift Re-Updated Successfully!");
      }

      const updated = await shift.update(
        {
          ...updateFields,
          days: JSON.stringify(days),
        },
        {
          where: { id: id, company_id: req.user.company_id },
          transaction: dbTransaction,
          individualHooks: true,
        }
      );

      if (updated) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Shift Updated Successfully");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
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
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      const existingShift = await shift.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists in your company id!");

      const isUsedInTeams = await team.findOne({ where: { shiftId: id } });
      if (isUsedInTeams) {
        return helper.failed(res, variables.BadRequest, "Cannot Delete this Shift as it is referred in other tables");
      }

      // Create and save the new user
      const deleteShift = await shift.destroy({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (deleteShift) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Shift deleted Successfully!");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the Shift!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default shiftController;
