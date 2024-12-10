import CValidator from "./customValidation.js";
import variables from "../../app/config/variableConfig.js";
import helper from "../services/helper.js";

class teamsValidationSchema {
  static teamMemberValid = async (data, res) => {
    try {

      delete data.isAdmin;
      const { status, message } = await CValidator(data, {
        fullname: "required|regex:/^[a-zA-Z ]*$/|min:3|max:30",
        email: "required|email",
        departmentId: "required",
        designationId: "required",
        roleId: "required",
        teamId: "required",
      });

      console.log("Team Member Validation -------------------------");
      console.log(status);
      if (!status) {
        return helper.failed(res, variables.ValidationError, message);
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return helper.failed(res, variables.InternalServerError, error.message);
    }
  };

  static shiftValid = async (data, res) => {
    try {
      console.log("Shift Validation -------------------------");
      const { status, message } = await CValidator(data, {
        name: "required|string",
        start_time: `required|string`,
        end_time: `required|string`,
        days: "required|array",
        "days.*": "required|string|in:Mon,Tue,Wed,Thu,Fri,Sat,Sun",
      });

      console.log(status);
      if (!status) {
        return helper.failed(res, variables.ValidationError, message);
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return helper.failed(res, variables.InternalServerError, error.message);
    }
  };

  static teamsValid = async (data, res) => {
    try {
      console.log("Teams Validation -------------------------");
      const { status, message } = await CValidator(data, {
        name: "required|string",
        departmentId: "required",
        shiftId: "required"
      });

      console.log(status);
      if (!status) {
        return helper.failed(res, variables.ValidationError, message);
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return helper.failed(res, variables.InternalServerError, error.message);
    }
  };
}

export default teamsValidationSchema;
