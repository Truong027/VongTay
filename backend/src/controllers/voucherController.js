import { 
  dbGetVouchers, 
  dbValidateAndApplyVoucher,
  dbCreateVoucher,
  dbUpdateVoucher,
  dbDeleteVoucher,
  dbToggleVoucherActive
} from '../data/dbStore.js';

export const getVouchers = async (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const vouchers = await dbGetVouchers(includeInactive);
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

export const createVoucher = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, description, isActive, expiresAt } = req.body;
    
    if (!code || !discountValue) {
      return res.status(400).json({
        success: false,
        message: 'Mã giảm giá và giá trị chiết khấu là bắt buộc'
      });
    }

    const created = await dbCreateVoucher({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      description,
      isActive,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: `Tạo mã giảm giá "${created.code}" thành công`,
      data: created
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Lỗi tạo mã giảm giá'
    });
  }
};

export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await dbUpdateVoucher(id, req.body);
    res.json({
      success: true,
      message: `Cập nhật mã giảm giá "${updated.code}" thành công`,
      data: updated
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Lỗi cập nhật mã giảm giá'
    });
  }
};

export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbDeleteVoucher(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Lỗi xóa mã giảm giá'
    });
  }
};

export const toggleVoucherActive = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbToggleVoucherActive(id);
    res.json({
      success: true,
      message: `Đã ${result.isActive ? 'kích hoạt' : 'tạm ngưng'} mã giảm giá "${result.code}"`,
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Lỗi chuyển trạng thái mã giảm giá'
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

