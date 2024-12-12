import express from "express";
const router = express.Router();
import dashboardDataController from "../../app/controllers/admin/Dashboard/dashboardDataController.js";
// router.get('/productiveApps',chartController.productiveChart);
router.get('/topFiveProductive', dashboardDataController.topFiveProductiveAppsUsers);
router.get('/topFiveNonProductive', dashboardDataController.topFiveUnProductiveAppsUsers);
router.get('/topFiveEffective', dashboardDataController.topFiveEffectiveUsers);
router.get('/topFiveAbsentUsers', dashboardDataController.topFiveAbsentUsers);
router.get('/topFiveOfflineLoggedUsers', dashboardDataController.getTopFiveOfflineLoggedUsers);
router.get('/topFiveLateComingUsers', dashboardDataController.topFiveLateComingUsers);











export default router;
