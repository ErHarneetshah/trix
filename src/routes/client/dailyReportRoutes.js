import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

//client routes
import workReportsController from "../../app/controllers/client/workReportsController.js";
import verifyUser from "../../app/middlewares/verifyUser.js";


router.post('/add-user-report', verifyUser, workReportsController.createReport);
router.get('/get-self-report',   workReportsController.getSelfReport);

export default router;

