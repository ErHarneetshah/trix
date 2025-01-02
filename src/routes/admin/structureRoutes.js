import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import treeStructureController from "../../app/controllers/treeStructureController.js";

const router = express.Router();



router.get("/view", authMiddleware, treeStructureController.viewTreeStructure);
// router.get("/getShiftDropdown",  authMiddleware,verifyAdminMiddleware,   shiftInstance.getShiftDropdown);
// router.get("/getSpecificShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.getSpecificShift);
// router.post("/addShift",  authMiddleware,verifyAdminMiddleware,   shiftInstance.addShift);
// router.put("/updateShift", authMiddleware,verifyAdminMiddleware,   shiftInstance.updateShift);
// router.delete("/deleteShift", authMiddleware,verifyAdminMiddleware,   shiftInstance.deleteShift);

export default router;
