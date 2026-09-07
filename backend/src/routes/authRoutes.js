import { Router } from 'express';
import { register, login, getMe, updateDatabaseConnection } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.post('/configure-db', updateDatabaseConnection);

export default router;
