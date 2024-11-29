import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import teamController from "../../app/controllers/admin/teamController.js";

const router = express.Router();
const teamInstance = new teamController();

router.get("/getAllTeam",  authMiddleware,verifyAdminMiddleware,   teamInstance.getAllTeam);
router.post("/addTeam",  authMiddleware,verifyAdminMiddleware,   teamInstance.addTeam);
router.post("/updateTeam", authMiddleware,verifyAdminMiddleware,   teamInstance.updateTeam);
router.post("/deleteTeam", authMiddleware,verifyAdminMiddleware,   teamInstance.deleteTeam);

export default router;
