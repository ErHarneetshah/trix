import express from "express";
const router = express.Router();
import compareReportsController from "../../app/controllers/admin/compareReportsController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

router.get('/getCompareReportsData', authMiddleware,compareReportsController.getCompareReportsData);
router.get('/getAllUsers', authMiddleware,compareReportsController.getAllUsers);



export default router;
