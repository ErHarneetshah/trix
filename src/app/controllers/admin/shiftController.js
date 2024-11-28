import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import responseUtils from "../../../utils/common/responseUtils.js";

class deptController {
  getAllDept = async (req, res) => {
    try {
        const alldata = await department.findAll();
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

  addDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingDept = await department.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (existingDept)
        return responseUtils.errorResponse(
          res,
          "Department Already Exists",
          400
        );

      // Create and save the new user
      const addNewDept = await department.create(
        { name },
        { transaction: dbTransaction }
      );
      await dbTransaction.commit();
      return responseUtils.successResponse(
        res,
        { message: "Department added successfully" },
        200
      );
    } catch (error) {
      if (dbTransaction) {
        await dbTransaction.rollback();
      }
      return responseUtils.errorResponse(res, error.message, 400);
    }
  };

  updateDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, newName, newStatus } = req.body;
      if (!name)
        return responseUtils.errorResponse(res, "Name is Required", 400);

      const existingDept = await department.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDept)
        return responseUtils.errorResponse(
          res,
          "Department does not Exists",
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
        const [updatedRows] = await department.update(updateData, {
          where: { name },
          transaction: dbTransaction,
        });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return responseUtils.successResponse(
          res,
          { message: "Department updated successfully" },
          200
        );
      } else {
        await dbTransaction.rollback();
        return responseUtils.errorResponse(
          res,
          { message: "Unable to update the department" },
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

      const existingDept = await department.findOne({
        where: { name },
        transaction: dbTransaction,
      });
      if (!existingDept)
        return responseUtils.errorResponse(
          res,
          "Department does not Exists",
          400
        );

      // Create and save the new user
      const deleteDept = await department.destroy({
        where: { name },
        transaction: dbTransaction,
      });

      if (deleteDept) {
        await dbTransaction.commit();
        return responseUtils.successResponse(
          res,
          { message: "Department deleted successfully" },
          200
        );
      } else {
        await dbTransaction.rollback();
        return responseUtils.errorResponse(
          res,
          { message: "Unable to delete the department" },
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

export default deptController;
