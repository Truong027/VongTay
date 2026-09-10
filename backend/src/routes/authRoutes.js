import { Router } from 'express';
import { register, login, validateSession, logout, getMe, updateDatabaseConnection, updateProfile } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/validate-session', validateSession);
router.get('/validate-session', validateSession);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/configure-db', updateDatabaseConnection);

export default router;
