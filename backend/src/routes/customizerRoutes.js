import { Router } from 'express';
import { getCustomizerOptions, calculateCustomPrice } from '../controllers/customizerController.js';

const router = Router();

router.get('/options', getCustomizerOptions);
router.post('/calculate', calculateCustomPrice);

export default router;
