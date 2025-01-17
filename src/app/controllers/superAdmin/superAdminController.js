import variables from "../../config/variableConfig.js";
import helper from "../../../utils/services/helper.js";

import User from "../../../database/models/userModel.js";
import company from "../../../database/models/company.js";

export default {
  //* ________-------- GET All Admins ---------______________
  getAllAdmins: async (req, res) => {
    try {
      const routeUrl = req.originalUrl;
      // ___________---------- Search, Limit, Pagination ----------_______________
      let { search, limit, page } = req.query;

      let searchable = [];
      limit = parseInt(limit) || 10;
      let offset = (page - 1) * limit || 0;
      page = parseInt(page) || 1;
      let where = await helper.searchCondition(search, searchable);
      where.isAdmin = 1;
      // ___________----------------------------------------------________________

      const allData = await User.findAndCountAll({
        where: where,
        offset: offset,
        limit: limit,
        order: [["id", "DESC"]],
        // attributes: ["id", "name", "parentDeptId"],
        include: [
          {
            model: company,
            // as: "company",
            // attributes: ["name"],
          },
        ],
      });
      if (!allData) return helper.failed(res, variables.NotFound, "Data Not Found");
      // Calculate total pages

      const totalPages = Math.ceil(allData.count / limit);

      let result = {
        status: true,
        status_text: "success",
        message: "Data Fetched Succesfully",
        totalPages,
        page,
        limit,
        data: allData.rows,
      };

      return res.status(200).json(result);
    } catch (error) {
      helper.logger(res, "Super Admin Controller -> getAllAdmins", error);
      return helper.failed(res, variables.BadRequest, error.message);
    }
  },
};
