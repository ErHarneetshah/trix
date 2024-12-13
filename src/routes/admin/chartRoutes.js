import express from "express";
const router = express.Router();
import chartController from "../../app/controllers/admin/Charts/chartController.js";

// router.get('/productiveApps',chartController.productiveChart);

//ROUTER FOR TOP APPS CHART DATA
router.get('/topApps', chartController.topApplicationChart);

//ROUTER FOR TOP WEBSITE CHART DATA
router.get('/topWebsites', chartController.topWebsiteChart);

router.get('/productiveApps', chartController.productiveAppsChart);
router.get('/productiveWebsites', chartController.productiveWebsiteChart);
router.get('/nonProductiveApps', chartController.nonProductiveAppsChart);
router.get('/nonProductiveWebsites', chartController.NonProductiveWebsiteChart);

//ROUTE FOR PRODUCTIVE DATA LIKE PRODUCTIVE WEBSITE AND PRODUCTIVE APPS
router.get('/productiveData', chartController.productiveAppsAndproductiveWebsites);

//ROUTE FOR PRODUCTIVE AND NON PRODUCTIVE WEBSITE CHART DATA
router.get('/proAndNonProWebsiteData', chartController.productiveWebsiteAndNonproductiveWebsites);

// ROUTE FOR PRODUCTIVE AND NON PRODUCTIVE APPS CHART DATA
router.get('/proAndNonProAppsData', chartController.productiveAppAndNonproductiveApps);

//ROUTER FOR ACTIVITY TRENDS FOR ALL ACTIVITY


router.get('/activityData', chartController.activityData);

router.get('/singleUserProductiveAppData', chartController.singleUserProductiveAppData);
router.get('/singleUserNonProductiveAppData', chartController.singleUserNonProductiveAppData);
router.get('/singleUserProductiveWebsiteData', chartController.singleUserProductiveWebsiteData);
router.get('/singleUserNonProductiveWebsiteData', chartController.singleUserNonProductiveWebsiteData);

router.get('/singleUserProductiveAppAndNonproductiveApps', chartController.singleUserProductiveAppAndNonproductiveApps);
router.get('/singleUserProductiveWebsitesAndNonproductiveWebsites', chartController.singleUserProductiveWebsitesAndNonproductiveWebsites);











export default router;
