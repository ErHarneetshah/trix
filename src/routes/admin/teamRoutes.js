import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import teamController from "../../app/controllers/admin/teamController.js";

const router = express.Router();
const teamInstance = new teamController();

router.get("/getAllTeam",  authMiddleware,   teamInstance.getAllTeam);
router.get("/getTeamDropdown",  authMiddleware,   teamInstance.getTeamDropdown);
router.get("/getTeamUserDropdown",  authMiddleware,   teamInstance.getTeamUserDropdown);
router.get("/getTeamDeptDropdown",  authMiddleware,   teamInstance.getTeamDeptDropdown);
router.get("/getSpecificTeam",  authMiddleware,   teamInstance.getSpecificTeam);
router.post("/addTeam",  authMiddleware,   teamInstance.addTeam);
router.put("/updateTeam", authMiddleware,   teamInstance.updateTeam);
router.delete("/deleteTeam", authMiddleware,   teamInstance.deleteTeam);

export default router;
