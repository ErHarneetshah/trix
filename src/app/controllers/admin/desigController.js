import designation from "../../../database/models/designationModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";
import { Op } from "sequelize";
import User from "../../../database/models/userModel.js";

class desigController {
  //* API to get all the Designation data
  getAllDesig = async (req, res) => {
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

      where.company_id = req.user.company_id;

      // Getting all the designation based on seacrh parameters with total count >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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

  //* API to get all the Designation data who's status is 1 (active)
  getDesigDropdown = async (req, res) => {
    try {
     let where  = {};
      where.status = 1;
      where.company_id = req.user.company_id;

      // Getting all the designations with status condtion to be 1 (active) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const allData = await designation.findAll({
        where,
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", allData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to get specific designation data
  getSpecificDesig = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.NotFound, "Id is required");

      // Retrieve specific designation data from db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const desigData = await designation.findOne({
        where: { id: id, company_id: req.user.company_id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (!desigData) return helper.failed(res, variables.NotFound, "Data Not Found");

      return helper.success(res, variables.Success, "Data Fetched Succesfully", desigData);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to add new designation in the db
  addDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { name } = req.body;
      if (!name) return helper.failed(res, variables.BadRequest, "Name is Required!");

      // Check if the designation id exists in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDesig = await designation.findOne({
        where: { name: name, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (existingDesig) return helper.failed(res, variables.ValidationError, "Designation Already Exists");

      // Add new designation in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const addNewDesig = await designation.create({ name: name, compnay_id: req.user.company_id }, { transaction: dbTransaction });
      
      // Commits db enteries if passes everything >>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      await dbTransaction.commit();
      return helper.success(res, variables.Success, "Designation Added Successfully!");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to Update the designation from db
  updateDesig = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id, name } = req.body;
      if (!id) return helper.failed(res, variables.ValidationError, "Id is Required!");

      // Check if there is a dept already exists >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDesig = await designation.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDesig) return helper.failed(res, variables.ValidationError, "Designation does not exists!");

      // Check if there is a dept with a name in a different id >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDesigWithName = await designation.findOne({
        where: {
          name: name,
          company_id: req.user.company_id,
          id: { [Op.ne]: id }, // Exclude the current record by id
        },
        transaction: dbTransaction,
      });
      if (existingDesigWithName) {
        return helper.failed(res, variables.ValidationError, "Desgination name already exists in different record!");
      }

      // check if the id has the same value in db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const alreadySameDesign = await designation.findOne({
        where: { id: id, name: name, company_id: req.user.company_id},
        transaction: dbTransaction,
      });
      if (alreadySameDesign) return helper.success(res, variables.Success, "Designation Re-Updated Successfully!");

      // update the designation if passes everything >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const [updatedRows] = await designation.update({
        name:name,
      }, {
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      if (updatedRows > 0) {
        // Commit the db enteries if passes everything >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Designation updated Successfully!");
      } else {
        // Revert the db enteries if error occurs >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, 0, null, "Unable to update the designation!");
      }
    } catch (error) {
      // Revert the db enteries if error occurs >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      if (dbTransaction) await dbTransaction.rollback();
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  //* API to Delete the designation from db
  deleteDept = async (req, res) => {
    const dbTransaction = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return helper.failed(res, variables.BadRequest, "Id is Required!");

      // Check if the designation exists in db or not >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const existingDesig = await designation.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (!existingDesig) return helper.failed(res, variables.NotFound, "Designation does not exists!");


      // Check if the desgination used in other tables from db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const isUsedInUsers = await User.findOne({ where: { designationId: id } });
      if(isUsedInUsers) 
        return helper.failed(res, variables.Unauthorized, "Cannot Delete this Designation as it is referred in other tables");


      // Delete the desgination from db >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      const deleteDesig = await designation.destroy({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (deleteDesig) {
        // Commits db enteries if passes everything >>>>>>>>>>>>>>>>>>>>>>>>>>>
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Designation deleted Successfully!");
      } else {
        // Rollback db entereis if error occurs >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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
