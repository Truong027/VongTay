import express from 'express';
import { 
  getBeads, 
  getBeadById, 
  createBead, 
  updateBead, 
  deleteBead, 
  toggleBeadStock 
} from '../controllers/beadController.js';

const router = express.Router();

router.get('/', getBeads);
router.get('/:id', getBeadById);
router.post('/', createBead);
router.put('/:id', updateBead);
router.delete('/:id', deleteBead);
router.patch('/:id/toggle-stock', toggleBeadStock);

export default router;
