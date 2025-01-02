import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import teamMemberController from "../../app/controllers/admin/teamMemberController.js";

const router = express.Router();
const teamMemberInstance = new teamMemberController();

router.get("/getAllTeamMembers",  authMiddleware,verifyAdminMiddleware,   teamMemberInstance.getAllTeamMembers);
router.get("/getSpecificTeamMembers",  authMiddleware,verifyAdminMiddleware,   teamMemberInstance.getSpecificTeamMembers);
router.get("/getMembersInTeam",  authMiddleware,verifyAdminMiddleware,   teamMemberInstance.getMembersInTeam);
router.post("/addTeamMembers",  authMiddleware,verifyAdminMiddleware,   teamMemberInstance.addTeamMembers);
router.put("/updateTeamMembers", authMiddleware,verifyAdminMiddleware,   teamMemberInstance.updateTeamMembers);
router.put("/updateTeamMemberSettings", authMiddleware,verifyAdminMiddleware,   teamMemberInstance.updateSettings);
router.get("/getTeamList",authMiddleware ,teamMemberInstance.getTeamlist);
router.post("/generatePassword", authMiddleware,verifyAdminMiddleware,   teamMemberInstance.generateNewPassword);
router.post("/deactivateTeamMember", authMiddleware,verifyAdminMiddleware,   teamMemberInstance.deactivateTeamMember);

export default router;
