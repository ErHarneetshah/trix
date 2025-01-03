import express from "express";
import shiftController from "../../app/controllers/admin/shiftController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";

const router = express.Router();
const shiftInstance = new shiftController();

router.get("/getAllShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.getAllShift);
router.post("/addShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.addShift);
router.post("/updateShift", authMiddleware,verifyAdminMiddleware,   shiftInstance.updateShift);
router.post("/deleteShift", authMiddleware,verifyAdminMiddleware,   shiftInstance.deleteShift);

export default router;
