import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import settingsController from "../../app/controllers/admin/settingsController.js";
import emailGatewayController from "../../app/controllers/admin/emailGatewayController.js";


router.get('/get-admin-details',  settingsController.getAdminDetails);
router.put('/update-admin-details/:id', settingsController.updateAdminDetails);

router.post('/add-blocked-websites',  settingsController.addBlockWebsites);
router.get('/get-blocked-websites',  settingsController.getBlockedWebsites);
router.post('/update-sites-status',  settingsController.updateSitesStatus);

router.post('/update-sites-status/:id',  settingsController.updateSitesStatus);
router.post('/add-productive-nonpro-websites',  settingsController.addProductiveNonProductiveApps);
router.get('/get-app-info',  settingsController.getAppInfo);
router.put('/update-report-status',  settingsController.updateReportSettings);

//email gateway routes
router.post('/add-email-gateways',  emailGatewayController.addEmailGateeways);
router.post('/check-email-server',  emailGatewayController.checkEmailServer);
router.get('/get-email-list',  emailGatewayController.getEmailList);



export default router;

