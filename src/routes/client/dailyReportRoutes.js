import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import workReportsController from "../../app/controllers/client/workReportsController.js";
import verifyUserMiddleware from "../../app/middlewares/verifyUserMiddleware.js";

const router = express.Router();

router.post('/add-user-report', authMiddleware,verifyUserMiddleware, workReportsController.createReport);
router.get('/get-self-report', authMiddleware,verifyUserMiddleware, workReportsController.getSelfReport);

export default router;