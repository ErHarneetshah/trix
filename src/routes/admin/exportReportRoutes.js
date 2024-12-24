import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import exportReportController from "../../app/controllers/admin/exportReportController.js";

const router = express.Router();
const exportReportInstance = new exportReportController();

router.get("/getReportsDataSet",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getReportsDataSet);
router.post("/getAllReports",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getAllReports);
router.post("/getProductiveReport",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getProductiveReport);
router.post("/getDeptPerformReport",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getDeptPerformReport);
router.post("/getAttendanceReport", authMiddleware,verifyAdminMiddleware,   exportReportInstance.getAttendanceReport);
router.post("/getApplicationUsageReport", authMiddleware,verifyAdminMiddleware,   exportReportInstance.getApplicationUsageReport);
router.post("/getUnauthorizedWebReport", authMiddleware,verifyAdminMiddleware,   exportReportInstance.getUnauthorizedWebReport);
router.get("/getTeamList",authMiddleware,verifyAdminMiddleware, exportReportInstance.getTeamList);
router.get("/getMemberList",authMiddleware,verifyAdminMiddleware, exportReportInstance.getMemberList);
router.post("/getBrowserHistoryReport",authMiddleware,verifyAdminMiddleware, exportReportInstance.getBrowserHistoryReport);

export default router;
