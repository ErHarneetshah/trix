import express from "express";
const router = express.Router();
import compareReportsController from "../../app/controllers/admin/compareReportsController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import TestController from "../../app/controllers/admin/Test/TestController.js";

router.get('/getCompareReportsData', authMiddleware, compareReportsController.getCompareReportsData);
router.get('/getAllUsers', authMiddleware, compareReportsController.getAllUsers);

//testing routes
router.get('/testingReport',authMiddleware,TestController.departmentPerformanceReport);



export default router;
