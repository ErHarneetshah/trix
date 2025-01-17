import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import treeStructureController from "../../app/controllers/treeStructureController.js";

const router = express.Router();

router.get("/view", authMiddleware, treeStructureController.viewTreeStructure);

export default router;
