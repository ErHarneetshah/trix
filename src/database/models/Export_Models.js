
import User from "./userModel.js";
import reportingManager from "./reportingManagerModel.js";
import department from "./departmentModel.js";
import designation from "./designationModel.js";
import role from "./roleModel.js"
import shift from "./shiftModel.js"
import team from "./teamModel.js"
import userSetting from "./userSettingModel.js";
import blockedWebsites from "./blockedWebsitesModel.js";
import blockedWebsites from './src/database/models/blockedWebsitesModel.js';
import reportSettings from './src/database/models/reportSettingsModel.js';
import { ProductiveApp }from "./ProductiveApp.js";
import accessToken from "./accessTokenModel.js";
import AppHistoryEntry from "./AppHistoryEntry.js";
import { BlockedWebsites } from "./BlockedWebsite.js";
import company from "./companyModel.js";
import emailGateway from "./emailGatewayModel.js";
import { ImageUpload } from "./ImageUpload.js";
import module from "./moduleModel.js";
import { Notification } from "./Notification.js";
import rolePermission from "./rolePermissionModel.js";
import ProductiveWebsite from "./ProductiveWebsite.js";
import { System } from "./System.js";
import TimeLog from "./TimeLog.js";



const exportModels = [User, role, reportingManager, department, designation, shift, team, userSetting, blockedWebsites, ProductiveApp, reportSettings];

export default exportModels;