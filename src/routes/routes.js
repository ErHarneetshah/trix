import express from 'express';
import authRouter from './auth/authRoutes.js';
import deptRouter from './admin/deptRoutes.js';
import desigRouter from './admin/desigRoutes.js';
import roleRouter from './admin/roleRoutes.js';
import reportManagerRouter from './admin/reportManagerRoutes.js';
import teamRouter from './admin/teamRoutes.js';
import shiftRouter from './admin/shiftRoutes.js';
import teamMemberRouter from './admin/teamMembersRoutes.js';
import settingRouter from './admin/settingRoutes.js';
import rolePermissionRouter from './admin/rolePermissionRoutes.js';
import reportRouter from './admin/reportRoutes.js';
import teamTimeLogRouter from './admin/teamMemberTimeLogRoutes.js';
import userReportRouter from './client/dailyReportRoutes.js';
import teamStructure from './admin/structureRoutes.js';
import chartRouter from './admin/chartRoutes.js';
import dashboardDataRouter from './admin/dashboardRoutes.js';
import aiRoutes from './admin/aiRoutes.js';
import exportReportRoutes from './admin/exportReportRoutes.js';
import cronFunctions from '../cron/cronFunctions.js'
import compareReportRouter from './admin/compareReportRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'CORS is working correctly for the /auth route!',
        success: true,
    });
});

// testing route
router.get('/test', cronFunctions.sendEmailWithReports);
router.use('/auth', authRouter);
router.use('/admin/dept', deptRouter);
router.use('/admin/desig', desigRouter);
router.use('/admin/role', roleRouter);
router.use('/admin/reportManager', reportManagerRouter);
router.use('/admin/team', teamRouter);
router.use('/admin/shift', shiftRouter);
router.use('/admin/teamMember', teamMemberRouter);
router.use('/admin/settings', settingRouter);
router.use('/admin/rolePermission', rolePermissionRouter);
router.use('/admin/workReports', reportRouter);
router.use('/admin/teamTimeLog', teamTimeLogRouter);
router.use('/admin/exportReports', exportReportRoutes);

// router.use('/admin/dashboard',dashboardRoutes)
router.use('/client/reports', userReportRouter);
router.use('/admin/tree', teamStructure);
router.use('/charts', chartRouter);
router.use('/dashboard', dashboardDataRouter);
router.use('/admin/ai',aiRoutes)
router.use('/admin/compare',compareReportRouter );

export default router;
