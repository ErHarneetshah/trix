import express from "express";
const router = express.Router();
import dashboardDataController from "../../app/controllers/admin/Dashboard/dashboardDataController.js";
// router.get('/productiveApps',chartController.productiveChart);
router.get('/topFiveProductive',dashboardDataController.topFiveProductiveAppsUsers);
router.get('/topFiveNonProductive',dashboardDataController.topFiveUnProductiveAppsUsers);






export default router;
