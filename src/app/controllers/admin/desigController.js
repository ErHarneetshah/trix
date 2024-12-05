import designation from "../../../database/models/designationModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

class desigController {
  getAllDesig = async (req, res) => {
    try {
      const allData = await designation.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getDesigDropdown = async (req, res) => {
    try {
      const allData = await designation.findAll({
        where: {status: true},
        attributes: { exclude: ['createdAt', 'updatedAt', 'status'] }
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificDesig = async (req, res) => {
    try {
      const { id } = req.body;
      if(!id) return helper.failed(res, variables.NotFound, "Id is required");

      const desigData = await designation.findOne({
        where: { id: id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      if (!desigData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", desigData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name) return helper.failed(res, variables.BadRequest, "Name is Required!");

      const existingDesig = await designation.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });

      if (existingDesig) return helper.failed(res, variables.ValidationError, "Designation Already Exists");

      // Create and save the new user
      const addNewDesig = await designation.create({ name }, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Designation Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.ValidationError, "Id is Required!");

      const existingDesig = await designation.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDesig) return helper.failed(res, variables.NotFound, "Designation does not exists!");

      const [updatedRows] = await designation.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Designation updated Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, 0, null, "Unable to update the designation!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.BadRequest, "Id is Required!");

      const existingDesig = await designation.findOne({
        where: { id:id },
        transaction: dbTransaction,
      });
      if (!existingDesig) return helper.failed(res, variables.NotFound, "Designation does not exists!");

      // Create and save the new user
      const deleteDesig = await designation.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteDesig) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Designation deleted Successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete designation!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default desigController;
