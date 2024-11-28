import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import desigController from "../../app/controllers/admin/desigController.js";

const router = express.Router();
const desigInstance = new desigController();

router.get("/getAllDesig",  authMiddleware,verifyAdminMiddleware,   desigInstance.getAllDesig);
router.post("/addDesig",  authMiddleware,verifyAdminMiddleware,   desigInstance.addDesig);
router.post("/updateDesig", authMiddleware,verifyAdminMiddleware,   desigInstance.updateDesig);
router.post("/deleteDesig", authMiddleware,verifyAdminMiddleware,   desigInstance.deleteDept);

export default router;
