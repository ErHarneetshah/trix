import sequelize from "./dbConnection.js";
import User from '../models/userModel.js';
import TimeLog from '../models/timeLogsModel.js';
import accessToken from '../models/accessTokenModel.js';
import AppHistoryEntry from '../models/AppHistoryEntry.js';
import { BlockedWebsites } from '../models/BlockedWebsite.js';
import company from '../models/company.js';
import department from '../models/departmentModel.js';
import designation from '../models/designationModel.js';
import { Device } from '../models/device.js';
import emailGateway from '../models/emailGatewayModel.js';
import { ImageUpload } from '../models/ImageUpload.js';
import app_modules from '../models/moduleModel.js';
import { Notification } from '../models/Notification.js';
import rolePermission from '../models/rolePermissionModel.js';
import { ProductiveApp } from '../models/ProductiveApp.js';
import ProductiveWebsite from '../models/ProductiveWebsite.js';
import role from '../models/roleModel.js';
import team from '../models/teamModel.js';
import { UserHistory } from '../models/UserHistory.js';
import workReports from '../models/workReportsModel.js';
import shift from '../models/shiftModel.js';
import reportSettings from "../models/reportSettingsModel.js";
import languageDropdown from "../models/languageModel.js";
import languageSettings from "../models/languageSettingsModel.js";
import exportReports from "../models/exportReportsModel.js";

(async () => {
  try {
    //console.log('Initializing database connection...');

    const forceSync = process.argv.includes('--force');
    //console.log(`Synchronizing models${forceSync ? ' with force' : ''}...`);
    await sequelize.sync({ force: forceSync, alter: true });

    //console.log(`Models synchronized successfully${forceSync ? ' (forced)' : ''}.`);
  } catch (error) {
    console.error('Error synchronizing models:', error);
  } finally {
    await sequelize.close();
    //console.log('Database connection closed.');
  }
})();
