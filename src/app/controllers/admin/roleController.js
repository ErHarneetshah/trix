import role from "../../../database/models/roleModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class roleController {
  getAllRole = async (req, res) => {
    try {
      const alldata = await role.findAll();
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data Fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name) return helper.failed(res, variables.NotFound, "Name is required!");

      const existingRole = await role.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });
      if (existingRole) return helper.failed(res, variables.ValidationError, "Role Already Exists!");

      // Create and save the new user
      const addNewRole = await role.create({ name }, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Role Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is required!");

      const existingRole = await role.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingRole) 
        return helper.failed(res, variables.ValidationError, "Role does not exists!");

      const [updatedRows] = await role.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Role Updated Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to update the role!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);      
    }
  };

  deleteRole = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound,"Id is Required!");

      const existingRole = await role.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingRole) return helper.failed(res, variables.ValidationError, "Role does not exists!");

      // Create and save the new user
      const deleteRole = await role.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return helper.success(res, variables.Created,"Role deleted successfully");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete the role");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default roleController;
