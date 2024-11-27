import express from 'express';
import authRouter from './auth/authRoutes.js'
import deptRouter from './admin/deptRoutes.js'

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin/dept', authRouter);

export default router;
