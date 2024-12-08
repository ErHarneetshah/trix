// import reportingManager from "../../../database/models/reportingManagerModel.js";
import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import department from "../../../database/models/departmentModel.js";
import { Op } from "sequelize";

class reportingManagerController {
  getAllReportManager = async (req, res) => {
    try {
      let { searchParam, limit, page } = req.query;
      let searchable = ["name", `$reportingManager.fullname$`];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);

      const allData = await department.findAll({
        where,
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

      //! Adjust data in such a way that is changes null value to  {}
      // const modifiedData = allData.map((item) => {
      //   // Ensure reportingManager is not null, replace with {} if it is
      //   if (!item.reportingManager) {
      //     item.reportingManager = {};
      //   }
      //   return item;
      // });

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getReportManagerDropdown = async (req, res) => {
    try {
      const allData = await User.findAll({
        where: {
          status: true,
          isAdmin: 0,
          // id: {
          //   [Op.notIn]: sequelize.literal(`(SELECT DISTINCT reportingManagerId FROM departments WHERE reportingManagerId IS NOT NULL)`),
          // },
        },
        attributes: ["id", "fullname"],
      });

      if (!allData) return helper.failed(res, variables.NotFound, "Data not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  // getSpecificReportManager = async (req, res) => {
  //   try {
  //     const requestData = req.body;

  //     const specificData = await reportingManager.findOne({
  //       attributes: { exclude: ["createdAt", "updatedAt"] },
  //       where: requestData,
  //     });
  //     if (!specificData) return helper.failed(res, variables.NotFound, "Data not Found");

  //     return helper.success(res, variables.Success, "Data Fetched Succesfully", specificData);
  //   } catch (error) {
  //     return helper.failed(res, variables.BadRequest, error.message);
  //   }
  // };

  //* Add Report Manager API Code
  // addReportManager = async (req, res) => {
  //   const dbTransaction = await sequelize.transaction();
  //   try {
  //     const { id, reportManagerId } = req.body;

  //     if (!id || !reportManagerId) {
  //       return helper.failed(res, variables.ValidationError, `Both Id and reportManagerId field is required`);
  //     }

  //     const userExists = await User.findOne({ where: { id: reportManagerId } });
  //     const departmentExists = await department.findOne({ where: { id: id } });

  //     if (!userExists) return helper.failed(res, variables.NotFound, "User does not exists in system!");
  //     if (!departmentExists) return helper.failed(res, variables.NotFound, "Department does not exists in system!");

  //     const existingReportManager = await department.findOne({
  //       where: { reportingManagerId: reportManagerId },
  //       transaction: dbTransaction,
  //     });
  //     if (existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager Already assigned to a department");

  //     const existingReportManagerRecord = await department.findOne({
  //       where: { id: id, reportingManagerId: reportManagerId },
  //       transaction: dbTransaction,
  //     });
  //     if (existingReportManagerRecord) return helper.failed(res, variables.ValidationError, "Report Manager Record Already Exists in our system");

  //     // Create and save the new user
  //     const addNewReportManager = await reportingManager.create({ userId, departmentId }, { transaction: dbTransaction });
  //     await dbTransaction.commit();
  //     return helper.success(res, variables.Created, "Reporting Manager Added Successfully!");
  //   } catch (error) {
  //     if (dbTransaction) await dbTransaction.rollback();
  //     return helper.failed(res, variables.BadRequest, error.message);
  //   }
  // };

  updateReportManager = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, reportManagerId } = req.body;
      if (!id || !reportManagerId) {
        return helper.failed(res, variables.NotFound, "Id and reportManagerId both are Required!");
      }

      //* Check if there is a dept already exists
      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.ValidationError, "Department does not exists!");
     
      //* Check if there is a user already exists
      const existingUser = await User.findOne({
        where: { id: reportManagerId },
        transaction: dbTransaction,
      });
      if (!existingUser) return helper.failed(res, variables.ValidationError, "User does not exists in system!");
      if(existingUser.isAdmin) return helper.failed(res, variables.Unauthorized, "Not allowed to assign to this Id");

      //* Check if there is a dept with a name in a different id
      // const existingReportManager = await department.findOne({
      //   where: {
      //     reportingManagerId: reportManagerId,
      //     id: { [Op.ne]: id }, // Exclude the current record by id
      //   },
      //   transaction: dbTransaction,
      // });
      // if (existingReportManager) {
      //   return helper.failed(res, variables.ValidationError, "Report Manager Already Assigned to a department");
      // }

      //* if the id has the same value in db
      const alreadySameReportManager = await department.findOne({
        where: { id: id, reportingManagerId: reportManagerId },
        transaction: dbTransaction,
      });
      if (alreadySameReportManager) return helper.success(res, variables.Success, "Report Manager Re-Assigned Successfully!");

      const [updatedRows] = await department.update(
        {
          reportingManagerId: reportManagerId,
        },
        {
          where: { id: id },
          transaction: dbTransaction,
          individualHooks: true,
        }
      );

      if (updatedRows > 0) {
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Reporting Manager updated successfully!");
      } else {
        await dbTransaction.rollback();
        return helper.failed(res, variables.BadRequest, "Unable to update reporting manager!");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  // deleteReportManager = async (req, res) => {
  //   const dbTransaction = await sequelize.transaction();
  //   try {
  //     const { id } = req.body;
  //     if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

  //     const existingReportManager = await reportingManager.findOne({
  //       where: { id: id },
  //       transaction: dbTransaction,
  //     });
  //     if (!existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager does not exists");

  //     // Create and save the new user
  //     const deleteRole = await reportingManager.destroy({
  //       where: { id: id },
  //       transaction: dbTransaction,
  //     });

  //     if (deleteRole) {
  //       await dbTransaction.commit();
  //       return helper.success(res, variables.Success, "Report Manager deleted Successfully!");
  //     } else {
  //       await dbTransaction.rollback();
  //       return helper.failed(res, variables.UnknownError, "Unable to delete reporting Manager!");
  //     }
  //   } catch (error) {
  //     if (dbTransaction) await dbTransaction.rollback();
  //     return helper.failed(res, variables.BadRequest, error.message);
  //   }
  // };
}

export default reportingManagerController;
