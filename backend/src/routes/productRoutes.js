import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  getCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  toggleProductVisibility 
} from '../controllers/productController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/toggle-visibility', toggleProductVisibility);
router.delete('/:id', deleteProduct);

export default router;
