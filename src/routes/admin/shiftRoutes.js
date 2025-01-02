import express from "express";
import shiftController from "../../app/controllers/admin/shiftController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

const router = express.Router();
const shiftInstance = new shiftController();

router.get("/getAllShift",  authMiddleware,   shiftInstance.getAllShift);
router.get("/getShiftDropdown",  authMiddleware,   shiftInstance.getShiftDropdown);
router.get("/getSpecificShift",  authMiddleware,   shiftInstance.getSpecificShift);
router.post("/addShift",  authMiddleware,   shiftInstance.addShift);
router.put("/updateShift", authMiddleware,   shiftInstance.updateShift);
router.delete("/deleteShift", authMiddleware,   shiftInstance.deleteShift);

export default router;
