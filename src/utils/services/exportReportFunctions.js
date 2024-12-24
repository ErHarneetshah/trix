import department from "../../database/models/departmentModel.js";
import User from "../../database/models/userModel.js";
import sequelize from "../../database/queries/dbConnection.js";

export default {
  getUserInCompany: async (companyId) => {
    const users = await User.findAll({
      where: { company_id: companyId, isAdmin: 0 },
      attributes: ["id", "fullname"],
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    if (!users) return { status: false, message: "No user data found in your company" };

    return { status: true, message: "User's data retrived successfully", data: users };
  },

  getProdWebCount: async (userId) => {
    const query = `
            SELECT 
                uh.userId,
                SUM(CASE WHEN pw.website_name IS NOT NULL THEN 1 ELSE 0 END) AS productive_count,
                SUM(CASE WHEN pw.website_name IS NULL THEN 1 ELSE 0 END) AS non_productive_count
            FROM 
                user_histories uh
            LEFT JOIN 
                productive_websites pw
            ON 
                uh.website_name = pw.website_name
            WHERE 
                uh.userId = :userId
            GROUP BY 
                uh.userId
        `;

    const [results] = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  },

  getProdAppDetails: async (userId) => {
    const query = `SELECT 
                        userId,
                        appName,
                        is_productive,
                        SUM(TIMESTAMPDIFF(SECOND, startTime, endTime)) AS time_spent_seconds,
                        COUNT(*) AS session_count,
                        SUM(SUM(TIMESTAMPDIFF(SECOND, startTime, endTime))) OVER (PARTITION BY userId) AS total_time_spent_seconds,
                        MAX(TIMESTAMPDIFF(SECOND, startTime, endTime)) AS max_time_spent_seconds
                    FROM 
                        app_histories
                    WHERE 
                        userId = :userId
                    GROUP BY 
                        userId, appName, is_productive;`;

    const [results] = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT,
    });

    return results;
  },
};
