import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import exportReportController from "../../app/controllers/admin/exportReportController.js";

const router = express.Router();
const exportReportInstance = new exportReportController();

router.get("/getReportsDataSet",  authMiddleware,   exportReportInstance.getReportsDataSet);
router.post("/getProductiveReport",  authMiddleware,   exportReportInstance.getProductiveReport);
router.post("/getDeptPerformReport",  authMiddleware,   exportReportInstance.getDeptPerformReport);
router.post("/getAttendanceReport", authMiddleware,   exportReportInstance.getAttendanceReport);
router.post("/getApplicationUsageReport", authMiddleware,   exportReportInstance.getApplicationUsageReport);
router.post("/getUnauthorizedWebReport", authMiddleware,   exportReportInstance.getUnauthorizedWebReport);
// router.post("/getTeamList",authMiddleware, exportReportInstance.getTeamList);
// router.post("/getMemberList",authMiddleware, exportReportInstance.getMemberList);
router.post("/getBrowserHistoryReport",authMiddleware, exportReportInstance.getBrowserHistoryReport);
router.get("/downloadExportReport", exportReportInstance.downloadExportReport);
router.get("/downloadExportReportTest", exportReportInstance.downloadExportReportTest);



router.get("/getExportHistory",authMiddleware, exportReportInstance.getExportHistoryReport);
router.get("/viewHistory",authMiddleware, exportReportInstance.viewFile);

export default router;
