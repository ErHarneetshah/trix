import express from "express";
import authController from "../../app/controllers/auth/authController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";

const router = express.Router();
const authInstance = new authController();

router.post("/register", (req, res) => {
  res.status(501).json({
    status: 0,
    message: "This endpoint is not working yet. Please check back later.",
  });
});

// router.post("/register", authInstance.register);
router.post("/login", authInstance.login);
router.post("/logout", authMiddleware, authInstance.logout);
router.post("/users",authMiddleware,authInstance.device);
router.get("/absent",authMiddleware,authInstance.absent);
router.get('/getBlockedWebsite',authMiddleware,authInstance.blockedlist);
router.post("/markall_notification",authMiddleware, authInstance.markAsRead);
router.get("/get_notification",authMiddleware, authInstance.notification_page);
router.put("/advanced_setting",authMiddleware, authInstance.advanced_setting)

export default router;
