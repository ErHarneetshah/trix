import CValidator from "./customValidation.js";
import variables from "../../app/config/variableConfig.js";

class authValidationSchema {
  static registerValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        firstname: "required|regex:/^[a-zA-Z ]*$/|min:3|max:30",
        lastname: "required|regex:/^[a-zA-Z ]*$/|min:3|max:30",
        email: "required|email",
        mobile: "required|string",
        password: "required|password_regex|min:8",
        confirm_pass: "required|same:password",
        departmentId: "required",
        designationId: "required",
        roleId: "required",
        teamId: "required",
        country: "required",
      });

      if (!status) {
        return reply.failed(res, variables.ValidationError, message);
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return reply.failed(res, variables.InternalServerError, error.message);
    }
  };

  static loginValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        email: "required|email",
        password: "required|password_regex|min:8",
      });

      if (!status) {
        return reply.failed(res, variables.ValidationError, message);
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return reply.failed(res, variables.InternalServerError, error.message);
    }
  };
}

export default authValidationSchema;
