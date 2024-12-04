import User from "../../../database/models/userModel.js";
import responseUtils from "../../../utils/common/responseUtils.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op,QueryTypes } from "sequelize";
import blockedWebsites from "../../../database/models/blockedWebsitesModel.js";
import appInfo from "../../../database/models/productiveAppsModel.js";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import validate from '../../../utils/CustomValidation.js';


const getAdminDetails = async (req, res) => {
    try {
        const query=  `SELECT u.id,u.firstname, u.lastname, u.email,u.mobile, d.name
        FROM users As u
        INNER JOIN designations As d ON u.designationId = d.id
        WHERE u.isAdmin = 1;`;
        const users = await User.sequelize.query(query, {
            type: User.sequelize.QueryTypes.SELECT}
        );

        return responseUtils.successResponse(res, { users, message: "Retrieved Admin Profile Details Successfully." }, 200);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
}


const updateAdminDetails = async (req, res) => {
    try {
        const { firstname, lastname, email, mobile } = req.body;

        const rules = {
            firstname: 'required|string|min:2|max:50',  
            lastname: 'required|string|min:2|max:50',   
            email: 'required|email',                      
            mobile: 'required|regex:/^\\+?\\d{6,15}$/'   
        };

        const { status, message } = await validate(req.body, rules);

        if (status === 0) {
            return responseUtils.errorResponse(res, message, 400);
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return responseUtils.errorResponse(res, "User not found.", 400);
        }

        await User.update({ firstname, lastname, email, mobile }, { where: { id: req.params.id } });

        return responseUtils.successResponse(res, { message: "Admin Profile Updated Successfully." }, 200);

    } catch (error) {
        console.error('Error updating admin details:', error);
        return responseUtils.errorResponse(res, "Error updating admin details", 400);
    }
};

const addBlockWebsites = async (req, res) => {
    try {
        const { Department_id, Sites } = req.body;

        const rules = {
            Department_id: 'required|integer|min:1', 
            Sites: 'required|string'         
        };

        const { status, message } = await validate(req.body, rules);

        if (status === 0) {
            return responseUtils.errorResponse(res, message, 400);
        }

        const existingWebsite = await blockedWebsites.findOne({ where: { Sites } });
        if (existingWebsite) {
            return responseUtils.errorResponse(res, { message: "Website is already blocked" }, 400);
        }

        // added the website
        const newBlockedWebsite = await blockedWebsites.create({ Department_id, Sites });

        // Success Response
        return responseUtils.successResponse(res, { website: newBlockedWebsite, message: "Website Blocked successfully" }, 200);

    } catch (error) {
        console.error('Error blocking website:', error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};

const getBlockedWebsites = async (req, res) => {
    try {
        const getBlockedSites = await blockedWebsites.findAll({
            where: {
                Status: {
                    [Op.ne]: 0
                }
            }, attributes: ['id', 'Sites', 'Status']
        });
        return responseUtils.successResponse(res, { retrievedWebsite: getBlockedSites, message: "Retrieved  Blocked Website Successfully" }, 200);
    } catch (error) {
        console.error('Error blocking website:', error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};


const updateSitesStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!id || status === undefined) {
            return responseUtils.errorResponse(res, "ID and Status are required", 400);
        }
        if (status !== 0 && status !== 1) {
            return responseUtils.errorResponse(res, "Status must be either 0 or 1.", 400);
        }
        const [updatedRows] = await blockedWebsites.update(
            { Status: status },
            { where: { id } }
        );

        if (updatedRows === 0) {
            return responseUtils.errorResponse(res, "Site not found or status not changed", 404);
        }
        return responseUtils.successResponse(res, { retrievedWebsite: updatedRows, message: "Site status updated successfully" }, 200);
    } catch (error) {
        console.error("Error updating site status:", error);
        return responseUtils.errorResponse(res, error.message, 500);
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

        return responseUtils.successResponse(res, { appInfo: newAppInfo, message: "App added successfully." }, 200);

    } catch (error) {
        console.error("Error creating app info:", error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};


const getAppInfo = async (req, res) => {
    try {
        const productiveApps = await appInfo.findAll({
            where: { is_productive: 1 },
            attributes: ['appname', 'app_logo']
        });

        const nonProductiveApps = await appInfo.findAll({
            where: { is_productive: 0 },
            attributes: ['appname', 'app_logo']
        });

        return responseUtils.successResponse(res, {
            productiveApps,
            nonProductiveApps,
            message: "Apps retrieved successfully."
        }, 200);
    } catch (error) {
        console.error("Error fetching app info:", error);
        return responseUtils.errorResponse(res, error.message, 400);
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
            return responseUtils.errorResponse(res, message, 400);
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
            return responseUtils.successResponse(res, { updatedRows: updateCurrentStatus, message: "Report Status Updated Successfully." }, 200);
        } else {
            return responseUtils.errorResponse(res, { message: "Something went wrong." }, 400);
        }

    } catch (error) {
        console.error("Error updating report settings:", error);
        return responseUtils.errorResponse(res, error.message, 400);
    }
};

export default { getAdminDetails, updateAdminDetails, addBlockWebsites, getBlockedWebsites, updateSitesStatus, addProductiveNonProductiveApps, getAppInfo, updateReportSettings };


