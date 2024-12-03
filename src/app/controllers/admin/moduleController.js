import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class moduleController {
  getAllModules = async (req, res) => {
    try {
      const allData = await department.findAll();
      if (!allData) return helper.failed(res, variables.NotFound, error.message);

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addModules = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name) return helper.failed(res, variables.NotFound, "Name is Required!");

      const existingDept = await department.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });
      if (existingDept) return helper.failed(res, variables.ValidationError, "Department Already Exists in our system");

      const addNewDept = await department.create({ name }, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Department Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateModules = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.NotFound, "Department does not found in our system");

      const [updatedRows] = await department.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Data Updated Succesfully");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.InternalServerError, "Unable to update the deppartment");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteModules = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.NotFound, "Department does not found in our system");

      // Create and save the new user
      const deleteDept = await department.destroy({
        where: { id:id },
        transaction: dbTransaction,
      });

      if (deleteDept) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Department Successfully Deleted");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete department");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default moduleController;
