import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

//client routes
import reportsController from "../../app/controllers/admin/reportsController.js";


router.post('/get-user-report/:id', reportsController.retrieveUserReport);
router.post('/approve-disapprove-report',  reportsController.approveDisaproveReport);

export default router;
