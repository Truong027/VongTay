import express from 'express';
import { getReviews, getProductReviews, createReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getReviews);
router.get('/:productId', getProductReviews);
router.post('/', createReview);

export default router;
