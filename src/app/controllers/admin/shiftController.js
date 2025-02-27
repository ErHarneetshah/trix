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
      // ___________-------- Role Permisisons Exists or not ---------________________
      const routeMethod = req.method;
      const isApproved = await helper.checkRolePermission(req.user.roleId, "Shifts", routeMethod, req.user.company_id);
      if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // ___________-------- Role Permisisons Exists or not ---------________________

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
      if (!alldata) return helper.failed(res, variables.NotFound, "No Shift is available!");

      return helper.success(res, variables.Success, "Shifts fetched successfully!", alldata);
    } catch (error) {
      //helper.logger(res, "Shift Controller -> getAllShift", error);
      return helper.failed(res, variables.BadRequest, "Unable to fetch shifts");
    }
  };

  getShiftDropdown = async (req, res) => {
    try {
      const alldata = await shift.findAll({
        where: { status: true, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt", "status"] },
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Shift is available!");

      return helper.success(res, variables.Success, "Shifts fetched successfully!", alldata);
    } catch (error) {
      //helper.logger(res, "Shift Controller -> getShiftDropdown", error);
      return helper.failed(res, variables.BadRequest, "Unable to Fetch Shifts");
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
      if (!specificData) return helper.failed(res, variables.NotFound, `No Shift Found`);

      return helper.success(res, variables.Success, "Shift Fetched Succesfully", specificData);
    } catch (error) {
      //helper.logger(res, "Shift Controller -> getSpecificShift", error);
      return helper.failed(res, variables.BadRequest, "Unable to Fetch Shift");
    }
  };

  //! same shift parameters adding again issue

  addShift = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Shifts", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

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
          // days: JSON.stringify(requestData.days),
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
          // days: JSON.stringify(requestData.days), // Ensure days are correctly formatted for comparison
        },
        transaction: dbTransaction,
      });
      if (existingSameShift) return helper.failed(res, variables.ValidationError, "Shift Already Exists with same time");

      requestData.company_id = req.user.company_id;

      // Create and save the new user
      const newShift = await shift.create(requestData, {
        transaction: dbTransaction,
      });
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Shift Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Shift Controller -> addShift", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateShift = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Shifts", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

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

      const existingShift = await shift.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists in company!");

      if (updateFields.name) {
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
      }

      if (updateFields.start_time && updateFields.end_time) {
        if (updateFields.start_time == updateFields.end_time) {
          return helper.failed(res, variables.ValidationError, "Start Time and End Time Cannot be the same");
        }

        const existingShiftWithparam = await shift.findOne({
          where: {
            // name: updateFields.name,
            company_id: req.user.company_id,
            start_time: updateFields.start_time,
            end_time: updateFields.end_time,
            // days: JSON.stringify(days),
            id: { [Op.ne]: id },
          },
          transaction: dbTransaction,
        });
        if (existingShiftWithparam) {
          return helper.failed(res, variables.ValidationError, "Shift already exists with same parameter in different record!");
        }
      }

      if (days) {
        await shift.update(
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
      } else {
        await shift.update(
          {
            ...updateFields,
          },
          {
            where: { id: id, company_id: req.user.company_id },
            transaction: dbTransaction,
            individualHooks: true,
          }
        );
      }

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Shift Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Shift Controller -> updateShift", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteShift = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Shifts", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      const existingShift = await shift.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingShift) return helper.failed(res, variables.ValidationError, "Shift does not exists in company id!");

      const isUsedInTeams = await team.findOne({ where: { shiftId: id } });
      if (isUsedInTeams) {
        return helper.failed(res, variables.BadRequest, "Shift cannot be deleted because it is in use by other records.");
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
        return helper.failed(res, variables.BadRequest, "Unable to delete the Shift!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Shift Controller -> deleteShift", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default shiftController;
