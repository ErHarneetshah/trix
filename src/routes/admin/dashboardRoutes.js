import express from "express";
const router = express.Router();
import dashboardDataController from "../../app/controllers/admin/Dashboard/dashboardDataController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
// router.get('/productiveApps',chartController.productiveChart);
router.get('/topFiveProductive', dashboardDataController.topFiveProductiveAppsUsers);
router.get('/topFiveNonProductive', dashboardDataController.topFiveUnProductiveAppsUsers);
router.get('/topFiveEffective', dashboardDataController.topFiveEffectiveUsers);
router.get('/topFiveAbsentUsers', dashboardDataController.topFiveAbsentUsers);
router.get('/topFiveOfflineLoggedUsers', dashboardDataController.getTopFiveOfflineLoggedUsers);
router.get('/topFiveLateComingUsers', dashboardDataController.topFiveLateComingUsers);


router.get('/getDashbaordData',authMiddleware, dashboardDataController.getDashbaordData);


export default router;
