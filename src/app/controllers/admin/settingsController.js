import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op, QueryTypes } from "sequelize";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import department from "../../../database/models/departmentModel.js";
import validate from "../../../utils/CustomValidation.js";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";

import { ProductiveApp } from "../../../database/models/ProductiveApp.js";
import ProductiveWebsite from "../../../database/models/ProductiveWebsite.js";



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
    let { departmentId, limit, page } = req.query;

    limit = parseInt(limit) || 10;
    let offset = (page - 1) * limit || 0;

    let where = { companyId: 101, status: 1 };

    if (departmentId && departmentId != 0) {
      where.departmentId = departmentId;
    }

    const blockedWebsite = await BlockedWebsites.findAndCountAll({
      where,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "website", "website_name", "status","logo"],
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    if (blockedWebsite.count === 0) {
      return helper.success(
        res,
        variables.Success,
        "No blocked websites found.",
        blockedWebsite
      );
    }

    return helper.success(
      res,
      variables.Success,
      "Blocked websites retrieved successfully.",
      blockedWebsite
    );
  } catch (error) {
    console.error("Error fetching blocked websites:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const addBlockWebsites = async (req, res) => {
  try {
    const { departmentId, website } = req.body;
    const rules = {
      departmentId: 'required|integer',
      website: 'required|valid_url',
    };

    const { status, message } = await validate(req.body, rules);

    if (req.body.departmentId == 0) {
      return helper.failed(res, variables.ValidationError, 'The department ID must not be 0.');
    }

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const existingApp = await BlockedWebsites.findOne({
      where: { website },
    });

    if (existingApp) {
      return helper.failed(res, variables.NotFound, "Website with this name or website URL already exists");
    }
    const faviconUrl = await fetchFaviconUrl(website);

    const companyId = 101; 
    const websiteName = new URL(website).hostname;

    const newWebsiteData = { departmentId, website, website_name:websiteName, companyId,logo:faviconUrl };
    const newAppInfo = await BlockedWebsites.create(newWebsiteData);
    return helper.success(res, variables.Success, "App added successfully", newAppInfo);
    
  } catch (error) {
    console.error("Error creating app info:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const updateSitesStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const website = await BlockedWebsites.findByPk(id);
    if (!website) {
      return helper.failed(res, variables.NotFound, "Id not exists in our system.");
    }

    if (status < 0 || status > 1) {
      return helper.failed(res, variables.ValidationError, "Status value must be 0 or 1");
    }
    const [updatedRows] = await BlockedWebsites.update({ status: status }, { where: { id: id } });

    if (updatedRows === 0) {
      return helper.failed(res, variables.NotFound, "Site not found or status not changed");
    }
    return helper.success(res, variables.Success, "Site status updated successfully");
  } catch (error) {
    console.error("Error updating site status:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const addProductiveApps = async (req, res) => {
  try {
    const { department_id, app_name } = req.body;
    const rules = {
      department_id: 'required|integer|min:1',
      app_name: 'required|string|min:3|max:50',
    };

    const { status, message } = await validate(req.body, rules);

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);

    }
    const company_id = 101;
    const existingApp = await ProductiveApp.findOne({
      where: { app_name }
    });

    if (existingApp) {
      return helper.failed(res, variables.NotFound, "App with this name already exists");
    }

    const newAppInfo = await ProductiveApp.create({ company_id, department_id, app_name });
    return helper.success(res, variables.Success, "App added successfully", newAppInfo);
  } catch (error) {
    console.error("Error creating app info:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};


const getAppInfo = async (req, res) => {
  try {
    let { departmentId, limit, page } = req.query;
    limit = parseInt(limit) || 10;

    let offset = (page - 1) * limit || 0;

    let where = { company_id: 101 };

    if (departmentId && departmentId != 0) {
      where.department_id = departmentId;
    }

    const productiveApps = await ProductiveApp.findAndCountAll({
      where,
      attributes: ["id", "app_name"],
      offset: offset,
      limit: limit,
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (productiveApps.count === 0) {
      return helper.success(
        res, variables.Success, "No apps found.", productiveApps
      );
    }

    // Success response
    return helper.success(
      res, variables.Success, "Apps retrieved successfully", productiveApps
    );
  } catch (error) {
    // Handle errors
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

// add productive websites

const fetchFaviconUrl = async (website) => {
  try {
    const response = await fetch(website);
    const html = await response.text();
    const faviconRegex = /<link[^>]+rel=["']?(?:icon|shortcut icon)["']?[^>]*href=["']([^"']+)["']/i;
    const match = html.match(faviconRegex);
    return match ? new URL(match[1], website).href : `${new URL(website).origin}/favicon.ico`;
  } catch (error) {
    console.warn("Could not fetch favicon, using default:", error.message);
    return `${new URL(website).origin}/favicon.ico`;
  }
};

const addProductiveWebsites = async (req, res) => {
  try {
    const { departmentId, website } = req.body;
    const rules = {
      departmentId: 'required|integer',
      website: 'required|valid_url',
    };

    const { status, message } = await validate(req.body, rules);
    if (status === 0 || departmentId === 0) {
      const errorMessage = status === 0 ? message : 'The department ID must not be 0.';
      return helper.failed(res, variables.ValidationError, errorMessage);
    }

    const existingApp = await ProductiveWebsite.findOne({ where: { website } });
    if (existingApp) {
      return helper.failed(res, variables.NotFound, "Website with this name or URL already exists");
    }
    const faviconUrl = await fetchFaviconUrl(website);

    const companyId = 101; 
    const websiteName = new URL(website).hostname;

    const newWebsiteData = {department_id: departmentId,website,website_name: websiteName,company_id: companyId,logo: faviconUrl};

    // Store productive website data
    const newAppInfo = await ProductiveWebsite.create(newWebsiteData);
    return helper.success(res, variables.Success, "Productive website added successfully", newAppInfo);
  } catch (error) {
    console.error("Error creating productive website:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getProductiveWebsites = async (req, res) => {
  try {
    let { departmentId, limit, page } = req.query;

    limit = parseInt(limit) || 10;
    let offset = (page - 1) * limit || 0;

    let where = { company_id: 101 };

    if (departmentId && departmentId != 0) {
      where.department_id = departmentId;
    }

    const productiveWebsite = await ProductiveWebsite.findAndCountAll({
      where,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "website", "website_name","logo"],
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    if (productiveWebsite.count === 0) {
      return helper.success(res, variables.Success, "No productive websites found.", productiveWebsite);
    }
    return helper.success(res, variables.Success, "Productive websites retrieved successfully.", productiveWebsite);
  } catch (error) {
    console.error("Error fetching productive websites:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};


export default { getAdminDetails, updateAdminDetails, addBlockWebsites, getBlockedWebsites, updateSitesStatus, addProductiveApps, getAppInfo, updateReportSettings, addProductiveWebsites, getProductiveWebsites };
