import team from "../../../database/models/teamModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import responseUtils from "../../../utils/common/responseUtils.js";

class teamController {
  getAllTeam = async (req, res) => {
    try {
        const alldata = await team.findAll();
        if(!alldata) return responseUtils.errorResponse(res,"No data is available",400);

        return responseUtils.successResponse(
            res,
            { message: "Data fetched Successfully", data: alldata },
            200
          );
    } catch (error) {
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  addTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name , departmentId, shiftId} = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingRole = await team.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (existingRole)
        return responseUtils.errorResponse(
          res,
          "Role Already Exists",
          400
        );

      // Create and save the new user
      const addNewRole = await team.create(
        { name },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return responseUtils.successResponse(
        res,
        { message: "Role added successfully" },
        200
      );
    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  updateTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, newName, newStatus } = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingRole = await team.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingRole)
        return responseUtils.errorResponse(
          res,
          "Role does not Exists",
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
        const [updatedRows] = await team.update(updateData, {
          where: { name },
          transaction: dbTransaction,
        });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return responseUtils.successResponse(
          res,
          { message: "Role updated successfully" },
          200
        );
      } else {
        await dbTransaction.rollback();
        return responseUtils.errorResponse(
          res,
          { message: "Unable to update the role" },
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

  deleteTeam = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingRole = await team.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingRole)
        return responseUtils.errorResponse(
          res,
          "Role does not Exists",
          400
        );

      // Create and save the new user
      const deleteRole = await team.destroy({
        where: { name },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return responseUtils.successResponse(
          res,
          { message: "Role deleted successfully" },
          200
        );
      } else {
        await dbTransaction.rollback();
        return responseUtils.errorResponse(
          res,
          { message: "Unable to delete the role" },
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

export default teamController;
