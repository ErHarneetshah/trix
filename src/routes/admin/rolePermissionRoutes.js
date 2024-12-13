import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import rolePermissionController from "../../app/controllers/admin/rolePermissionController.js";

const router = express.Router();
const rolePermissionInstance = new rolePermissionController();

router.get("/getAllRolePermission",  authMiddleware,verifyAdminMiddleware,   rolePermissionInstance.getAllRolePermissions);
router.put("/updateRolePermission", authMiddleware,verifyAdminMiddleware,   rolePermissionInstance.updateRolePermission);

export default router;
