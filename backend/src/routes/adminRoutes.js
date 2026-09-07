import { Router } from 'express';
import { getAdminStats, syncNeonDatabase, getDatabaseTelemetry } from '../controllers/adminController.js';
import { getAllUsers, createUser, updateUserRole, deleteUser } from '../controllers/authController.js';

const router = Router();

router.get('/stats', getAdminStats);
router.get('/telemetry', getDatabaseTelemetry);
router.post('/sync-neon', syncNeonDatabase);

// User management endpoints
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
