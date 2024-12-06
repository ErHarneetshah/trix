import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import settingsController from "../../app/controllers/admin/settingsController.js";


router.get('/get-admin-details',    authMiddleware,verifyAdminMiddleware,    settingsController.getAdminDetails);
router.put('/update-admin-details',    authMiddleware,verifyAdminMiddleware,     settingsController.updateAdminDetails);

router.post('/add-blocked-websites',    authMiddleware,verifyAdminMiddleware,    settingsController.addBlockWebsites);
router.get('/get-blocked-websites',    authMiddleware,verifyAdminMiddleware,    settingsController.getBlockedWebsites);
router.put('/update-sites-status',    authMiddleware,verifyAdminMiddleware,    settingsController.updateSitesStatus);

router.put('/update-sites-status/:id',    authMiddleware,verifyAdminMiddleware,    settingsController.updateSitesStatus);
router.post('/add-productive-nonpro-websites',    authMiddleware,verifyAdminMiddleware,    settingsController.addProductiveNonProductiveApps);
router.get('/get-app-info',    authMiddleware,verifyAdminMiddleware,    settingsController.getAppInfo);
router.put('/update-report-status/:id',    authMiddleware,verifyAdminMiddleware,    settingsController.updateReportSettings);

export default router;

