import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import User from "../../../database/models/userModel.js";
import teamsValidationSchema from "../../../utils/validations/teamsValidation.js";
import department from "../../../database/models/departmentModel.js";
import designation from "../../../database/models/designationModel.js";
import role from "../../../database/models/roleModel.js";
import team from "../../../database/models/teamModel.js";
import { Op } from "sequelize";
import H from "../../../utils/Mail.js";
import bcrypt from "bcrypt";
import company from "../../../database/models/company.js";
import { ImageUpload } from "../../../database/models/ImageUpload.js";

class teamMemberController {
  getAllTeamMembers = async (req, res) => {
    try {
      // ___________-------- Role Permisisons Exists or not ---------________________
      const routeMethod = req.method;
      const isApproved = await helper.checkRolePermission(req.user.roleId, "Team Members", routeMethod, req.user.company_id);
      if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // ___________-------- Role Permisisons Exists or not ---------________________

      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit);
      let offset = (page - 1) * limit;
      let searchable = ["fullname", "email", "mobile", "country", "$department.name$", "$designation.name$", "$role.name$", "$team.name$"];
      let where = await helper.searchCondition(searchParam, searchable);
      where.isAdmin = 0;
      where.company_id = req.user.company_id;
      // ___________-----------------------------------------------_______________

      let alldata;

      if (parseInt(limit) > 0 && parseInt(offset) > 0) {
        alldata = await User.findAndCountAll({
          where: where,
          offset: offset,
          limit: limit,
          order: [["id", "DESC"]],
          attributes: {
            exclude: ["password", "isAdmin", "workstationId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: department,
              as: "department",
              attributes: ["name"],
            },
            {
              model: designation,
              as: "designation",
              attributes: ["name"],
            },
            {
              model: role,
              as: "role",
              attributes: ["name"],
            },
            {
              model: team,
              as: "team",
              attributes: ["name"],
            },
          ],
        });
      } else {
        alldata = await User.findAndCountAll({
          where: where,
          order: [["id", "DESC"]],
          attributes: {
            exclude: ["password", "isAdmin", "workstationId", "createdAt", "updatedAt"],
          },
          include: [
            {
              model: department,
              as: "department",
              attributes: ["name"],
            },
            {
              model: designation,
              as: "designation",
              attributes: ["name"],
            },
            {
              model: role,
              as: "role",
              attributes: ["name"],
            },
            {
              model: team,
              as: "team",
              attributes: ["name"],
            },
          ],
        });
      }

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");
      return helper.success(res, variables.Success, "Team Members fetched Successfully!", alldata);
    } catch (error) {
      //helper.logger(res, "Team Member Controller -> getAllTeamMembers", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getSpecificTeamMembers = async (req, res) => {
    try {
      let { id } = req.query;

      const alldata = await User.findOne({
        where: { id: id, company_id: req.user.company_id },
        attributes: {
          exclude: ["password", "isAdmin", "createdAt", "updatedAt", "status"],
        },
        include: [
          {
            model: department,
            as: "department",
            attributes: ["name"],
          },
          {
            model: designation,
            as: "designation",
            attributes: ["name"],
          },
          {
            model: role,
            as: "role",
            attributes: ["name"],
          },
          {
            model: team,
            as: "team",
            attributes: ["name"],
          },
        ],
      });

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");
      return helper.success(res, variables.Success, "Team Members fetched Successfully!", alldata);
    } catch (error) {
      //helper.logger(res, "Team Member Controller -> getSpecificTeamMembers", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  getMembersInTeam = async (req, res) => {
    try {
      let { id } = req.query;

      const alldata = await User.findAll({
        where: { teamId: id, company_id: req.user.company_id },
        attributes: ["id", "fullname"],
      });

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");
      return helper.success(res, variables.Success, "Team's Members fetched Successfully!", alldata);
    } catch (error) {
      //helper.logger(res, "Team Member Controller -> getMembersInTeam", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addTeamMembers = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Team Members", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;
      const validationResult = await teamsValidationSchema.teamMemberValid(requestData, res);
      if (!validationResult.status) return helper.failed(res, variables.BadRequest, validationResult.message);

      //* Confirming whether you can add new employee based on employee
      let companyDetails = await company.findOne({ where: { id: req.user.company_id } });
      if (companyDetails.employeeCount >= companyDetails.planEmployeeCount) {
        return helper.failed(res, variables.BadRequest, "Upgrade Plan To Add New Employees");
      }

      const existsDept = await department.findOne({
        where: { id: requestData.departmentId, company_id: req.user.company_id },
      });
      if (!existsDept) return helper.failed(res, variables.BadRequest, "Department Does Not Exists");

      const existsDesig = await designation.findOne({
        where: { id: requestData.designationId, company_id: req.user.company_id },
      });
      if (!existsDesig) return helper.failed(res, variables.BadRequest, "Designation Does Not Exists");

      const existsRole = await role.findOne({
        where: { id: requestData.roleId, company_id: req.user.company_id },
      });
      if (!existsRole) return helper.failed(res, variables.BadRequest, "Role Does Not Exists");

      const existsTeam = await team.findOne({
        where: { id: requestData.teamId, company_id: req.user.company_id },
      });
      if (!existsTeam) return helper.failed(res, variables.BadRequest, "Team Does Not Exists");

      const existsTeamInDept = await team.findOne({
        where: { id: requestData.teamId, departmentId: requestData.departmentId, company_id: req.user.company_id },
      });
      if (!existsTeamInDept) return helper.failed(res, variables.BadRequest, "Team Does Not Exists in Department");

      // Check if the user already exists
      const existingUser = await User.findOne({
        where: { email: requestData.email, company_id: req.user.company_id },
        transaction: dbTransaction,
      });
      if (existingUser) {
        return helper.failed(res, variables.BadRequest, "User already exists with this mail!");
      }

      const existingAnyUser = await User.findOne({
        where: { email: requestData.email },
        transaction: dbTransaction,
      });
      if (existingAnyUser) {
        return helper.failed(res, variables.BadRequest, "Mail already exists by others in system!");
      }

      const plainTextPassword = await helper.generatePass();
      const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

      const companyPrefix = await company.findOne({ where: { id: req.user.company_id } });
      const newEmployeeCount = parseInt(companyPrefix.employeeCount) + 1;

      requestData.empId = `${companyPrefix.companyEmpPrefix}-${newEmployeeCount}`;
      requestData.password = hashedPassword;
      requestData.screen_capture_time = 60;
      requestData.app_capture_time = 60;
      requestData.broswer_capture_time = 60;
      requestData.company_id = req.user.company_id;

      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      const updateEmpCount = await company.update(
        { employeeCount: Number(newEmployeeCount) },
        {
          where: {
            id: req.user.company_id,
          },
          transaction: dbTransaction,
        }
      );

      if (teamMember) {
        const textMessage = `Hello ${teamMember.fullname},\n\nYour account has been created successfully!\n\nHere are your login details:\n\nUsername: ${teamMember.fullname}\nEmail: ${teamMember.email}\nPassword: ${plainTextPassword}\n\nPlease log in to the application with these credentials.\n\nBest regards`;

        const subject = "Emonitrix-Your Credentials";
        const sendmail = await H.sendM(req.user.company_id, requestData.email, subject, textMessage);

        if (!sendmail.success) {
          await dbTransaction.rollback();
          return helper.failed(res, variables.BadRequest, "Please Set the Email Credentials First");
        }
        await dbTransaction.commit();
        return helper.success(res, variables.Success, "Team Member Added Successfully", {
          note: "This response is just for testing purposes for now",
          requestData: requestData,
          addedMember: teamMember,
        });
      } else {
        if (dbTransaction) await dbTransaction.rollback();
        return helper.failed(res, variables.UnknownError, "Unable to add user for now");
      }
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Team Member Controller -> addTeamMembers", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateTeamMembers = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "Team Members", routeMethod, req.user.company_id);
    if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const { id, ...updateFields } = req.body;
      if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Id is required and in numbers");
      const existingTeamMember = await User.findOne({
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
      });

      if (!existingTeamMember) return helper.failed(res, variables.BadRequest, "User does not exists in company data");
      // if (existingTeamMember.isAdmin) return helper.failed(res, variables.BadRequest, "You are not authorized to made this change");

      // Remove the 'password' field if it exists in updateFields
      if (updateFields.hasOwnProperty("password")) {
        delete updateFields.password;
      }

      if (updateFields.email) {
        const existingTeamMemberWithEmail = await User.findOne({
          where: { email: updateFields.email },
          transaction: dbTransaction,
        });

        if (existingTeamMemberWithEmail && id != existingTeamMemberWithEmail.id) {
          if (existingTeamMemberWithEmail) return helper.failed(res, variables.BadRequest, "Email is already used in system");
        }
      }

      if (updateFields.departmentId) {
        const existsDept = await department.findOne({
          where: { id: updateFields.departmentId, company_id: req.user.company_id },
        });
        if (!existsDept) return helper.failed(res, variables.BadRequest, "Department Does Not Exists");
      }

      if (updateFields.roleId) {
        const existsRole = await role.findOne({
          where: { id: updateFields.roleId, company_id: req.user.company_id },
        });
        if (!existsRole) return helper.failed(res, variables.BadRequest, "Role Does Not Exists");
      }

      if (updateFields.teamId) {
        const existsTeam = await team.findOne({
          where: { id: updateFields.teamId, company_id: req.user.company_id },
        });
        if (!existsTeam) return helper.failed(res, variables.BadRequest, "Team Does Not Exists");
      }

      if (updateFields.teamId && updateFields.departmentId) {
        const existsTeamInDept = await team.findOne({
          where: { id: updateFields.teamId, departmentId: updateFields.departmentId, company_id: req.user.company_id },
        });
        if (!existsTeamInDept) return helper.failed(res, variables.BadRequest, "Team Does Not Exists in Department");
      }

      // Perform the update operation
      await User.update(updateFields, {
        where: { id: id, company_id: req.user.company_id },
        transaction: dbTransaction,
        individualHooks: true,
      });

      await dbTransaction.commit();
      return helper.success(res, variables.Success, "User Updated Successfully");
    } catch (error) {
      if (dbTransaction) await dbTransaction.rollback();
      //helper.logger(res, "Team Member Controller -> updateTeamMembers", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateSettings = async (req, res) => {
    try {
      // // ___________-------- Role Permisisons Exists or not ---------________________
      // const routeMethod = req.method;
      // const isApproved = await helper.checkRolePermission(req.user.roleId, "Settings", routeMethod, req.user.company_id);
      // if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
      // // ___________-------- Role Permisisons Exists or not ---------________________

      let { id, screen_capture_time, broswer_capture_time, app_capture_time, screen_capture, broswer_capture, app_capture } = req.body;

      if (!id || isNaN(id)) {
        return helper.failed(res, variables.ValidationError, "ID is Required and in numbers");
      }

      const normalizeBoolean = (value) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
      };

      screen_capture = normalizeBoolean(screen_capture);
      broswer_capture = normalizeBoolean(broswer_capture);
      app_capture = normalizeBoolean(app_capture);

      const validations = [
        {
          key: "screen_capture",
          value: screen_capture,
          validValues: [0, 1, true, false],
        },
        {
          key: "broswer_capture",
          value: broswer_capture,
          validValues: [0, 1, true, false],
        },
        {
          key: "app_capture",
          value: app_capture,
          validValues: [0, 1, true, false],
        },
        {
          key: "screen_capture_time",
          value: screen_capture_time,
          minValue: 30,
        },
        {
          key: "broswer_capture_time",
          value: broswer_capture_time,
          minValue: 30,
        },
        { key: "app_capture_time", value: app_capture_time, minValue: 30 },
      ];

      for (const validation of validations) {
        if (validation.validValues && !validation.validValues.includes(validation.value)) {
          return helper.failed(res, variables.BadRequest, `Invalid value for ${validation.key}. Allowed values are: ${validation.validValues.join(", ")}.`);
        }
        if (validation.minValue && validation.value < validation.minValue) {
          return helper.failed(res, variables.BadRequest, `${validation.key} must be at least ${validation.minValue}.`);
        }
      }
      const u = await User.findOne({ where: { id: id } });

      if (!u) {
        return helper.sendResponse(res, variables.NotFound, 0, null, "user not found");
      }

      await u.update(
        {
          screen_capture_time,
          broswer_capture_time,
          app_capture_time,
          screen_capture,
          broswer_capture,
          app_capture,
        },
        { where: { id: u?.id } }
      );
      return helper.sendResponse(res, variables.Success, 1, {}, "Settings Updated Successfully");
    } catch (error) {
      console.error("Error updating settings:", error.message);
      //helper.logger(res, "Team Member Controller -> updateSettings", error);
      return helper.failed(res, variables.BadRequest, "Failed to update settings");
    }
  };

  getTeamlist = async (req, res) => {
    try {
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      // ___________-----------------------------------------------_______________

      let data = await User.findAndCountAll({
        where: {
          [Op.or]: [{ departmentId: req.user.departmentId }, { teamId: req.user.teamId }],
          company_id: req.user.company_id,
        },
        offset: offset,
        limit: limit,
        attributes: ["id", "fullname"],
        include: [
          {
            model: designation,
            as: "designation",
            attributes: ["name"],
          },
        ],
      });
      return helper.sendResponse(res, variables.Success, 1, data, "Team List Fetched Successfully");
    } catch (error) {
      console.error("Error getTeamMember:", error.message);
      //helper.logger(res, "Team Member Controller -> getTeamList", error);
      return helper.failed(res, variables.BadRequest, "Failed to getTeamMember");
    }
  };

  generateNewPassword = async (req, res) => {
    try {
      let { userId } = req.body;

      if (!userId || isNaN(userId)) return helper.failed(res, variables.ValidationError, "Id is required and in number");
      // CHECK THIS ID EXITS IN THE USERS TABLE

      let isUserExists = await User.findOne({
        where: {
          id: userId,
          company_id: req.user.company_id,
        },
      });

      if (!isUserExists) {
        return helper.failed(res, variables.NotFound, "This user does not exist in our records.");
      }

      const plainTextPassword = await helper.generatePass();
      const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

      // update the user password in users table
      await User.update({ password: hashedPassword }, { where: { id: userId, company_id: req.user.company_id } });

      // after updating the password now send the email

      const textMessage = `Hello ${isUserExists.fullname},\n\nYour new password generated successfully!\n\nHere are your login details:\nEmail: ${isUserExists.email}\nPassword: ${plainTextPassword}\n\nPlease log in to the application with these credentials.\n\nBest regards`;

      const subject = "Emonitrix-Generate New Password";
      const sendmail = await H.sendM(isUserExists.company_id, isUserExists.email, subject, textMessage);

      if (!sendmail.success) {
        return helper.failed(res, variables.BadRequest, "Failed to send Email");
      }

      return helper.success(res, variables.Success, "New Password Generated Successfully.Please check your Email.");
    } catch (error) {
      console.error("Error generateNewPassword:", error.message);
      //helper.logger(res, "Team Member Controller -> generateNewPassword", error);
      return helper.failed(res, variables.BadRequest, "Failed to generateNewPassword");
    }
  };

  deactivateActivateTeamMember = async (req, res) => {
    try {
      let { userId } = req.body;

      if (!userId || isNaN(userId)) return helper.failed(res, variables.ValidationError, "Id is required and in number");
      // CHECK THIS ID EXITS IN THE USERS TABLE

      let isUserExists = await User.findOne({
        where: {
          id: userId,
          company_id: req.user.company_id,
        },
      });

      if (!isUserExists) {
        return helper.failed(res, variables.NotFound, "User does not exist in our records.");
      }

      if (isUserExists.isAdmin) {
        return helper.failed(res, variables.NotFound, "User cannot be deactivated");
      }

      let status = isUserExists.status == 1 ? 0 : 1;
      let message = isUserExists.status == 1 ? "User Deactivated Successfully" : "User Activated Successfully";

      await User.update({ status: status }, { where: { id: userId, company_id: req.user.company_id } });
      return helper.success(res, variables.Success, message);
    } catch (error) {
      console.error("Error deactivateActivateTeamMember:", error.message);
      //helper.logger(res, "Team Member Controller -> deactivateActivateTeamMember", error);
      return helper.failed(res, variables.BadRequest, "Failed to Update User Status");
    }
  };

  getUserScreenshots = async (req, res) => {
    try {
      const { id } = req.body;
      let user = await User.findOne({
        where: { id: id },
      });

      if (!user) {
        return socket.emit("error", {
          message: "User not found",
        });
      }

      // if (!date || date.trim() === "") {
      //   const currentDate = new Date();
      //   date = currentDate.toISOString().split("T")[0];
      // }

      let { limit, page } = req.query;
      limit = parseInt(limit) || 4;
      let offset = (page - 1) * limit || 0;
      let where = {};
      where.company_id = req.user.company_id;
      where.userId = id;
      // where.date = date;
      // ___________----------------------------------------------________________

      const data = await ImageUpload.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        attributes: ["content"],
      });
      if (!data) data = null;

      return helper.success(res, variables.Success, "User Screenshots fetched successfully", data);
    } catch (error) {
      console.log("Error in User Screenshot Team Member Controller: ", error);
      return helper.failed(res, variables.BadRequest, "Unable to retrieve User's Screenshot");
    }
  };

  setBucketstorePath = async (req, res) => {
    const dbTransaction = await sequelize.transaction(); 
    try {
      const bucketStorePrefix = await company.findAll({
        attributes: ["id", "bucketStorePath"],
        transaction: dbTransaction,
      });
  
      const usersNames = await User.findAll({
        attributes: ["id", "company_id", "fullname"],
      });
  
      usersNames.forEach((element) => {
        bucketStorePrefix.forEach(async (element2) => {
          let alterName = element.fullname.toLowerCase().replace(/\s+/g, "_");
          if (element.company_id == element2.id) {
            let newPath = element2.bucketStorePath + "/images/" + alterName + "_" + element.id;
            console.log(newPath);
            await User.update(
              {
                image_storage_path: newPath,
              },
              {
                where: { id: element.id },
              }
            );
          }
        });
      });
      
      // await dbTransaction.commit();
      return helper.success(res, variables.Success, "Task Completed", bucketStorePath);
    } catch (error) {
      // if(dbTransaction) await dbTransaction.rollback();
      return helper.success(res, variables.Failed, error.message);
    }
  };
}

export default teamMemberController;
