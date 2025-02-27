import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import { Op, Sequelize } from "sequelize";
import sequelize from "../../../database/queries/dbConnection.js";
import TimeLog from "../../../database/models/timeLogsModel.js";

//* Route Function
const getCompareReportsData = async (req, res, next) => {
  // ___________-------- Role Permisisons Exists or not ---------________________
  const routeMethod = req.method;
  const isApproved = await helper.checkRolePermission(req.user.roleId, "Compare Reports", routeMethod, req.user.company_id);
  if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
  // ___________-------- Role Permisisons Exists or not ---------________________

  try {
    const { company_id, createdAt, departmentId } = req.user;
    const { userId, date } = req.query;
    if (!date || isNaN(new Date(date)) || isNaN(new Date(createdAt))) {
      throw new Error("Invalid date or user joining date.");
    }

    const formattedDate = new Date(date).toISOString().split("T")[0];
    const joiningDate = new Date(createdAt).toISOString().split("T")[0];

    if (formattedDate < joiningDate) {
      throw new Error("User was not part of the organization on this date.");
    }

    const startOfDay = new Date(formattedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(formattedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const userLogging = await TimeLog.findOne({
      where: {
        user_id: userId,
        company_id: company_id,
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay,
        },
      },
    });

    if (!userLogging) {
      throw new Error("User was absent on this date or the entered date is invalid.");
    }

    const replacements = {
      departmentId: departmentId,
      companyId: company_id,
      userId: userId,
      createdAt: formattedDate,
    };

    const queries = [
      {
        query: `
                        SELECT ah.appName, 
                            SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
                        FROM app_histories AS ah
                        INNER JOIN productive_apps AS ap ON ap.app_name = ah.appName and ap.department_id=:departmentId
                        WHERE DATE(ah.createdAt) = :createdAt 
                        AND ah.company_id = :companyId 
                        AND ah.userId = :userId
                        GROUP BY ah.appName;
                `,
        key: "productiveApps",
      },
      {
        query: `
                    SELECT ah.appName, 
                        SUM(TIMESTAMPDIFF(MINUTE, ah.startTime, ah.endTime)) AS total_time_minutes
                    FROM app_histories AS ah
                    WHERE ah.appName NOT IN (
                        SELECT app_name FROM productive_apps WHERE company_id = :companyId and department_id=:departmentId
                    )
                    AND ah.company_id = :companyId 
                    AND ah.userId = :userId 
                    AND DATE(ah.createdAt) = :createdAt
                    GROUP BY ah.appName;
                `,
        key: "nonProductiveApps",
      },
      {
        query: `
                    SELECT COALESCE(COUNT(uh.id), 0) AS total_counts, uh.website_name 
                    FROM user_histories AS uh
                    INNER JOIN productive_websites AS pw 
                    ON uh.website_name = pw.website_name  and pw.department_id=:departmentId
                    WHERE uh.company_id = :companyId 
                    AND uh.userId = :userId 
                    AND DATE(uh.createdAt) = :createdAt
                    GROUP BY uh.website_name;
                `,
        key: "productiveWebsites",
      },
      {
        query: `
                    SELECT COUNT(uh.id) AS total_counts, uh.website_name 
                    FROM user_histories AS uh
                    WHERE uh.website_name NOT IN (
                        SELECT website_name 
                        FROM productive_websites 
                        WHERE company_id = :companyId and department_id=:departmentId
                    )
                    AND uh.company_id = :companyId 
                    AND uh.userId = :userId 
                    AND DATE(uh.createdAt) = :createdAt
                    GROUP BY uh.website_name;
                `,
        key: "nonProductiveWebsites",
      },
    ];

    const queryPromises = queries.map(({ query, key }) => sequelize.query(query, { type: Sequelize.QueryTypes.SELECT, replacements }).then((result) => ({ [key]: result })));

    const results = await Promise.all(queryPromises);

    const combinedResult = results.reduce((acc, result) => {
      return { ...acc, ...result };
    }, {});

    const offlineTime = userLogging.idle_time;
    const loggedInTime = userLogging.logged_in_time;
    const timeAtWork = await getActiveTime(userLogging.id);

    combinedResult.offlineTime = offlineTime;
    combinedResult.loggedInTime = loggedInTime;
    combinedResult.timeAtWork = timeAtWork;

    combinedResult.effectiveness = calculateEffectiveness(timeAtWork, offlineTime);

    // return res.json(combinedResult);
    return helper.success(res, variables.Success, "Compare Report Data Fetched Successfully", combinedResult);
  } catch (error) {
    console.error(error.message);
    //helper.logger(res, "Compart Reports Controller -> getCompareReportsData", error);
    return helper.failed(res, 400, error.message);
  }
};

const calculateEffectiveness = (timeAtWork, offlineTime) => {
  try {
    const totalTime = timeAtWork + offlineTime;
    return totalTime ? (timeAtWork / totalTime) * 100 : 0;
  } catch (error) {
    //helper.logger(res, "Compart Reports Controller -> calculateEffectiveness", error);
  }
};

const getActiveTime = async (timelogId) => {
  try {
    const userLogging = await TimeLog.findOne({
      where: {
        id: timelogId,
      },
    });

    if (!userLogging) {
      return 0;
    }

    if (userLogging.active_time) {
      return userLogging.active_time;
    } else {
      const time1 = userLogging.logged_in_time;
      const time2 = userLogging.logged_out_time;

      if (!time1 || !time2) {
        return 0;
      }

      const toMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      let diffMinutes = toMinutes(time2) - toMinutes(time1);

      if (diffMinutes < 0) {
        diffMinutes += 24 * 60;
      }

      return diffMinutes;
    }
  } catch (error) {
    console.error(error);
    //helper.logger(res, "Compart Reports Controller -> getActiveTime", error);
    return 0; // Return 0 in case of an error
  }
};

//* Route Function
const getAllUsers = async (req, res, next) => {
  // ___________-------- Role Permisisons Exists or not ---------________________
  const routeMethod = req.method;
  const isApproved = await helper.checkRolePermission(req.user.roleId, "Compare Reports ", routeMethod, req.user.company_id);
  if (!isApproved.success) return helper.failed(res, variables.Forbidden, isApproved.message);
  // ___________-------- Role Permisisons Exists or not ---------________________

  try {
    const { company_id } = req.user;
    const query = `SELECT u.id,u.fullname,d.name FROM users as u left join departments as d on u.departmentId=d.id where u.company_id=:companyId and  u.status=1 and u.isAdmin=0;`;
    const result = await sequelize.query(query, {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { companyId: company_id },
    });

    // const transformedResult = result.map(item => `${item.fullname}-${item.name}-${item.id}`);
    return helper.success(res, variables.Success, "All Users Fetched Successfully", result);
  } catch (error) {
    //helper.logger(res, "Compart Reports Controller -> getAllUsers", error);
    return helper.failed(res, variables.badGateway, error.message);
  }
};

export default { getCompareReportsData, getAllUsers };
