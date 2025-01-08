import express from "express";
const router = express.Router();
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import paymentController from "../../app/controllers/admin/paymentController.js";

const paymentInstance = new paymentController();

router.get('/getPaymentPlans', authMiddleware, paymentInstance.getPaymentPlans);
router.post('/buyPaymentPlan', authMiddleware, paymentInstance.buyPaymentPlan);

export default router;
