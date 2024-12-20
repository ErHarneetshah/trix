import express from "express";
const router = express.Router();
import chartController from "../../app/controllers/admin/Charts/chartController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
// router.get('/productiveApps',chartController.productiveChart);

//ROUTER FOR TOP APPS CHART DATA
router.get('/topApps', authMiddleware,chartController.topApplicationChart);

//ROUTER FOR TOP WEBSITE CHART DATA
router.get('/topWebsites', authMiddleware,chartController.topWebsiteChart);

router.get('/productiveApps', authMiddleware,chartController.productiveAppsChart);
router.get('/productiveWebsites',authMiddleware, chartController.productiveWebsiteChart);
router.get('/nonProductiveApps', authMiddleware,chartController.nonProductiveAppsChart);
router.get('/nonProductiveWebsites', authMiddleware,chartController.NonProductiveWebsiteChart);

//ROUTE FOR PRODUCTIVE DATA LIKE PRODUCTIVE WEBSITE AND PRODUCTIVE APPS
router.get('/productiveData',authMiddleware, chartController.productiveAppsAndproductiveWebsites);

//ROUTE FOR PRODUCTIVE AND NON PRODUCTIVE WEBSITE CHART DATA
router.get('/proAndNonProWebsiteData', authMiddleware,chartController.productiveWebsiteAndNonproductiveWebsites);

// ROUTE FOR PRODUCTIVE AND NON PRODUCTIVE APPS CHART DATA
router.get('/proAndNonProAppsData',authMiddleware, chartController.productiveAppAndNonproductiveApps);

//ROUTER FOR ACTIVITY TRENDS FOR ALL ACTIVITY
router.get('/activityData', authMiddleware,chartController.activityData);

router.get('/singleUserProductiveAppData', authMiddleware, chartController.singleUserProductiveAppData);//fixing this
router.get('/singleUserNonProductiveAppData', authMiddleware, chartController.singleUserNonProductiveAppData);
router.get('/singleUserProductiveWebsiteData', authMiddleware, chartController.singleUserProductiveWebsiteData); //tested
router.get('/singleUserNonProductiveWebsiteData', authMiddleware, chartController.singleUserNonProductiveWebsiteData);//tested 

router.get('/singleUserProductiveAppAndNonproductiveApps',authMiddleware, chartController.singleUserProductiveAppAndNonproductiveApps);
router.get('/singleUserProductiveWebsitesAndNonproductiveWebsites',authMiddleware, chartController.singleUserProductiveWebsitesAndNonproductiveWebsites);




export default router;
