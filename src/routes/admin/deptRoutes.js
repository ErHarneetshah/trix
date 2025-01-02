import express from "express";
import deptController from "../../app/controllers/admin/deptController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import rolePermissionMiddleware from "../../app/middlewares/rolePermissionMiddleware.js";

const router = express.Router();
const deptInstance = new deptController();

router.get("/getTestMiddleware",  authMiddleware,rolePermissionMiddleware,   deptInstance.getTestData);
router.get("/getAllDept",  authMiddleware,   deptInstance.getAllDept);
router.get("/getDeptDropdown",  authMiddleware,   deptInstance.getDeptDropdown);
router.get("/getSpecificDept",  authMiddleware,   deptInstance.getSpecificDept);
router.post("/addDept",  authMiddleware,   deptInstance.addDept);
router.put("/updateDept", authMiddleware,   deptInstance.updateDept);
router.delete("/deleteDept", authMiddleware,   deptInstance.deleteDept);


export default router;
