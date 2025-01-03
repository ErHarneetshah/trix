import { start } from "repl";
import shift from "../../../database/models/shiftModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";

class shiftController {
  getAllShift = async (req, res) => {
    try {
      const alldata = await shift.findAll();
      if (!alldata)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "No Data is available!"
        );

      return helper.sendResponse(
        res,
        variables.Success,
        { data: alldata },
        "All Data fetched Successfully!"
      );
    } catch (error) {
      return helper.sendResponse(
        res,
        variables.BadRequest,
        null,
        "All Data fetched Successfully!"
      );
    }
  };

  addShift = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, start_time, end_time, days } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!start_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Start Time is Required!"
        );
      if (!end_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "End Time is Required!"
        );
      if (!days)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Days is Required!"
        );

      const existingShift = await shift.findOne({
        where: { name, start_time, end_time, days },
        transaction: dbTransaction,
      });
      if (existingShift)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "Shift Already Exists!"
        );

      let total_hours = await this.calTotalHr(start_time, end_time);

      // Create and save the new user
      const addNewShift = await shift.create(
        { name, start_time, end_time, days, total_hours },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return helper.sendResponse(
        res,
        variables.Success,
        null,
        "Shift Added Successfully!"
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

  updateShift = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const {
        name,
        start_time,
        end_time,
        days,
        newShiftName,
        newStart_time,
        newEnd_time,
        newDays,
      } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!start_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Start Time is Required!"
        );
      if (!end_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "End Time is Required!"
        );
      if (!days)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Days is Required!"
        );

      const existingShift = await shift.findOne({
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });

      if (!existingShift)
        return helper.sendResponse(
          res,
          variables.BadRequest,
          null,
          "Shift does not exists"
        );

      const updateData = {};
      if (newShiftName) updateData.name = newShiftName;
      if (newStart_time) updateData.start_time = newStart_time;
      if (newEnd_time) updateData.end_time = newEnd_time;
      if (newDays) updateData.days = newDays;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "No Updating values provided to update"
        );
      }

      if (newStart_time && newEnd_time) {
        updateData.total_hours = await this.calTotalHr(
          newStart_time,
          newEnd_time
        );
      }

      console.log(updateData);
      // Perform the update operation
      const [updatedRows] = await shift.update(updateData, {
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Shift Updated Successfully"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to update the shift"
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

  deleteShift = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, start_time, end_time } = req.body;
      if (!name)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Name is Required!"
        );
      if (!start_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "Start Time is Required!"
        );
      if (!end_time)
        return helper.sendResponse(
          res,
          variables.NotFound,
          null,
          "End Time is Required!"
        );

      const existingShift = await shift.findOne({
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });
      if (!existingShift)
        return helper.sendResponse(
          res,
          variables.ValidationError,
          null,
          "Shift does not exists!"
        );

      // Create and save the new user
      const deleteShift = await shift.destroy({
        where: {name: name, start_time: start_time, end_time: end_time},
        transaction: dbTransaction,
      });

      if (deleteShift) {
        await dbTransaction.commit();
        return helper.sendResponse(
          res,
          variables.Success,
          null,
          "Shift deleted Successfully!"
        );
      } else {
        await dbTransaction.rollback();
        return helper.sendResponse(
          res,
          variables.UnknownError,
          null,
          "Unable to delete the Shift!"
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

  calTotalHr = async (start_time, end_time) => {
    let startTime = parseInt(start_time.split(":")[0], 10); // Extract the hour part: 18
    let endTime = parseInt(end_time.split(":")[0], 10); // Extract the hour part: 9

    let total_hours = endTime - startTime;
    return total_hours;
  };
}

export default shiftController;
