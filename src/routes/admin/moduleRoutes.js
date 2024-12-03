import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import moduleController from "../../app/controllers/admin/moduleController.js";

const router = express.Router();
const moduleInstance = new moduleController();

router.get("/getAllModule",  authMiddleware,verifyAdminMiddleware,   moduleInstance.getAllModules);
router.post("/addModule",  authMiddleware,verifyAdminMiddleware,   moduleInstance.addModules);
router.put("/updatemodule", authMiddleware,verifyAdminMiddleware,   moduleInstance.updateModules);
router.delete("/deleteModule", authMiddleware,verifyAdminMiddleware,   moduleInstance.deleteModules);

export default router;
