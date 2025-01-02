import express from "express";
import aiController from "../../app/controllers/admin/AIController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
const router = express.Router();

router.get('/getUserData',authMiddleware, aiController.getUserdata);
router.post('/getUserAnswerStream',authMiddleware, aiController.getUserAnswerStream);
export default router;
