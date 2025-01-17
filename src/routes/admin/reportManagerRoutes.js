import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import reportingManagerController from "../../app/controllers/admin/reportingManagerController.js";

const router = express.Router();
const reportManagerInstance = new reportingManagerController();

router.get("/getAllReportManager",  authMiddleware,   reportManagerInstance.getAllReportManager);
router.get("/getReportManagerDropdown",  authMiddleware,   reportManagerInstance.getReportManagerDropdown);
router.put("/updateReportManager", authMiddleware,   reportManagerInstance.updateReportManager);
// router.post("/addReportManager",  authMiddleware,   reportManagerInstance.addReportManager);
// router.delete("/deleteReportManager", authMiddleware,   reportManagerInstance.deleteReportManager);

//* Under Progress Routes
router.post("/addReportManager",  (req, res) => {
    res.status(200).json({
      message: "This functionality is under construction.",
    });
})

router.delete("/deleteReportManager", (req, res) => {
    res.status(200).json({
      message: "This functionality is under construction.",
    });
  });
  

export default router;
