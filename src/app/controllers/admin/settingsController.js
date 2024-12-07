import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op,QueryTypes } from "sequelize";
import blockedWebsites from "../../../database/models/blockedWebsitesModel.js";
import appInfo from "../../../database/models/productiveAppsModel.js";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import department from "../../../database/models/departmentModel.js";
import validate from "../../../utils/CustomValidation.js";

const getAdminDetails = async (req, res) => {
  try {
    const alldata = await User.findOne({
      where: { isAdmin: 1 },
      attributes: ["fullname", "email", "mobile"],
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
    const { fullname, email, mobile } = req.body;
    if (!fullname || !email || !mobile) {
      return helper.failed(res, variables.BadRequest, "All fields (fullname, email, mobile) are required");
    }
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    if (!user) {
      return helper.failed(res, variables.BadRequest, "User not exists");
    }

    await User.update({ fullname, email, mobile }, { where: { id: req.user.id } });
    return helper.success(res, variables.Success, "Admin Profile Updated Successfully");
  } catch (error) {
    console.error("Error updating admin details:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getBlockedWebsites = async (req, res) => {
  try {
    console.log("-------------------------------------");
    const getBlockedSites = await blockedWebsites.findAll({
      // where: {
      //   status: {
      //     [Op.ne]: 0,
      //   },
      // },
      attributes: ["id", "departmentId", "sites", "status"],
    });
    return helper.success(res, variables.Success, "Website Blocked successfully", getBlockedSites);
  } catch (error) {
    console.error("Error blocking website:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const addBlockWebsites = async (req, res) => {
  try {
    const { departmentId, sites } = req.body;
    if (!departmentId || !sites) {
      return helper.failed(res, variables.ValidationError, "departmentId and sites are required");
    }
    // // Optionally, validate the URL format
    // const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    // if (!urlPattern.test(Sites)) {
    //     return responseUtils.errorResponse(res, "Invalid URL format for Sites.", 400);
    // }
    const existingWebsite = await blockedWebsites.findOne({
      where: { departmentId: departmentId, sites: sites },
    });
    if (existingWebsite) {
      return helper.failed(res, variables.ValidationError, "Website is already added for this department");
    }
    const newBlockedWebsite = await blockedWebsites.create({
      departmentId,
      sites,
    });
    return helper.success(res, variables.Success, "New Block Website added successfully");
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
    const [updatedRows] = await blockedWebsites.update({ status: status }, { where: { id: id } });

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

        const rules = {
            department_id: 'required|integer|min:1', 
            // app_logo: 'required|string|min:1', 
            // appname: 'required|string|min:3|max:50',
            website_url: 'required|valid_url'
            // is_productive: 'required|boolean'
        };

        const { status, message } = await validate(req.body, rules);

        if (status === 0) {
            return responseUtils.errorResponse(res, message, 400);
        }

        const existingApp = await appInfo.findOne({
            where: { appname, website_url }
        });

        if (existingApp) {
            return responseUtils.errorResponse(res, { message: "App with this name or website URL already exists." }, 400);
        }

        const newAppInfo = await appInfo.create({ department_id, app_logo, appname, website_url, is_productive });

        return helper.success(res, variables.Success, "App added successfully", newAppInfo);

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
        const { exportType } = req.body;

        const rules = {
            exportType: 'required|string|min:2|max:50',   
        };

        const { status, message } = await validate(req.body, rules);

        if (status === 0) {
          return helper.failed(res, variables.ValidationError, "Status is required");

        }

        const getPreviousStatus = await reportSettings.findOne({
            where: { is_active: 1 },
            attributes: ['id']
        });
        const previousId = getPreviousStatus ? getPreviousStatus.id : 1;

        const [updatedPreviousStatus] = await reportSettings.update(
            { is_active: 0 },
            { where: { id: previousId } }
        );

        const currentStatus = await reportSettings.findOne({
            where: { name: exportType },
            attributes: ['id']
        });
        const currentId = currentStatus ? currentStatus.id : 1;

        const [updateCurrentStatus] = await reportSettings.update(
            { is_active: 1 },
            { where: { id: currentId } }
        );

        if (updateCurrentStatus > 0) {
            return helper.success(res, variables.Success, "Report Status Updated Successfully", updateReportStatus);

        } else {
            return helper.failed(res, variables.BadRequest, "Something went wrong");

        }

    } catch (error) {
        console.error("Error updating report settings:", error);
return helper.failed(res, variables.BadRequest, error.message);

    }
};



export default { getAdminDetails, updateAdminDetails, addBlockWebsites, getBlockedWebsites, updateSitesStatus, addProductiveNonProductiveApps, getAppInfo, updateReportSettings };
