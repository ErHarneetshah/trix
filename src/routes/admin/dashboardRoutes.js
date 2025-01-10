import express from "express";
const router = express.Router();
import dashboardDataController from "../../app/controllers/admin/Dashboard/dashboardDataController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

// router.get('/productiveApps',chartController.productiveChart);
router.get('/topFiveProductive', authMiddleware, dashboardDataController.topFiveProductiveAppsUsers);
router.get('/topFiveNonProductive', authMiddleware, dashboardDataController.topFiveUnProductiveAppsUsers);
router.get('/topFiveEffective', authMiddleware, dashboardDataController.topFiveEffectiveUsers);
router.get('/topFiveAbsentUsers', authMiddleware, dashboardDataController.topFiveAbsentUsers);
router.get('/topFiveOfflineLoggedUsers', authMiddleware, dashboardDataController.getTopFiveOfflineLoggedUsers);
router.get('/topFiveLateComingUsers', authMiddleware, dashboardDataController.topFiveLateComingUsers);
router.get('/getDashbaordData', authMiddleware, dashboardDataController.getDashbaordData);


export default router;
