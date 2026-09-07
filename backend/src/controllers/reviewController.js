import { dbGetReviews, dbCreateReview } from '../data/dbStore.js';

export const getReviews = async (req, res) => {
  try {
    const { productId } = req.query;
    const reviews = await dbGetReviews(productId || null);
    res.json({
      success: true,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp đánh giá sản phẩm',
      error: err.message
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await dbGetReviews(productId);
    res.json({
      success: true,
      data: reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp đánh giá sản phẩm',
      error: err.message
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId, userId, customerName, rating, wristFit, comment, photos } = req.body;
    if (!productId || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã sản phẩm và nội dung nhận xét'
      });
    }

    const review = await dbCreateReview({
      productId,
      userId,
      customerName,
      rating: Number(rating) || 5,
      wristFit,
      comment,
      photos
    });

    res.status(201).json({
      success: true,
      data: review,
      message: 'Cảm ơn bạn đã gửi đánh giá trải nghiệm vòng tay thủ công!'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi gửi đánh giá sản phẩm',
      error: err.message
    });
  }
};
