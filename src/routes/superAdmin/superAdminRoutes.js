import express from "express";
const router = express.Router();

import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import  superAdminController from "../../app/controllers/superAdmin/superAdminController.js";




router.get('/admin', superAdminController.getAllAdmins);


export default router;
