import express from "express";
import authController from "../../app/controllers/auth/authController.js";

const router = express.Router();
const authInstance = new authController();

router.post("/register", authInstance.register);
router.post("/login", authInstance.login);
router.post("/admin/login", authInstance.login);

export default router;
