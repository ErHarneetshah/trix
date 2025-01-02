import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

//client routes
import reportsController from "../../app/controllers/admin/reportsController.js";

router.get('/get-all-report',   authMiddleware,   reportsController.retrieveAllReport);
router.get('/get-user-report',   authMiddleware,   reportsController.retrieveUserReport);
router.put('/approve-disapprove-report',   authMiddleware,   reportsController.approveDisaproveReport);

export default router;
