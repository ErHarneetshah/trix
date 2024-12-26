// import reportingManager from "../../../database/models/reportingManagerModel.js";
import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import department from "../../../database/models/departmentModel.js";
import { Op } from "sequelize";

class reportingManagerController {
  //* ________-------- GET All Report Managers ---------______________
  getAllReportManager = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      let searchable = ["name", `$reportingManager.fullname$`];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);
      where.company_id = req.user.company_id;
      // ___________---------- Search, Limit, Pagination ----------_______________

      const allData = await department.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: ["id", "name", "reportingManagerId"],
        include: [
          {
            model: User,
            as: "reportingManager",
            attributes: ["fullname"],
          },
        ],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- GET Active Report Managers Dropdown ---------______________
  getReportManagerDropdown = async (req, res) => {
    try {
      const allData = await User.findAll({
        where: {
          status: true,
          isAdmin: 0,
          company_id: req.user.company_id,
        },
        attributes: ["id", "fullname"],
      });

      if (!allData) return helper.failed(res, variables.NotFound, "Data not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- POST Add Report Managers ---------______________
  addReportManager = async (req, res) => {
    return helper.failed(res, variables.BadRequest, "This API is for development Purposes only. It is not for front end or project's main purposes");
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, reportManagerId } = req.body;

      if (!id || !reportManagerId) {
        return helper.failed(res, variables.ValidationError, `Both Id and reportManagerId field is required`);
      }

      const userExists = await User.findOne({ where: { id: reportManagerId } });
      const departmentExists = await department.findOne({ where: { id: id } });

      if (!userExists) return helper.failed(res, variables.NotFound, "User does not exists in system!");
      if (!departmentExists) return helper.failed(res, variables.NotFound, "Department does not exists in system!");

      const existingReportManager = await department.findOne({
        where: { reportingManagerId: reportManagerId },
        transaction: dbTransaction,
      });
      if (existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager Already assigned to a department");

      const existingReportManagerRecord = await department.findOne({
        where: { id: id, reportingManagerId: reportManagerId },
        transaction: dbTransaction,
      });
      if (existingReportManagerRecord) return helper.failed(res, variables.ValidationError, "Report Manager Record Already Exists in company");

      // Create and save the new user
      const addNewReportManager = await reportingManager.create({ userId, departmentId }, { transaction: dbTransaction });
      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Reporting Manager Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- PUT Add Report Managers ---------______________
  updateReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, reportManagerId } = req.body;
      if (!id || isNaN(id) || !reportManagerId || isNaN(reportManagerId)) {
        return helper.failed(res, variables.NotFound, "Id and reportManagerId both are Required!");
      }

      if (id == reportManagerId) {
        return helper.failed(res, variables.NotFound, "Id and reportManagerId cannot be same!");
      }

      // ________-------- Report Managers Exists or Not ---------______________
      const existingReportManager = await department.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingReportManager) return helper.failed(res, variables.ValidationError, "Department does not exists!");

      // ________-------- User Exists or Not ---------______________
      const existingUser = await User.findOne({
        where: { id: reportManagerId, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingUser) return helper.failed(res, variables.ValidationError, "User does not exists in system!");
      if (existingUser.isAdmin) return helper.failed(res, variables.BadRequest, "Not allowed to assign to this Id");

      // ________-------- Update Department ---------______________
      await department.update(
        {
          reportingManagerId: reportManagerId,
        },
        {
          where: { id: id, company_id: req.user.company_id },
          transaction: dbTransaction,
          individualHooks: true,
        }
      );

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Reporting Manager updated successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* ________-------- DELETE Report Managers ---------______________
  deleteReportManager = async (req, res) => {
    return helper.failed(res, variables.BadRequest, "This API is for development Purposes only. It is not for front end or project's main purposes");
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      const existingReportManager = await reportingManager.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager does not exists");

      // Create and save the new user
      const deleteRole = await reportingManager.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteRole) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Report Manager deleted Successfully!");
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete reporting Manager!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default reportingManagerController;
