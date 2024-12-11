import express from "express";
const router = express.Router();
import chartController from "../../app/controllers/admin/Charts/chartController.js";

router.get('/productiveApps',chartController.productiveChart);


export default router;
