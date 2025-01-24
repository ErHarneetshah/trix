import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import teamMemberController from "../../app/controllers/admin/teamMemberController.js";

const router = express.Router();
const teamMemberInstance = new teamMemberController();

router.get("/getAllTeamMembers",  authMiddleware,   teamMemberInstance.getAllTeamMembers);
router.get("/getSpecificTeamMembers",  authMiddleware,   teamMemberInstance.getSpecificTeamMembers);
router.get("/getMembersInTeam",  authMiddleware,   teamMemberInstance.getMembersInTeam);
router.post("/addTeamMembers",  authMiddleware,   teamMemberInstance.addTeamMembers);
router.put("/updateTeamMembers", authMiddleware,   teamMemberInstance.updateTeamMembers);
router.put("/updateTeamMemberSettings", authMiddleware,   teamMemberInstance.updateSettings);
router.get("/getTeamList",authMiddleware ,teamMemberInstance.getTeamlist);
router.post("/generatePassword", authMiddleware,   teamMemberInstance.generateNewPassword);
router.post("/deactivateTeamMember", authMiddleware,   teamMemberInstance.deactivateActivateTeamMember);
router.get("/getUserScreenshots", authMiddleware,   teamMemberInstance.getUserScreenshots);
router.get("/setBucketStorePath", teamMemberInstance.setBucketstorePath);


export default router;
