import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import rolePermissionController from "../../app/controllers/admin/rolePermissionController.js";

const router = express.Router();
const rolePermissionInstance = new rolePermissionController();

router.get("/getAllRolePermission",  authMiddleware,   rolePermissionInstance.getAllRolePermissions);
router.put("/updateRolePermission", authMiddleware,   rolePermissionInstance.updateMultipleRolePermission);
router.put("/resetRolePermission",  rolePermissionInstance.resetRolePermissions);
router.get("/viewPermittedRoles", authMiddleware, rolePermissionInstance.viewPermittedRoles);



export default router;
