import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import reportingManagerController from "../../app/controllers/admin/reportingManagerController.js";

const router = express.Router();
const reportManagerInstance = new reportingManagerController();

router.get("/getAllReportManager",  authMiddleware,verifyAdminMiddleware,   reportManagerInstance.getAllReportManager);
router.get("/getReportManagerDropdown",  authMiddleware,verifyAdminMiddleware,   reportManagerInstance.getReportManagerDropdown);
// router.post("/addReportManager",  authMiddleware,verifyAdminMiddleware,   reportManagerInstance.addReportManager);
router.put("/updateReportManager", authMiddleware,verifyAdminMiddleware,   reportManagerInstance.updateReportManager);
router.delete("/deleteReportManager", authMiddleware,verifyAdminMiddleware,   reportManagerInstance.deleteReportManager);

export default router;
