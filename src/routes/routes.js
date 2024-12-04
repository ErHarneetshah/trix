import express from 'express';
import authRouter from './auth/authRoutes.js';
import deptRouter from './admin/deptRoutes.js';
import desigRouter from './admin/desigRoutes.js';
import roleRouter from './admin/roleRoutes.js';
import settingRouter from './admin/settingRoutes.js';
import reportRouter from './admin/reportRoutes.js';
//client routes
import userReportRouter from './client/dailyReportRoutes.js';


const router = express.Router();

//admin routes
router.use('/auth', authRouter);
router.use('/admin/dept', deptRouter);
router.use('/admin/desig', desigRouter);
router.use('/admin/role', roleRouter);
router.use('/admin/settings', settingRouter);
router.use('/admin/reports', reportRouter);

//client routes
router.use('/client/reports', userReportRouter);

export default router;
