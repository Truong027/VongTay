import { Router } from 'express';
import { analyzeWristAndRecommend, analyzeBraceletCord, matchBeadsAndCharms } from '../controllers/aiController.js';

const router = Router();

router.post('/analyze-wrist', analyzeWristAndRecommend);
router.post('/analyze-bracelet-cord', analyzeBraceletCord);
router.post('/match-beads-charms', matchBeadsAndCharms);

export default router;
