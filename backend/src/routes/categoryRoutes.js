import express from 'express';
import { dbGetCategories } from '../data/dbStore.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await dbGetCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp danh mục sản phẩm',
      error: err.message
    });
  }
});

export default router;
