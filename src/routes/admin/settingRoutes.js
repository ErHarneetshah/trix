import express from "express";
import authMiddleware from "../../app/middlewares/authMiddleware.js";
import verifyAdminMiddleware from "../../app/middlewares/verifyAdminMiddleware.js";
import settingsController from "../../app/controllers/admin/settingsController.js";
import emailGatewayController from "../../app/controllers/admin/emailGatewayController.js";
import languageController from "../../app/controllers/admin/languageController.js";
import fileUpload from "../../utils/file-upload.js";

const router = express.Router();

const uploadImageWithPath = async (req, res, next) => {
  try {
    // //console.log("----------------------- Upload Image Path ------------------------");
    req.headers["mypath"] = "logos"; // Set the 'mypath' header to 'logos'
    return fileUpload(req, res, next); // Call the fileUpload utility
    // next();
  } catch (error) {
    console.error("Error in UploadImageWithPath:", error);
    res.status(500).json({ error: "File upload failed" });
  }
};


router.get("/", (req, res) => {
  res.json({ test: "value" }); // Sending a JSON response
});


router.get('/get-admin-details', authMiddleware,  settingsController.getAdminDetails);
router.put('/update-admin-details', authMiddleware,  settingsController.updateAdminDetails);

router.post('/add-blocked-websites', authMiddleware,  settingsController.addBlockWebsites);
router.get('/get-blocked-websites', authMiddleware,  settingsController.getBlockedWebsites);
router.post('/update-sites-status', authMiddleware,  settingsController.updateSitesStatus);

router.post('/add-productive-apps', authMiddleware,  uploadImageWithPath, settingsController.addProductiveApps);
router.get('/get-app-info', authMiddleware,  settingsController.getAppInfo);

router.get('/get-report-status', authMiddleware,  settingsController.getReportStatus);
router.put('/update-report-status', authMiddleware,  settingsController.updateReportSettings);

//email gateway routes
router.post('/add-email-gateways', authMiddleware,  emailGatewayController.addEmailGateeways);
router.post('/check-email-server', authMiddleware,  emailGatewayController.checkEmailServer);
router.get('/get-email-list', authMiddleware,  emailGatewayController.getEmailList);


//add productive websites
router.post('/add-productive-websites', authMiddleware,  settingsController.addProductiveWebsites);
router.get('/get-productive-websites', authMiddleware,  settingsController.getProductiveWebsites);

//language settings routes
router.get('/get-language-dropdown', authMiddleware,  languageController.getLanguageDropdown);
router.put('/update-language', authMiddleware,  languageController.updateLanguage);
router.get('/get-theme-status', authMiddleware,  languageController.getThemeStatus);


export default router;

