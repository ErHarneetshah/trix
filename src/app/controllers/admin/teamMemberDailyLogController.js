import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import teamMemberDailyLog from "../../../database/models/teamMemberDailyLogModel.js";

class teamMemberController {
  getAllTeamMemberDailyLog = async (req, res) => {
    try {
      const alldata = await teamMemberDailyLog.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude the password field
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    }catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  }
}

export default teamMemberController;
