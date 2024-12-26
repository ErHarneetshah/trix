import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import teamMemberTimeLogController from "../../app/controllers/admin/teamMemberTimeLogController.js";

const router = express.Router();
const teamMemberLogInstance = new teamMemberTimeLogController();

router.get("/getAllTimeMemberLog",  authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.getAllTeamMemberLog);
router.get("/getTimeMemberLogFiltered",  authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.getTeamMemberLogFiltered);
router.get("/getTimeMemberLogFiltered2",  authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.getTeamMemberLogFiltered2);
router.get("/getFilterCount",  authMiddleware,verifyAdminMiddleware,   teamMemberLogInstance.getFilterCount);

export default router;
