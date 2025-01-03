import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import roleController from "../../app/controllers/admin/roleController.js";

const router = express.Router();
const roleInstance = new roleController();

router.get("/getAllRole",  authMiddleware,verifyAdminMiddleware,   roleInstance.getAllRole);
router.post("/addRole",  authMiddleware,verifyAdminMiddleware,   roleInstance.addRole);
router.post("/updateRole", authMiddleware,verifyAdminMiddleware,   roleInstance.updateRole);
router.post("/deleteRole", authMiddleware,verifyAdminMiddleware,   roleInstance.deleteRole);

export default router;
