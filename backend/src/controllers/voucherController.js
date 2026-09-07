import { dbGetVouchers, dbValidateAndApplyVoucher } from '../data/dbStore.js';

export const getVouchers = async (req, res) => {
  try {
    const vouchers = await dbGetVouchers();
    res.json({
      success: true,
      data: vouchers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi nạp danh sách mã giảm giá',
      error: err.message
    });
  }
};

export const applyVoucher = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mã giảm giá'
      });
    }

    const result = await dbValidateAndApplyVoucher(code, Number(orderTotal) || 0);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra mã giảm giá',
      error: err.message
    });
  }
};
