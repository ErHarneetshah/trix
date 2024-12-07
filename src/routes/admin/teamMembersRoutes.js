import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import teamMemberController from "../../app/controllers/admin/teamMemberController.js";

const router = express.Router();
const teamMemberInstance = new teamMemberController();

router.get("/getAllTeamMembers",  authMiddleware,verifyAdminMiddleware,   teamMemberInstance.getAllTeamMembers);
router.post("/addTeamMembers",  authMiddleware,verifyAdminMiddleware,   teamMemberInstance.addTeamMembers);
router.post("/updateTeamMembers", authMiddleware,verifyAdminMiddleware,   teamMemberInstance.updateTeamMembers);
router.put('/update',verifyAdminMiddleware,   teamMemberInstance.updatesetting)
export default router;
