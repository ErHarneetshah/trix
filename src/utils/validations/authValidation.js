import CValidator from "./customValidation.js";
import variables from "../../app/config/variableConfig.js";
import helper from "../services/helper.js";

class authValidationSchema {
  static companyRegisterValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        name: "required|regex:/^[a-zA-Z]*$/",
        email: "required|email",
        password: "required|min:8|max:50",
        confirmPassword: "required|same:password",
        employeeNumber: "required|numeric",
        mobile: "required|numeric|digits:10"
        // companyName: "required|regex:/^[a-zA-Z ]*$/|min:3|max:50",
        // companyAddress: "required|string|min:10",
      });
   
      if (!status) {
        return {status:false, message:message};
      }

      return {status: true};
    } catch (error) {
      console.error("Validation error:", error.message);
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

      // console.log("Register Validation -------------------------");
      // console.log(status);
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
        // console.log("Login Validation Error");
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
