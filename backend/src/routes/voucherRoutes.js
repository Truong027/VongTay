import express from 'express';
import { getVouchers, applyVoucher } from '../controllers/voucherController.js';

const router = express.Router();

router.get('/', getVouchers);
router.post('/apply', applyVoucher);

export default router;
