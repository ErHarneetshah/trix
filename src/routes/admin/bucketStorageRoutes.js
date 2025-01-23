import express from "express";
import bucketStorageController from "../../app/controllers/admin/bucketStorageController.js";
import authMiddleware from "../../app/middlewares/authMiddleware.js";

const router = express.Router();

router.get('/getAllBucketCredentials',authMiddleware, bucketStorageController.getAllBucketCredentials);
router.get('/getSingleBucketCredential',authMiddleware, bucketStorageController.getSingleBucketCredential);
router.post('/addBucketCredential', authMiddleware, bucketStorageController.addBucketCredential);
router.put('/updateBucketCredential', authMiddleware, bucketStorageController.updateBucketCredential);
router.delete('/deleteBucketCredential', authMiddleware, bucketStorageController.deleteBucketCredential);

export default router;

