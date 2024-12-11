
import User from "./userModel.js";
import reportingManager from "./reportingManagerModel.js";
import department from "./departmentModel.js";
import designation from "./designationModel.js";
import role from "./roleModel.js"
import shift from "./shiftModel.js"
import team from "./teamModel.js"
import userSetting from "./userSettingModel.js";
import { BlockedWebsites } from "./BlockedWebsite.js";
import reportSettings from './src/database/models/reportSettingsModel.js';
import { ProductiveApp }from "./ProductiveApp.js";

const exportModels = [User, role, reportingManager, department, designation, shift, team, userSetting, BlockedWebsites, ProductiveApp, reportSettings];

export default exportModels;