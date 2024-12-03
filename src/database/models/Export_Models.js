
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
import appInfo from './src/database/models/blockedWebsitesModel.js';
import reportSettings from './src/database/models/reportSettingsModel.js';

const exportModels = [User, role, reportingManager, department, designation, shift, team, userSetting, blockedWebsites, appInfo, reportSettings];

export default exportModels;