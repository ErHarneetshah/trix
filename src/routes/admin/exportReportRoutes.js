import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import exportReportController from "../../app/controllers/admin/exportReportController.js";

const router = express.Router();
const exportReportInstance = new exportReportController();

router.post("/getReportsDataSet",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getReportsDataSet);
router.post("/getAllReports",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getAllReports);
router.post("/getProductiveReport",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getProductiveReport);
router.post("/getDeptPerformReport",  authMiddleware,verifyAdminMiddleware,   exportReportInstance.getDeptPerformReport);
router.post("/getAttendanceReport", authMiddleware,verifyAdminMiddleware,   exportReportInstance.getAttendanceReport);
router.post("/getApplicationUsageReport", authMiddleware,verifyAdminMiddleware,   exportReportInstance.getApplicationUsageReport);
router.post("/getUnauthorizedWebReport", authMiddleware,verifyAdminMiddleware,   exportReportInstance.getUnauthorizedWebReport);
router.post("/getTeamList",authMiddleware,verifyAdminMiddleware, exportReportInstance.getTeamList);
router.post("/getMemberList",authMiddleware,verifyAdminMiddleware, exportReportInstance.getMemberList);
router.post("/getBrowserHistoryReport",authMiddleware,verifyAdminMiddleware, exportReportInstance.getBrowserHistoryReport);
router.post("/downloadExportReport",authMiddleware,verifyAdminMiddleware, exportReportInstance.downloadExportReport);


router.get("/getExportHistory",authMiddleware,verifyAdminMiddleware, exportReportInstance.getExportHistoryReport);

export default router;
