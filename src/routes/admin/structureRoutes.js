import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import treeStructureController from "../../app/controllers/treeStructureController.js";

const router = express.Router();



router.get("/view", authMiddleware, treeStructureController.viewTreeStructure);
// router.get("/getShiftDropdown",  authMiddleware,   shiftInstance.getShiftDropdown);
// router.get("/getSpecificShift",  authMiddleware,   shiftInstance.getSpecificShift);
// router.post("/addShift",  authMiddleware,   shiftInstance.addShift);
// router.put("/updateShift", authMiddleware,   shiftInstance.updateShift);
// router.delete("/deleteShift", authMiddleware,   shiftInstance.deleteShift);

export default router;
