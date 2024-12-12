import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import settingsController from "../../app/controllers/admin/settingsController.js";
import emailGatewayController from "../../app/controllers/admin/emailGatewayController.js";
import fileUpload from "../../utils/file-upload.js";
import helper from "../../utils/services/helper.js";
import variables from "../../app/config/variableConfig.js";


const UploadImageWithPath = (req, res, next) => {
 
    req.headers['mypath'] = "logos";
    return fileUpload(req, res, next);
  }
  


router.get('/get-admin-details',    authMiddleware,verifyAdminMiddleware,    settingsController.getAdminDetails);
router.put('/update-admin-details',    authMiddleware,verifyAdminMiddleware,     settingsController.updateAdminDetails);

router.post('/add-blocked-websites',    authMiddleware,verifyAdminMiddleware,    settingsController.addBlockWebsites);
router.get('/get-blocked-websites',    authMiddleware,verifyAdminMiddleware,    settingsController.getBlockedWebsites);
router.post('/update-sites-status',    authMiddleware,verifyAdminMiddleware,    settingsController.updateSitesStatus);

router.post('/add-productive-apps',    authMiddleware,verifyAdminMiddleware, UploadImageWithPath,    settingsController.addProductiveApps);
router.get('/get-app-info',    authMiddleware,verifyAdminMiddleware,    settingsController.getAppInfo);
router.put('/update-report-status/:id',    authMiddleware,verifyAdminMiddleware,    settingsController.updateReportSettings);

//email gateway routes
router.post('/add-email-gateways', authMiddleware,verifyAdminMiddleware,  emailGatewayController.addEmailGateeways);
router.post('/check-email-server', authMiddleware,verifyAdminMiddleware,  emailGatewayController.checkEmailServer);
router.get('/get-email-list', authMiddleware,verifyAdminMiddleware,  emailGatewayController.getEmailList);


//add productive websites
router.post('/add-productive-websites', authMiddleware,verifyAdminMiddleware,  settingsController.addProductiveWebsites);
router.get('/get-productive-websites',    authMiddleware,verifyAdminMiddleware,    settingsController.getProductiveWebsites);


export default router;

