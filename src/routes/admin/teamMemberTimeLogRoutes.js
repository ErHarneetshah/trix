import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import teamMemberTimeLogController from "../../app/controllers/admin/teamMemberTimeLogController.js";

const router = express.Router();
const teamMemberLogInstance = new teamMemberTimeLogController();

router.get("/getAllTimeMemberLog",  authMiddleware,   teamMemberLogInstance.getAllTeamMemberLog);
router.get("/getTimeMemberLogFiltered",  authMiddleware,   teamMemberLogInstance.getTeamMemberLogFiltered2);
router.get("/getTimeMemberLogFiltered2",  authMiddleware,   teamMemberLogInstance.getTeamMemberLogFiltered2);
router.get("/getFilterCount",  authMiddleware,   teamMemberLogInstance.getFilterCount);

export default router;
