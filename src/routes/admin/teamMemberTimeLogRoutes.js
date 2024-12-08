import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import teamMemberTimeLogController from "../../app/controllers/admin/teamMemberTimeLogController.js";

const router = express.Router();
const teamMemberLogInstance = new teamMemberTimeLogController();

router.get("/getAllTimeMemberLog",  authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.getAllTeamMemberLog);
// router.post("/addDept",  authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.addDept);
// router.put("/updateDept", authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.updateDept);
// router.delete("/deleteDept", authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.deleteDept);

export default router;
