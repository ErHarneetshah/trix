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

class teamMemberController {
  getAllTeamMembers = async (req, res) => {
    try {
      // ___________-------- Role Permisisons Exists or not ---------________________
      const routeMethod = req.method;
      const isApproved = await helper.checkRolePermission(req.user.roleId, "teamMembers", routeMethod, req.user.company_id);
      if (!isApproved) return helper.failed(res, variables.Forbidden, isApproved.message);
      // ___________-------- Role Permisisons Exists or not ---------________________

      // ___________---------- Search, Limit, Pagination ----------_______________
      let { searchParam, limit, page } = req.query;
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      let searchable = ["fullname", "email", "mobile", "country", "$department.name$", "$designation.name$", "$role.name$", "$team.name$"];
      let where = await helper.searchCondition(searchParam, searchable);
      where.isAdmin = 0;
      where.company_id = req.user.company_id;
      // ___________-----------------------------------------------_______________

      const alldata = await User.findAndCountAll({
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

      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");
      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
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
      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
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
      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  addTeamMembers = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "teamMembers", routeMethod, req.user.company_id);
    if (!isApproved) return helper.failed(res, variables.Forbidden, isApproved.message);
    // ___________-------- Role Permisisons Exists or not ---------________________

    const dbTransaction = await sequelize.transaction();
    try {
      const requestData = req.body;
      //console.log(requestData.departmentId, requestData.designationId, requestData.teamId, requestData.roleId)
      // Validating request body
      const validationResult = await teamsValidationSchema.teamMemberValid(requestData, res);
      if (!validationResult.status) return helper.failed(res, variables.BadRequest, validationResult.message);

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

      const existingAnyUser = await User.findOne({
        where: { email: requestData.email },
        transaction: dbTransaction,
      });
      if (existingUser) {
        return helper.failed(res, variables.BadRequest, "This mail already exists in emonitrix system!");
      }

      if (existingUser) {
        return helper.failed(res, variables.BadRequest, "User already exists with this mail!");
      }

      const plainTextPassword = await helper.generatePass();
      const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

      requestData.password = hashedPassword;
      requestData.screen_capture_time = 60;
      requestData.app_capture_time = 60;
      requestData.broswer_capture_time = 60;
      requestData.company_id = req.user.company_id;

      const teamMember = await User.create(requestData, {
        transaction: dbTransaction,
      });

      if (teamMember) {
        const textMessage = `Hello ${teamMember.fullname},\n\nYour account has been created successfully!\n\nHere are your login details:\n\nUsername: ${teamMember.fullname}\nEmail: ${teamMember.email}\nPassword: ${plainTextPassword}\n\nPlease log in to the application with these credentials.\n\nBest regards`;

        const subject = "Emonitrix-Your Credentials";
        const sendmail = await H.sendM(requestData.email, subject, textMessage);

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
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateTeamMembers = async (req, res) => {
    // ___________-------- Role Permisisons Exists or not ---------________________
    const routeMethod = req.method;
    const isApproved = await helper.checkRolePermission(req.user.roleId, "teamMembers", routeMethod, req.user.company_id);
    if (!isApproved) return helper.failed(res, variables.Forbidden, isApproved.message);
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

        if (id != existingTeamMemberWithEmail.id) {
          if (existingTeamMemberWithEmail) return helper.failed(res, variables.BadRequest, "Email is already used in system");
        }
      }

      const existsDept = await department.findOne({
        where: { id: updateFields.departmentId, company_id: req.user.company_id },
      });
      if (!existsDept) return helper.failed(res, variables.BadRequest, "Department Does Not Exists");

      // const existsDesig = await designation.findOne({
      //   where: {id: updateFields.designationId, company_id: req.user.company_id}
      // })
      // if(!existsDesig) return helper.failed(res, variables.BadRequest, "Designation Does Not Exists");

      const existsRole = await role.findOne({
        where: { id: updateFields.roleId, company_id: req.user.company_id },
      });
      if (!existsRole) return helper.failed(res, variables.BadRequest, "Role Does Not Exists");

      const existsTeam = await team.findOne({
        where: { id: updateFields.teamId, company_id: req.user.company_id },
      });
      if (!existsTeam) return helper.failed(res, variables.BadRequest, "Team Does Not Exists");

      const existsTeamInDept = await team.findOne({
        where: { id: updateFields.teamId, departmentId: updateFields.departmentId, company_id: req.user.company_id },
      });
      if (!existsTeamInDept) return helper.failed(res, variables.BadRequest, "Team Does Not Exists in Department");

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
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };

  updateSettings = async (req, res) => {
    try {
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
      return helper.failed(res, variables.Failure, "Failed to update settings");
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
      return helper.failed(res, variables.Failure, "Failed to getTeamMember");
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
      const sendmail = await H.sendM(isUserExists.email, subject, textMessage);

      if (!sendmail.success) {
        return helper.failed(res, variables.BadRequest, "Failed to send Email");
      }

      return helper.success(res, variables.Success, "New Password Generated Successfully.Please check your Email.");
    } catch (error) {
      console.error("Error generateNewPassword:", error.message);
      return helper.failed(res, variables.Failure, "Failed to generateNewPassword");
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
        return helper.failed(res, variables.NotFound, "This user does not exist in our records.");
      }

      if (isUserExists.isAdmin) {
        return helper.failed(res, variables.NotFound, "This User cannot be deactivated");
      }

      let status = isUserExists.status == 1 ? 0 : 1;
      let message = isUserExists.status == 1 ? "This user deactivated successfully" : "This user activated successfully";

      await User.update({ status: status }, { where: { id: userId, company_id: req.user.company_id } });
      return helper.success(res, variables.Success, message);
    } catch (error) {
      console.error("Error deactivateActivateTeamMember:", error.message);
      return helper.failed(res, variables.Failure, "Failed to deactivateActivateTeamMember");
    }
  };
}

export default teamMemberController;
