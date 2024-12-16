import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Op } from "sequelize";
import User from "../../../database/models/userModel.js";
import team from "../../../database/models/teamModel.js";
import { ProductiveApp } from "../../../database/models/ProductiveApp.js";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";

class deptController {
  getTestData = async (req, res) => {
    return helper.success(res, variables.Success, "Permission Middleware Worked Successfully Succesfully");
  };

  //* ________-------- GET All Departments ---------______________
  getAllDept = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      let searchable = ["name"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      // ___________----------------------------------------------________________

      const allData = await department.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: ["id", "name", "parentDeptId"],
        include: [
          {
            model: department,
            as: "parentDept",
            attributes: ["name"],
          },
        ],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- GET Active Departments Dropdown ---------______________
  getDeptDropdown = async (req, res) => {
    try {
      const allData = await department.findAll({
        where: { company_id: req.user.company_id, status: 1 },
        attributes: ["id", "name"],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- GET Specific Departments ---------______________
  getSpecificDept = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is required and in numbers");

      const deptData = await department.findOne({
        where: { id: id, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!deptData) return helper.failed(res, variables.NotFound, "Department Not Found in your company data");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", deptData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- POST Add Department ---------______________
  addDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name, parentDeptId } = req.body;
      if (!name || typeof name !== "string" || !parentDeptId || isNaN(parentDeptId)) return helper.failed(res, variables.NotFound, "Both Name (String) and parentDeptId (in Number) is Required!");

      // ___________-------- Dept exists with name or not ---------________________
      const existingDept = await department.findOne({
        where: { name: name, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (existingDept) return helper.failed(res, variables.ValidationError, "Department Already Exists in our system");

      // ___________-------- Parent Dept exists or not ---------________________
      const existingParentDept = await department.findOne({
        where: { id: parentDeptId, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingParentDept) return helper.failed(res, variables.ValidationError, "Parent Department does not exists in our system");

      // ___________-------- Adding Dept ---------________________
      let addNewDept = await department.create({ name: name, parentDeptId: parentDeptId, company_id: req.user.company_id }, { transaction: dbTransaction });
      if (!addNewDept) return helper.failed(res, variables.InternalError, "Failed to create the department.");

      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Department Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- PUT Update Department ---------______________
  updateDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      let { id, name, parentDeptId } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required!");
      if ((!name || typeof name !== "string") && (!parentDeptId || isNaN(parentDeptId))) return helper.failed(res, variables.NotFound, "Either Name (String) or parentDeptId (Number) is Required");
      if (parentDeptId) if (id == parentDeptId) return helper.failed(res, variables.Unauthorized, "Both Id and ParentDeptId cannot be same");

      // ___________-------- Dept exists or not ---------________________
      const existingDept = await department.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.ValidationError, "Department does not exists!");

      // ___________-------- Dept exists with same name or not ---------________________
      if (name) {
        const existingDeptWithName = await department.findOne({
          where: {
            name: name,
            company_id: req.user.company_id,
            id: { [Op.ne]: id },
          },
          transaction: dbTransaction,
        });
        if (existingDeptWithName) return helper.failed(res, variables.ValidationError, "Department name already exists in different record!");
      }

      // ___________-------- Dept exists with same name or not ---------________________
      if (parentDeptId) {
        if (existingDept.isRootId) {
          parentDeptId = null;
        } else {
          const existingDeptWithName = await department.findOne({
            where: {
              id: parentDeptId,
              company_id: req.user.company_id,
            },
            transaction: dbTransaction,
          });
          if (!existingDeptWithName) return helper.failed(res, variables.ValidationError, "Parent Department does not exists!");
        }
      }

      // ___________-------- Adding fields to update ---------________________
      const updateFields = {};
      if (name !== undefined || !name) updateFields.name = name;

      if (parentDeptId !== undefined || !parentDeptId) updateFields.parentDeptId = parentDeptId;

      if (Object.keys(updateFields).length > 0) {
        const update = await department.update(updateFields, {
          where: {
            id: id,
            company_id: req.user.company_id,
          },
          transaction: dbTransaction,
          individualHooks: true,
        });
        if (!update) {
          if (dbTransaction) await dbTransaction.rollback();
          return helper.failed(res, variables.InternalError, "Failed to update the department.");
        }
      }

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Data Updated Succesfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- DELETE Delete Department ---------______________
  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.NotFound, "Id is Required and in numbers!");

      // ___________-------- Dept Exists or not ---------________________
      const existingDept = await department.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.NotFound, "Department does not found in our system");

      // ___________-------- Dept Used in order or not ---------________________
      const isUsedInUsers = await User.findOne({ where: { departmentId: id } });
      const isUsedInProductiveAndNonApps = await ProductiveApp.findOne({ where: { department_id: id } });
      const isUsedInTeams = await team.findOne({ where: { departmentId: id } });

      if (isUsedInTeams || isUsedInProductiveAndNonApps || isUsedInUsers) {
        return helper.failed(res, variables.Unauthorized, "Cannot Delete this Department as it is referred in other tables");
      }

      // ___________-------- Delete Department ---------________________
      const deleteDept = await department.destroy({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (deleteDept) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Department Successfully Deleted");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete department");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default deptController;
