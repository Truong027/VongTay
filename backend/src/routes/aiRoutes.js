import { Router } from 'express';
import { analyzeWristAndRecommend, analyzeBraceletCord } from '../controllers/aiController.js';

const router = Router();

router.post('/analyze-wrist', analyzeWristAndRecommend);
router.post('/analyze-bracelet-cord', analyzeBraceletCord);

export default router;
