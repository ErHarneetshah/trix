import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Op } from "sequelize";
import User from "../../../database/models/userModel.js";
import team from "../../../database/models/teamModel.js";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";
import { ProductiveApp }from "../../../database/models/ProductiveApp.js";

class deptController {
  //* Using this just for testing purposes of role permission middleware
  getTestData = async (req, res) => {
    return helper.success(res, variables.Success, "Permission Middleware Worked Successfully Succesfully");
  };

  //* API to get all the Department data
  getAllDept = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page } = req.query;
      let searchable = ["name", "status"];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let where = await helper.searchCondition(searchParam, searchable);

      // Getting all the departments based on seacrh parameters with total count >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const allData = await department.findAndCountAll({
        where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: ["id", "name", "status"],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to get all the Department data who's status is 1 (active)
  getDeptDropdown = async (req, res) => {
    try {

      const allData = await department.findAll({
        where: {status : 1},
        attributes: ["id", "name"],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to get only a specific department data
  getSpecificDept = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is required");

      // Retrieving the specific department data from table >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const deptData = await department.findOne({
        where: { id: id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!deptData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", deptData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to add new department in the department table
  addDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      // const { name, parentDeptId } = req.body;
      const { name } = req.body;

      // if (!name || !parentDeptId) return helper.failed(res, variables.NotFound, "Both Name and parentDeptId is Required!");
      if (!name) return helper.failed(res, variables.NotFound, "Name field is Required!");


      // checking whether department name requested by used already exists or not >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDept = await department.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });
      if (existingDept) return helper.failed(res, variables.ValidationError, "Department Already Exists in our system");

      // const existingParentDept = await department.findOne({
      //   where: { id: parentDeptId },
      //   transaction: dbTransaction,
      // });
      // if (!existingParentDept) return helper.failed(res, variables.ValidationError, "Department does not exists in our system");

      // Adding new department in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // const addNewDept = await department.create({ name: name, parentDeptId: parentDeptId }, { transaction: dbTransaction });
      const addNewDept = await department.create({ name: name}, { transaction: dbTransaction });


      // Committing db enteries if passes every code correctly >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      await dbTransaction.commit();
      return helper.success(res, variables.Created, "Department Added Successfully!");
    } catch (error) {
      // Revert db entereis if error occured >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      // const { id, name, parentDeptId } = req.body;
      const { id, name } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      // if (!name && !parentDeptId) return helper.failed(res, variables.NotFound, "Either Name or parentDeptId is Required in order to update the table!");
      if (!name) return helper.failed(res, variables.NotFound, "Name fiedl is Required in order to update the table!");

      // Check if there is a dept already exists >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.ValidationError, "Department does not exists!");

      // Check if there is a dept with a name in a different id >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (name) {
        const existingDeptWithName = await department.findOne({
          where: {
            name: name,
            id: { [Op.ne]: id }, // Exclude the current record by id
          },
          transaction: dbTransaction,
        });
        if (existingDeptWithName) {
          return helper.failed(res, variables.ValidationError, "Department name already exists in different record!");
        }
      }
      // Check if parent dept id exists >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // if (parentDeptId) {
      //   const existingDeptWithName = await department.findOne({
      //     where: {
      //       id: parentDeptId,
      //     },
      //     transaction: dbTransaction,
      //   });
      //   if (!existingDeptWithName) {
      //     return helper.failed(res, variables.ValidationError, "Parent Department does not exists!");
      //   }
      // }

      //! (HOLD) Check if the id has the same value in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      // const alreadySameDept = await department.findOne({
      //   where: { id: id, name: name, parentDeptId: parentDeptId },
      //   transaction: dbTransaction,
      // });
      // if (alreadySameDept) return helper.success(res, variables.Success, "Department Re-Updated Successfully!");

      const updateFields = {};

      // Only include the fields if they are provided (not undefined or null)
      if (name !== undefined && !name) {
        updateFields.name = name;
      }

      // if (parentDeptId !== undefined && !parentDeptId) {
      //   updateFields.parentDeptId = parentDeptId;
      // }

      // Update the db entry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (Object.keys(updateFields).length > 0) {
        await department.update(updateFields, {
          where: {
            id: id, // Ensure this condition identifies the correct record
          },
          transaction: dbTransaction,
          individualHooks: true,
        });
      }
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Data Updated Succesfully");
    } catch (error) {
      // Rolback enteries from db if error occured >>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      return helper.failed(res, variables.Blocked, "This Route is in hold for now");
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      // Check if the department already exists in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.NotFound, "Department does not found in our system");

      // Check if the Deaprtmetn id exists in other tables >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const isUsedInUsers = await User.findOne({ where: { departmentId: id } });
      const isUsedInBlockedWebsites = await BlockedWebsites.findOne({ where: { departmentId: id } });
      const isUsedInProductiveAndNonApps = await ProductiveApp.findOne({ where: { departmentId: id } });
      const isUsedInTeams = await team.findOne({ where: { departmentId: id } });

      if (isUsedInTeams || isUsedInBlockedWebsites || isUsedInProductiveAndNonApps || isUsedInUsers) {
        return helper.failed(res, variables.Unauthorized, "Cannot Delete this Department as it is referred in other tables");
      }

      // Delete the department from table >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const deleteDept = await department.destroy({
        where: { id: id },
        transaction: dbTransaction,
      });

      if (deleteDept) {
        // Commits db enteries if passes everything >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Department Successfully Deleted");
      } else {
        // Rollback db enteries if error occured >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to delete department");
      }
    } catch (error) {
      // Rollback db enteries if error occured >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default deptController;
