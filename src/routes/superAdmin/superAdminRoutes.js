import express from "express";
import  superAdminController from "../../app/controllers/superAdmin/superAdminController.js"

const router = express.Router();

router.get('/getRegisterUsers', superAdminController.getAllAdmins);

export default router;
