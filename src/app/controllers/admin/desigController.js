import designation from "../../../database/models/designationModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Op } from "sequelize";
import User from "../../../database/models/userModel.js";

class desigController {
  //* ________-------- GET All Designation ---------______________
  getAllDesig = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let searchable = ["name", "status"];
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      // ___________----------------------------------------------________________

      const allData = await designation.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- GET Active Designation Dropdown ---------______________
  getDesigDropdown = async (req, res) => {
    try {
      const allData = await designation.findAll({
        where: {status: 1, company_id: req.user.company_id},
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- GET Specific Designation ---------______________
  getSpecificDesig = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is required");

      const desigData = await designation.findOne({
        where: { id: id, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!desigData) return helper.failed(res, variables.NotFound, "Designation Data Not Found in your company data");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", desigData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- POST Add Designation ---------______________
  addDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name || typeof name !== "string") return helper.failed(res, variables.BadRequest, "Name is Required!");

      // ___________---------- Designation exists or not ----------_______________
      const existingDesig = await designation.findOne({
        where: { name: name, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (existingDesig) return helper.failed(res, variables.ValidationError, "Designation Already Exists in your company");

      // ___________---------- Designation Add ----------_______________
      const addNewDesig = await designation.create({ name: name, company_id: req.user.company_id }, { transaction: dbTransaction });
      if (!addNewDesig) return helper.failed(res, variables.ValidationError, "Error occured while creating designation");

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Designation Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- PUT Update Designation ---------______________
  updateDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, name } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Id is Required and in numbers!");
      if (!name || typeof name !== "string") return helper.failed(res, variables.ValidationError, "Name is Required!");

      // ___________---------- Designation Exists or not ----------_______________
      const existingDesig = await designation.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDesig) return helper.failed(res, variables.ValidationError, "Designation does not exists!");

      // ___________---------- Designation with same name Exists or not ----------_______________
      const existingDesigWithName = await designation.findOne({
        where: {
          name: name,
          company_id: req.user.company_id,
          id: { [Op.ne]: id },
        },
        transaction: dbTransaction,
      });
      if (existingDesigWithName) {
        return helper.failed(res, variables.ValidationError, "Desgination name already exists in different record!");
      }

      
      // ___________---------- Designation Update ----------_______________
      const updated = await designation.update(
        {
          name: name,
        },
        {
          where: { id: id, company_id: req.user.company_id },
          transaction: dbTransaction,
          individualHooks: true,
        }
      );

      if (updated) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Designation updated Successfully!");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, 0, null, "Unable to update the designation!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- DELETE Delete Designation ---------______________
  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.BadRequest, "Id is Required and in numbers!");

      // ___________---------- Designation Exists or not ----------_______________
      const existingDesig = await designation.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDesig) return helper.failed(res, variables.NotFound, "Designation does not exists!");

      // ___________---------- Designation Used in other table or not ----------_______________
      const isUsedInUsers = await User.findOne({ where: { designationId: id } });
      if (isUsedInUsers) return helper.failed(res, variables.Unauthorized, "Cannot Delete this Designation as it is referred in other tables");

      // ___________---------- Designation Destroy ----------_______________
      const deleteDesig = await designation.destroy({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (deleteDesig) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Designation deleted Successfully!");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete designation!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default desigController;
