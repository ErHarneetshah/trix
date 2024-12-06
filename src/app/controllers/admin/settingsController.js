import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import blockedWebsites from "../../../database/models/blockedWebsitesModel.js";
import appInfo from "../../../database/models/productiveAppsModel.js";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import department from "../../../database/models/departmentModel.js";

const getAdminDetails = async (req, res) => {
  try {
    const alldata = await User.findOne({
      where: { isAdmin: 1 },
      attributes: ["fullname", "email", "mobile"] ,
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    return helper.success(res, variables.Success, "Retrieved Admin Profile Details Successfully.", alldata);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const updateAdminDetails = async (req, res) => {
  try {
    const { firstname, lastname, email, mobile } = req.body;
    if (!firstname || !lastname || !email || !mobile) {
      return helper.failed(res, variables.BadRequest, "All fields (firstname, lastname, email, mobile) are required");
    }
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return helper.failed(res, variables.BadRequest, "User not exists");
    }
    await User.update({ firstname, lastname, email, mobile }, { where: { id: req.params.id } });
    return helper.success(res, variables.Success, { message: "Admin Profile Updated Successfully" });
  } catch (error) {
    console.error("Error updating admin details:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const addBlockWebsites = async (req, res) => {
  try {
    const { Department_id, Sites } = req.body;
    if (!Department_id || !Sites) {
      return helper.failed(res, variables.ValidationError, "Department_id and Sites are required");
    }
    // // Optionally, validate the URL format
    // const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    // if (!urlPattern.test(Sites)) {
    //     return responseUtils.errorResponse(res, "Invalid URL format for Sites.", 400);
    // }
    const existingWebsite = await blockedWebsites.findOne({
      where: { Sites },
    });
    if (existingWebsite) {
      return helper.failed(res, variables.ValidationError, "Website is already blocked");
    }
    const newBlockedWebsite = await blockedWebsites.create({
      Department_id,
      Sites,
    });
    return helper.success(res, variables.Success, "Website Blocked successfully", newBlockedWebsite);
  } catch (error) {
    console.error("Error blocking website:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getBlockedWebsites = async (req, res) => {
  try {
    console.log("-------------------------------------");
    const getBlockedSites = await blockedWebsites.findAll({
      where: {
        Status: {
          [Op.ne]: 0,
        },
      },
      attributes: ["id", "Sites", "status"],
    });
    return helper.success(res, variables.Success, "Website Blocked successfully", getBlockedSites);
  } catch (error) {
    console.error("Error blocking website:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const updateSitesStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || status === undefined) {
      return helper.failed(res, variables.ValidationError, "ID and Status are required");
    }
    if (status !== 0 && status !== 1) {
      return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
    }
    const [updatedRows] = await blockedWebsites.update({ Status: status }, { where: { id: id } });

    if (updatedRows === 0) {
      return helper.failed(res, variables.NotFound, "Site not found or status not changed");
    }
    return helper.success(res, variables.Success, "Site status updated successfully", updatedRows);
  } catch (error) {
    console.error("Error updating site status:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const addProductiveNonProductiveApps = async (req, res) => {
  try {
    const { department_id, app_logo, appname, website_url, is_productive } = req.body;
    if (!department_id || !app_logo || !appname || !website_url || is_productive === undefined) {
      return helper.failed(res, variables.ValidationError, "All fields (department_id, app_logo, appname, website_url, is_productive) are required");
    }
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(website_url)) {
      return helper.failed(res, variables.ValidationError, "Invalid URL format for website_url.");
    }

    const newAppInfo = await appInfo.create({ department_id, app_logo, appname, website_url, is_productive });
    return helper.success(res, variables.Success, "App added Successfully", newAppInfo);
  } catch (error) {
    console.error("Error creating app info:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getAppInfo = async (req, res) => {
  try {
    const productiveApps = await appInfo.findAll({
      where: { is_productive: 1 },
      attributes: ["appname", "app_logo"],
    });

    const nonProductiveApps = await appInfo.findAll({
      where: { is_productive: 0 },
      attributes: ["appname", "app_logo"],
    });

    return helper.success(res, variables.Success, "Apps retrieved successfully", { productiveApps: productiveApps, nonProductiveApps: nonProductiveApps });
  } catch (error) {
    console.error("Error fetching app info:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const updateReportSettings = async (req, res) => {
  try {
    const differentReportStatus = await reportSettings.findByPk(req.params.id);
    if (!differentReportStatus) {
      return helper.failed(res, variables.ValidationError, "Somethong Went Wrong");
    }

    const { status } = req.body;
    if (status === undefined) {
      return helper.failed(res, variables.ValidationError, "Status is required");
    }
    if (status !== 0 && status !== 1) {
      return helper.failed(res, variables.ValidationError, "Status must be either 0 or 1");
    }

    const [updateReportStatus] = await reportSettings.update({ is_active: status }, { where: { id: req.params.id } });
    return helper.success(res, variables.Success, "Report Status Updated Successfully", updateReportStatus);
  } catch (error) {
    console.error("Error fetching app info:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

export default { getAdminDetails, updateAdminDetails, addBlockWebsites, getBlockedWebsites, updateSitesStatus, addProductiveNonProductiveApps, getAppInfo, updateReportSettings };
