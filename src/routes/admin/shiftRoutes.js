import express from "express";
import shiftController from "../../app/controllers/admin/shiftController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

const router = express.Router();
const shiftInstance = new shiftController();

router.get("/getAllShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.getAllShift);
router.get("/getSpecificShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.getSpecificShift);
router.post("/addShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.addShift);
router.put("/updateShift", authMiddleware,verifyAdminMiddleware,   shiftInstance.updateShift);
router.delete("/deleteShift", authMiddleware,verifyAdminMiddleware,   shiftInstance.deleteShift);

export default router;
