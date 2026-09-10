import { Router } from 'express';
import { 
  getCharms, 
  getCharmById, 
  createCharm, 
  updateCharm, 
  deleteCharm, 
  toggleCharmStock 
} from '../controllers/charmController.js';

const router = Router();

router.get('/', getCharms);
router.get('/:id', getCharmById);
router.post('/', createCharm);
router.put('/:id', updateCharm);
router.delete('/:id', deleteCharm);
router.patch('/:id/toggle-stock', toggleCharmStock);

export default router;
