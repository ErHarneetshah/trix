import express from "express";
const router = express.Router();
import chartController from "../../app/controllers/admin/Charts/chartController.js";

// router.get('/productiveApps',chartController.productiveChart);
router.get('/topApps',chartController.topApplicationChart);
router.get('/topWebsites',chartController.topWebsiteChart);
router.get('/productiveApps',chartController.productiveAppsChart);
router.get('/productiveWebsites',chartController.productiveWebsiteChart);
router.get('/nonProductiveApps',chartController.nonProductiveAppsChart);
router.get('/nonProductiveWebsites',chartController.NonProductiveWebsiteChart);


router.get('/productiveData',chartController.productiveAppsAndproductiveWebsites);
router.get('/proAndNonProWebsiteData',chartController.productiveWebsiteAndNonproductiveWebsites);
router.get('/proAndNonProAppsData',chartController.productiveAppAndNonproductiveApps);





export default router;
