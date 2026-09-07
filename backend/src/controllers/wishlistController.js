import { dbGetWishlist, dbToggleWishlist, dbSyncWishlist } from '../data/dbStore.js';

export const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await dbGetWishlist(userId);
    res.json({
      success: true,
      data: items
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp danh sách yêu thích',
      error: err.message
    });
  }
};

export const toggleUserWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId hoặc productId'
      });
    }

    const result = await dbToggleWishlist(userId, productId);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật danh sách yêu thích',
      error: err.message
    });
  }
};

export const syncUserWishlist = async (req, res) => {
  try {
    const { userId, productIds } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu userId'
      });
    }

    const items = await dbSyncWishlist(userId, productIds || []);
    res.json({
      success: true,
      data: items,
      message: 'Đồng bộ danh sách yêu thích thành công'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đồng bộ danh sách yêu thích',
      error: err.message
    });
  }
};
