import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import roleController from "../../app/controllers/admin/roleController.js";

const router = express.Router();
const roleInstance = new roleController();

router.get("/getAllRole",  authMiddleware,   roleInstance.getAllRole);
router.get("/getRoleDropdown",  authMiddleware,   roleInstance.getRoleDropdown);
router.get("/getSpecificRole",  authMiddleware,   roleInstance.getSpecificRole);
router.post("/addRole",  authMiddleware,   roleInstance.addRole);
router.put("/updateRole", authMiddleware,   roleInstance.updateRole);
router.delete("/deleteRole", authMiddleware,   roleInstance.deleteRole);

export default router;
