import express from "express";
import authController from "../../app/controllers/auth/authController.js";

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
router.post("/admin/login", authInstance.login);

export default router;
