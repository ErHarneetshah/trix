import express from "express";
import deptController from "../../app/controllers/admin/deptController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import rolePermissionMiddleware from "../../app/middlewares/rolePermissionMiddleware.js";

const router = express.Router();
const deptInstance = new deptController();

router.get("/getTestMiddleware",  authMiddleware,verifyAdminMiddleware,rolePermissionMiddleware,   deptInstance.getAllDept);
router.get("/getAllDept",  authMiddleware,verifyAdminMiddleware,   deptInstance.getAllDept);
router.get("/getDeptDropdown",  authMiddleware,verifyAdminMiddleware,   deptInstance.getDeptDropdown);
router.get("/getSpecificDept",  authMiddleware,verifyAdminMiddleware,   deptInstance.getSpecificDept);
router.post("/addDept",  authMiddleware,verifyAdminMiddleware,   deptInstance.addDept);
router.put("/updateDept", authMiddleware,verifyAdminMiddleware,   deptInstance.updateDept);
router.delete("/deleteDept", authMiddleware,verifyAdminMiddleware,   deptInstance.deleteDept);

export default router;
