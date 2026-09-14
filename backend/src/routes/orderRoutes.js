import { Router } from 'express';
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';
import {
  handlePaymentWebhook,
  getOrderPaymentStatus
} from '../controllers/paymentWebhookController.js';

const router = Router();

// Payment webhook & status polling
router.post('/payment-webhook', handlePaymentWebhook);
router.get('/:id/payment-status', getOrderPaymentStatus);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
