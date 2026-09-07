import express from 'express';
import { getUserWishlist, toggleUserWishlist, syncUserWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.get('/:userId', getUserWishlist);
router.post('/toggle', toggleUserWishlist);
router.post('/sync', syncUserWishlist);

export default router;
