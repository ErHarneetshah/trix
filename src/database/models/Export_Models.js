
import User from "./userModel.js";
import reportingManager from "./reportingManagerModel.js";
import department from "./departmentModel.js";
import designation from "./designationModel.js";
import role from "./roleModel.js"
import shift from "./shiftModel.js"
import team from "./teamModel.js"
import userSetting from "./userSettingModel.js";
import blockedWebsites from "./blockedWebsitesModel.js";
import reportSettings from "./reportSettingsModel.js";
import { ProductiveApp }from "./ProductiveApp.js";
import ProductiveWebsite from "./ProductiveWebsite.js";
const exportModels = [User, role, reportingManager, department, designation, shift, team, userSetting, blockedWebsites, ProductiveApp, reportSettings,ProductiveWebsite];

export default exportModels;