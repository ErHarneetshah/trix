import sequelize from "../../../database/queries/dbConnection.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import TimeLog from "../../../database/models/teamLogsModel.js";
import { group } from "console";

class teamMemberTimeLogController {
  getAllTeamMemberLog = async (req, res) => {
    try {
      const query = `SELECT * FROM timelogs group by user_id`;
      const alldata = await workReports.sequelize.query(query, {
        type: workReports.sequelize.QueryTypes.SELECT,
      });
      if (!alldata) return helper.failed(res, variables.NotFound, "No Data is available!");

      return helper.success(res, variables.Success, "All Data fetched Successfully!", alldata);
    } catch (error) {
      return helper.failed(res, variables.BadRequest, error.message);
    }
  };
}

export default teamMemberTimeLogController;
