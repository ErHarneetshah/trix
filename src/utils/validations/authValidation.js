import CValidator from "./customValidation.js";
import variables from "../../app/config/variableConfig.js";
import helper from "../services/helper.js";

class authValidationSchema {
  static companyRegisterValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        name: "required|string",
        companyName: "required|min:3|max:50|string",
        email: "required|email",
        password: "required|password_regex|min:8",
        confirmPassword: "required|same:password",
        employeeNumber: "required|numeric",
        mobile: "required|numeric|digits:10"
      });
   
      if (!status) {
        return {status:false, message:message};
      }

      return {status: true};
    } catch (error) {
      console.error("Validation error:", error);
      return helper.failed(res, variables.InternalServerError, error.message);
    }
  };

  static registerValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        fullname: "required|regex:/^[a-zA-Z ]*$/|min:3|max:50",
        email: "required|email",
        password: "required|password_regex|min:8",
        departmentId: "required",
        designationId: "required",
        roleId: "required",
        teamId: "required",
        isAdmin: "required",
      });

      if (!status) {
        return helper.failed(res, variables.ValidationError, message);
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return helper.failed(res, variables.InternalServerError, error.message);
    }
  };

  static loginValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        email: "required|email",
        password: "required",
      });

      if (!status) {
        return {status:false, message: message};
      }

      return {status:true};
    } catch (error) {
      console.error("Validation error:", error);
      return helper.failed(res, variables.InternalServerError, error.message);
    }
  };
}

export default authValidationSchema;
