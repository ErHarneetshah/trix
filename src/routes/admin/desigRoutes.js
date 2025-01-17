import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import desigController from "../../app/controllers/admin/desigController.js";

const router = express.Router();
const desigInstance = new desigController();

router.get("/getAllDesig",  authMiddleware,   desigInstance.getAllDesig);
router.get("/getDesigDropdown",  authMiddleware,   desigInstance.getDesigDropdown);
router.get("/getSpecificDesig",  authMiddleware,   desigInstance.getSpecificDesig);
router.post("/addDesig",  authMiddleware,   desigInstance.addDesig);
router.put("/updateDesig", authMiddleware,   desigInstance.updateDesig);
router.delete("/deleteDesig", authMiddleware,   desigInstance.deleteDesig);

export default router;
