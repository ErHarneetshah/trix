import department from "../../../database/models/departmentModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Op } from "sequelize";
import reportingManager from "../../../database/models/reportingManagerModel.js";

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
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;

      let where = {};
      let search = [];

      let searchable = ["name", "status"];

      if (searchParam) {
        searchable.forEach((key) => {
          search.push({
            [key]: {
              [Op.substring]: searchParam,
            },
          });
        });

        where = {
          [Op.or]: search,
        };
      }

      // Getting all the departments based on seacrh parameters with total count >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const allData = await department.findAndCountAll({
        where,
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

  //* API to get all the Department data who's status is 1 (active)
  getDeptDropdown = async (req, res) => {
    try {
      // Search Parameter filters and pagination code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;

      let where = {};
      let search = [];

      let searchable = ["name", "status"];

      if (searchParam) {
        searchable.forEach((key) => {
          search.push({
            [key]: {
              [Op.substring]: searchParam,
            },
          });
        });

        where = {
          [Op.or]: search,
        };
      }

      where.status = 1;

      // Getting all the departments with status condtion to be 1 (active) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const allData = await department.findAll({
        where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: { exclude: ["createdAt", "updatedAt", "status"] },
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
      const { name } = req.body;
      if (!name) return helper.failed(res, variables.NotFound, "Name is Required!");

      // checking whether department name requested by used already exists or not >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDept = await department.findOne({
        where: { name: name },
        transaction: dbTransaction,
      });
      if (existingDept) return helper.failed(res, variables.ValidationError, "Department Already Exists in our system");

      // Adding new department in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const addNewDept = await department.create({ name }, { transaction: dbTransaction });
      const departmentId = addNewDept.dataValues.id;

      //! Need to update this code as there is no reporting manager separate code
      const existingReportManager = await reportingManager.findOne({
        where: { departmentId: departmentId },
        transaction: dbTransaction,
      });
      if (existingReportManager) return helper.failed(res, variables.ValidationError, "Report Manager record Already Exists for this departmentId");
      const addNewReportManager = await reportingManager.create({ departmentId }, { transaction: dbTransaction });

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
      const { id, ...updateFields } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      // Check if there is a dept already exists >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.ValidationError, "Department does not exists!");

      // Check if there is a dept with a name in a different id >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDeptWithName = await department.findOne({
        where: {
          name: updateFields.name,
          id: { [Op.ne]: id }, // Exclude the current record by id
        },
        transaction: dbTransaction,
      });
      if (existingDeptWithName) {
        return helper.failed(res, variables.ValidationError, "Department name already exists in different record!");
      }

      // Check if the id has the same value in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const alreadySameDept = await department.findOne({
        where: { id: id, name: updateFields.name },
        transaction: dbTransaction,
      });
      if (alreadySameDept) return helper.success(res, variables.Success, "Department Re-Updated Successfully!");


      if (updateFields.status !== 0 && updateFields.status !== 1) {
        return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
      }

      // Update the db entry >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const [updatedRows] = await department.update(updateFields, {
        where: { id: id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        // Committ enteries in db if passed everything >>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Data Updated Succesfully");
      } else {
        // Rolback enteries from db if error occured >>>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.rollback();
        return helper.failed(res, variables.InternalServerError, "Unable to update the deppartment");
      }
    } catch (error) {
      // Rolback enteries from db if error occured >>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is Required!");

      // Check if the department already exists in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDept = await department.findOne({
        where: { id: id },
        transaction: dbTransaction,
      });
      if (!existingDept) return helper.failed(res, variables.NotFound, "Department does not found in our system");

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
