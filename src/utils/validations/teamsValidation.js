import CValidator from "./customValidation.js";
import variables from "../../app/config/variableConfig.js";
import helper from "../services/helper.js";

class teamsValidationSchema {
  static teamMemberValid = async (data, res) => {
    try {
      const { status, message } = await CValidator(data, {
        fullname: "required|regex:/^[a-zA-Z ]*$/|min:3|max:30",
        email: "required|email",
        password: "required|password_regex|min:8",
        departmentId: "required",
        designationId: "required",
        roleId: "required",
        teamId: "required",
      });

      console.log("Teams Validation -------------------------");
      console.log(status);
      if (!status) {
        return helper.sendResponse(
          res,
          variables.ValidationError,
          0,
          null,
          message
        );
      }

      return { status: true };
    } catch (error) {
      console.error("Validation error:", error);
      return helper.sendResponse(
        res,
        variables.InternalServerError,
        0,
        null,
        error.message
      );
    }
  };
}

export default teamsValidationSchema;
