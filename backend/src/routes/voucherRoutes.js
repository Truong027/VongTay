import express from 'express';
import { 
  getVouchers, 
  applyVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  toggleVoucherActive
} from '../controllers/voucherController.js';

const router = express.Router();

// Public / Client routes
router.get('/', getVouchers);
router.post('/apply', applyVoucher);

// Admin CRUD routes
router.post('/', createVoucher);
router.put('/:id', updateVoucher);
router.delete('/:id', deleteVoucher);
router.patch('/:id/toggle', toggleVoucherActive);

export default router;

