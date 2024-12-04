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
import moduleRouter from './admin/moduleRoutes.js';
import rolePermissionRouter from './admin/rolePermissionRoutes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin/dept', deptRouter);
router.use('/admin/desig', desigRouter);
router.use('/admin/role', roleRouter);
router.use('/admin/reportManager', reportManagerRouter);
router.use('/admin/team', teamRouter);
router.use('/admin/shift', shiftRouter);
router.use('/admin/teamMember', teamMemberRouter);
router.use('/admin/settings', settingRouter);
router.use('/admin/module', moduleRouter);
router.use('/admin/rolePermission', rolePermissionRouter);

export default router;
