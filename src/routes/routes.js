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
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        message: 'CORS is working correctly for the /auth route!',
        success: true,
    });
});
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
router.use('/client/reports', userReportRouter);
export default router;
