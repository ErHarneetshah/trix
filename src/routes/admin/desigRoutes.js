import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import desigController from "../../app/controllers/admin/desigController.js";

const router = express.Router();
const desigInstance = new desigController();

router.get("/getAllDesig",  authMiddleware,verifyAdminMiddleware,   desigInstance.getAllDesig);
router.get("/getDesigDropdown",  authMiddleware,verifyAdminMiddleware,   desigInstance.getDesigDropdown);
router.get("/getSpecificDesig",  authMiddleware,verifyAdminMiddleware,   desigInstance.getSpecificDesig);
router.post("/addDesig",  authMiddleware,verifyAdminMiddleware,   desigInstance.addDesig);
router.put("/updateDesig", authMiddleware,verifyAdminMiddleware,   desigInstance.updateDesig);
router.delete("/deleteDesig", authMiddleware,verifyAdminMiddleware,   desigInstance.deleteDept);

export default router;
