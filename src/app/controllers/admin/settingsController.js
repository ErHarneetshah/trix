import User from "../../../database/models/userModel.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op, QueryTypes } from "sequelize";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import helper from "../../../utils/services/helper.js";
import variables from "../../config/variableConfig.js";
import department from "../../../database/models/departmentModel.js";
import validate from "../../../utils/CustomValidation.js";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";
import designation from "../../../database/models/designationModel.js";

import { ProductiveApp } from "../../../database/models/ProductiveApp.js";
import ProductiveWebsite from "../../../database/models/ProductiveWebsite.js";
import uploadPhotos from "../../../utils/services/commonfuncitons.js";
import commonfuncitons from "../../../utils/services/commonfuncitons.js";

const getAdminDetails = async (req, res) => {
  try {
    const alldata = await User.findOne({
      where: { isAdmin: 1, company_id: req.user.company_id },
      attributes: ["fullname", "email", "mobile"],
      include: [
        {
          model: designation,
          as: "designation",
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

    const rules = {
      fullname: "required|string|min:3|max:100",
      email: "required|email",
      mobile: "required|string|regex:/^\\d{10}$/",
    };

    const { status, message } = await validate(req.body, rules);
    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const user = await User.findOne({
      where: { id: req.user.id, company_id: req.user.company_id },
    });
    if (!user) {
      return helper.failed(res, variables.BadRequest, "User not exists");
    }

    await User.update({ fullname, email, mobile }, { where: { id: req.user.id, company_id: req.user.company_id } });
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

    let where = { companyId: req.user.company_id };

    if (departmentId && (departmentId != 0 || isNaN(departmentId))) {
      const isDepartmentExists = await department.findOne({
        where: {
          id: departmentId,
          company_id: req.user.company_id,
        },
      });

      if (!isDepartmentExists) return helper.failed(res, variables.NotFound, "Invalid department ID provided.");

      where.departmentId = departmentId;
    }

    where.companyId = req.user.company_id;

    const blockedWebsite = await BlockedWebsites.findAndCountAll({
      where: where,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "website", "website_name", "status", "logo"],
      include: [
        {
          model: department,
          as: "department",
          attributes: ["name"],
        },
      ],
    });

    if (blockedWebsite.count === 0) {
      return helper.success(res, variables.Success, "No blocked websites found.", blockedWebsite);
    }

    return helper.success(res, variables.Success, "Blocked websites retrieved successfully.", blockedWebsite);
  } catch (error) {
    console.error("Error fetching blocked websites:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const addBlockWebsites = async (req, res) => {
  try {
    const { departmentId, website } = req.body;
    const rules = {
      departmentId: "required|integer",
      website: "required|valid_url",
    };

    const { status, message } = await validate(req.body, rules);

    if (req.body.departmentId == 0) {
      return helper.failed(res, variables.ValidationError, "The department ID must not be 0.");
    }

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }

    const isDepartmentExists = await department.findOne({
      where: {
        id: departmentId,
        company_id: req.user.company_id,
      },
    });

    if (!isDepartmentExists) {
      return helper.failed(res, variables.NotFound, "Department is not exist.");
    }

    const existingApp = await BlockedWebsites.findOne({
      where: { website: website, companyId: req.user.company_id },
    });

    if (existingApp) {
      return helper.failed(res, variables.NotFound, "Website with this name or website URL already exists");
    }
    const faviconUrl = await fetchFaviconUrl(website);

    let companyId = req.user.company_id;
    const websiteName = new URL(website).hostname;

    const newWebsiteData = { departmentId: departmentId, website: website, website_name: websiteName, companyId: companyId, logo: faviconUrl };
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

    if (!id || isNaN(id)) return helper.failed(res, variables.ValidationError, "Id is required and in number");

    if (status < 0 || status > 1) {
      return helper.failed(res, variables.ValidationError, "Status value must be 0 or 1");
    }

    const website = await BlockedWebsites.findByPk(id);
    if (!website) {
      return helper.failed(res, variables.NotFound, "Id does not exists in our system.");
    }

    if (website.status === status) {
      return helper.failed(res, variables.BadRequest, `Site status is already ${status === 1 ? "Blocked" : "Unblocked"}.`);
    }
    const [updatedRows] = await BlockedWebsites.update({ status: status }, { where: { id: id, companyId: req.user.company_id } });

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
      department_id: "required|integer",
      app_name: "required|string|min:3|max:50",
    };

    const { status, message } = await validate(req.body, rules);
    if (status === 0) {
      return helper.failed(res, variables.ValidationError, message);
    }
    const company_id = req.user.company_id;

    if (!req.filedata.data) {
      return helper.failed(res, variables.ValidationError, message);
    }
    const existingApp = await ProductiveApp.findOne({
      where: { app_name: app_name, company_id: req.user.company_id },
    });

    if (existingApp) {
      return helper.failed(res, variables.NotFound, "App with this name already exists");
    }

    const isDepartmentExists = await department.findOne({
      where: {
        id: department_id,
        company_id: req.user.company_id,
      },
    });

    if (!isDepartmentExists) {
      return helper.failed(res, variables.NotFound, "Invalid department id is provided");
    }

    // const imagespaths = await uploadPhotos(req, res, 'app_logo', imageArr);

    const newAppInfo = await ProductiveApp.create({ company_id: company_id, department_id: department_id, app_name: app_name, app_logo: req.filedata.data });
    return helper.success(res, variables.Success, "App added successfully", newAppInfo);
  } catch (error) {
    console.error("Error creating app info:", error.message);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getAppInfo = async (req, res) => {
  try {
    let { departmentId, limit, page } = req.query;


    limit = parseInt(limit) || 10;
    let offset = (page - 1) * limit || 0;
    let where = { company_id: req.user.company_id };

    if (departmentId && (departmentId != 0 || isNaN(departmentId))) {
      const isDepartmentExists = await department.findOne({
        where: {
          id: departmentId,
          company_id: req.user.company_id,
        },
      });

      if (!isDepartmentExists) {
        return helper.failed(res, variables.NotFound, "Invalid department id is provided");
      }

      where.department_id = departmentId;
    }

    const productiveApps = await ProductiveApp.findAndCountAll({
      where,
      attributes: ["id", "app_name", "app_logo"],
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
      return helper.success(res, variables.Success, "No apps found.", productiveApps);
    }

    // Success response
    return helper.success(res, variables.Success, "Apps retrieved successfully", productiveApps);
  } catch (error) {
    // Handle errors
    console.error("Error fetching app info:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

const getReportStatus = async (req, res) => {
  const getStatus = await reportSettings.findOne({
    where: { company_id: req.user.company_id },
    attributes: ["status"],
  });

  if (!getStatus) {
    return helper.failed(res, variables.NotFound, "Report status not found.");
  }

  const statusMapping = { 1: "Monthly", 2: "Weekly", 3: "Daily" };
  const statusType = getStatus ? statusMapping[getStatus.status] : "unknown";
  return helper.success(res, variables.Success, "Report settings retrieved successfully.", getStatus, { statusType });
};

const updateReportSettings = async (req, res) => {
  try {
    const { exportType } = req.body;

    const rules = {
      exportType: "required|integer|in:1,2,3",
    };

    const { status, message } = await validate(req.body, rules);

    if (status === 0) {
      return helper.failed(res, variables.ValidationError, "Export Type can only be 1, 2 or 3");
    }
    if (exportType < 1 || exportType > 4) {
      return helper.failed(res, variables.ValidationError, "Export Type can only be 1, 2 or 3");
    }

    const [updatedPreviousStatus] = await reportSettings.update({ status: exportType }, { where: { company_id: req.user.company_id } });
    if (updatedPreviousStatus === 0) {
      return helper.failed(res, variables.NotFound, "No report settings found for the specified company.");
    }


    // Update the user's `next_reports_schedule_date`
    let resultDate = (exportType === 1) ? commonfuncitons.getNextMonthDate() : (exportType === 2) ? commonfuncitons.getNextMondayDate() : (exportType === 3) ? commonfuncitons.getTomorrowDate() : "Unknown Error";
    console.log("----", resultDate)
    const [updatedUsers] = await User.update(
      { next_reports_schedule_date: resultDate },
      { where: { id: req.user.id } }
    );
    console.log(req.user.id, "admin");
    if (updatedUsers === 0) {
      return helper.failed(res, variables.NotFound, "No users found for the specified company.");
    }

    return helper.success(res, variables.Success, "Report Settings Updated Successfully");
  } catch (error) {
    console.error("Error updating report settings:", error);
    return helper.failed(res, variables.BadRequest, error.message);
  }
};

// add productive websites

const fetchFaviconUrl = async (website) => {
  try {
    if (!website || typeof website !== "string") {
      throw new Error("Invalid website URL. Please provide a valid string.");
    }

    const websiteUrl = new URL(website);

    const response = await fetch(websiteUrl.href);
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch website. Status: ${response.status}`);
    // }

    const html = await response.text();
    if (!html) {
      throw new Error(`Failed to fetch website.`);
    }

    const faviconRegex = /<link[^>]+rel=["']?(?:icon|shortcut icon)["']?[^>]*href=["']([^"']+)["']/i;
    const match = html.match(faviconRegex);

    return match ? new URL(match[1], websiteUrl.origin).href : `${websiteUrl.origin}/favicon.ico`;
  } catch (error) {
    console.warn("Could not fetch favicon, using default:", error.message);

    // // Default to `/favicon.ico` for invalid URLs or other errors
    // try {
    //   return `${new URL(website).origin}/favicon.ico`;
    // } catch {
    //   return "https://example.com/favicon.ico"; // Final fallback
    // }
  }
};

const addProductiveWebsites = async (req, res) => {
  try {
    const { departmentId, website } = req.body;
    const rules = {
      departmentId: "required|integer",
      website: "required|valid_url",
    };

    const { status, message } = await validate(req.body, rules);
    if (status === 0 || departmentId === 0) {
      const errorMessage = status === 0 ? message : "The department ID must not be 0.";
      return helper.failed(res, variables.ValidationError, errorMessage);
    }

    const isDepartmentExists = await department.findOne({
      where: {
        id: departmentId,
        company_id: req.user.company_id,
      },
    });

    if (!isDepartmentExists) {
      return helper.failed(res, variables.NotFound, "Department is not exist.");
    }

    const existingApp = await ProductiveWebsite.findOne({ where: { website } });
    if (existingApp) {
      return helper.failed(res, variables.NotFound, "Website with this name or URL already exists");
    }

    const faviconUrl = await fetchFaviconUrl(website);
    const websiteName = new URL(website).hostname;
    const newWebsiteData = { department_id: departmentId, website, website_name: websiteName, company_id: req.user.company_id, logo: faviconUrl };

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

    let where = { company_id: req.user.company_id };

    if (departmentId && (departmentId != 0 || isNaN(departmentId))) {
      const isDepartmentExists = await department.findOne({
        where: {
          id: departmentId,
          company_id: req.user.company_id,
        },
      });

      if (!isDepartmentExists) {
        return helper.failed(res, variables.NotFound, "Department does not exist.");
      }

      where.department_id = departmentId;
    }

    const productiveWebsite = await ProductiveWebsite.findAndCountAll({
      where,
      offset: offset,
      limit: limit,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "website", "website_name", "logo"],
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

export default {
  getAdminDetails,
  updateAdminDetails,
  addBlockWebsites,
  getBlockedWebsites,
  updateSitesStatus,
  addProductiveApps,
  getAppInfo,
  getReportStatus,
  updateReportSettings,
  addProductiveWebsites,
  getProductiveWebsites,
};
