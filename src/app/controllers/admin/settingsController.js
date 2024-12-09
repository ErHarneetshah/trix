import User from "../../../database/models/userModel.js";
// import responseUtils from "../../../utils/common/responseUtils.js";
import sequelize from "../../../database/queries/dbConnection.js";
import { Op } from "sequelize";
import appInfo from "../../../database/models/productiveAppsModel.js";
import reportSettings from "../../../database/models/reportSettingsModel.js";
import { BlockedWebsites } from "../../../database/models/BlockedWebsite.js";


const getAdminDetails = async (req, res) => {
    try {
        const users = await sequelize.query(
            `SELECT u.firstname, u.lastname, u.email,u.mobile, d.name
            FROM users As u
            INNER JOIN designations As d ON u.designationId = d.id
            WHERE u.isAdmin = 1;`
        );

        // return responseUtils.successResponse(res, { users, message: "Retrieved Admin Profile Details Successfully." }, 200);
    } catch (error) {
        console.error('Error fetching questions:', error);
        // return responseUtils.errorResponse(res, error.message, 400);
    }
}


const updateAdminDetails = async (req, res) => {
    try {
        const { firstname, lastname, email, mobile } = req.body;
        if (!firstname || !lastname || !email || !mobile) {
            // return responseUtils.errorResponse(res, "All fields (firstname, lastname, email, mobile) are required.", 400);
        }
        const user = await User.findByPk(req.params.id);
        if (!user) {
            // return responseUtils.errorResponse(res, "User not exits.", 400);
        }
        await User.update({ firstname, lastname, email, mobile }, { where: { id: req.params.id } });
        // return responseUtils.successResponse(res, { message: "Admin Profile Updated Successfully." }, 200);
    } catch (error) {
        console.error('Error updating admin details:', error);
        // return responseUtils.errorResponse(res, "Error updating admin details", 400);
    }
};

const addBlockWebsites = async (req, res) => {
    try {
        const { Department_id, Sites } = req.body;
        if (!Department_id || !Sites) {
            // return responseUtils.errorResponse(res, "Department_id and Sites are required.", 400);
        }
        // // Optionally, validate the URL format
        // const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        // if (!urlPattern.test(Sites)) {
        //     return responseUtils.errorResponse(res, "Invalid URL format for Sites.", 400);
        // }
        const existingWebsite = await BlockedWebsites.findOne({
            where: { Sites }
        });
        if (existingWebsite) {
            // return responseUtils.errorResponse(res, { message: "Website is already blocked" }, 400);
        }
        const newBlockedWebsite = await BlockedWebsites.create({
            Department_id,
            Sites
        });
        // return responseUtils.successResponse(res, { website: newBlockedWebsite, message: "Website Blocked successfully" }, 200);

    } catch (error) {
        console.error('Error blocking website:', error);
        // return responseUtils.errorResponse(res, error.message, 400);
    }
};


const getBlockedWebsites = async (req, res) => {
    try {
        const getBlockedSites = await BlockedWebsites.findAll({
            where: {
                Status: {
                    [Op.ne]: 0
                }
            }, attributes: ['id', 'Sites']
        });
        // return responseUtils.successResponse(res, { retrievedWebsite: getBlockedSites, message: "Retrieved  Blocked Website Successfully" }, 200);
    } catch (error) {
        console.error('Error blocking website:', error);
        // return responseUtils.errorResponse(res, error.message, 400);
    }
};


const updateSitesStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!id || status === undefined) {
            // return responseUtils.errorResponse(res, "ID and Status are required", 400);
        }
        if (status !== 0 && status !== 1) {
            // return responseUtils.errorResponse(res, "Status must be either 0 or 1.", 400);
        }
        const [updatedRows] = await BlockedWebsites.update(
            { Status: status },
            { where: { id } }
        );

        if (updatedRows === 0) {
            // return responseUtils.errorResponse(res, "Site not found or status not changed", 404);
        }
        // return responseUtils.successResponse(res, { retrievedWebsite: updatedRows, message: "Site status updated successfully" }, 200);
    } catch (error) {
        console.error("Error updating site status:", error);
        // return responseUtils.errorResponse(res, error.message, 500);
    }
};

const addProductiveNonProductiveApps = async (req, res) => {
    try {
        const { department_id, app_logo, appname, website_url, is_productive } = req.body;
        if (!department_id || !app_logo || !appname || !website_url || is_productive === undefined) {
            // return responseUtils.errorResponse(res, "All fields (department_id, app_logo, appname, website_url, is_productive) are required.", 400);
        }
        const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (!urlPattern.test(website_url)) {
            // return responseUtils.errorResponse(res, "Invalid URL format for website_url.", 400);
        }

        const newAppInfo = await appInfo.create({ department_id, app_logo, appname, website_url, is_productive });
        // return responseUtils.successResponse(res, { appInfo: newAppInfo, message: "App added Successfully." }, 200);
    } catch (error) {
        console.error("Error creating app info:", error);
        // return responseUtils.errorResponse(res, error.message, 400);
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

        // return responseUtils.successResponse(res, {
        //     productiveApps,
        //     nonProductiveApps,
        //     message: "Apps retrieved successfully."
        // }, 200);
    } catch (error) {
        console.error("Error fetching app info:", error);
        // return responseUtils.errorResponse(res, error.message, 400);
    }
};

const updateReportSettings = async (req, res) => {
    try {
        //check that the id exist or not
        const differentReportStatus = await reportSettings.findByPk(req.params.id);
        if (!differentReportStatus) {
            // return responseUtils.errorResponse(res, "Somethong Went Wrong.", 400);
        }

        const { status } = req.body;
        if (status === undefined) {
            // return responseUtils.errorResponse(res, "Status is required.", 400);
        }
        if (status !== 0 && status !== 1) {
            // return responseUtils.errorResponse(res, "Status must be either 0 or 1.", 400);
        }


        const [updateReportStatus] = await reportSettings.update(
            { is_active: status },
            { where: { id: req.params.id } }
        );
        // return responseUtils.successResponse(res, { updatedRpows: updateReportStatus, message: "Report Status Updated Successfully." }, 200);

    } catch (error) {
        console.error("Error fetching app info:", error);
        // return responseUtils.errorResponse(res, error.message, 400);
    }

};

export default { getAdminDetails, updateAdminDetails, addBlockWebsites, getBlockedWebsites, updateSitesStatus, addProductiveNonProductiveApps, getAppInfo, updateReportSettings };


