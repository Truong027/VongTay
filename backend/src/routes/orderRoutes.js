import { Router } from 'express';
import { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus,
  updateOrder,
  deleteOrder
} from '../controllers/orderController.js';

const router = Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
