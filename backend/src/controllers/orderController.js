import { 
  dbGetOrders, 
  dbSaveOrder, 
  dbUpdateOrderStatus 
} from '../data/dbStore.js';
import { isNeonConnected } from '../data/neonDb.js';

export const getOrders = async (req, res) => {
  try {
    const { status, search, userId, phone } = req.query;
    const allOrders = await dbGetOrders();
    let result = [...allOrders];

    // Yêu cầu 1: Tài khoản nào chỉ nhìn được đơn tài khoản đó, không nhìn thấy đơn của admin/người khác
    if (userId) {
      result = result.filter(o => {
        if (o.userId && String(o.userId) === String(userId)) return true;
        if (phone && o.phone && String(o.phone).trim() === String(phone).trim()) return true;
        return false;
      });
    } else if (phone) {
      result = result.filter(o => o.phone && String(o.phone).trim() === String(phone).trim());
    }

    if (status && status !== 'all') {
      result = result.filter(o => o.orderStatus === status);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      const qDigits = q.replace(/[^0-9]/g, '');
      const qCleanPhone = q.replace(/[\s.-]/g, '');
      result = result.filter(o => {
        if (!o) return false;
        const oId = (o.id || '').toLowerCase();
        const oIdDigits = oId.replace(/[^0-9]/g, '');
        const oName = (o.customerName || '').toLowerCase();
        const oPhone = (o.phone || '').replace(/[\s.-]/g, '');

        return (
          oId.includes(q) ||
          (qDigits && oIdDigits && oIdDigits.includes(qDigits)) ||
          oName.includes(q) ||
          (qCleanPhone && oPhone && oPhone.includes(qCleanPhone))
        );
      });
    }

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      total: result.length,
      data: result,
      source: isNeonConnected() ? 'Neon PostgreSQL (patient-resonance-16986828)' : 'Local Disk Database (db.json)'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const allOrders = await dbGetOrders();
    const cleanId = (id || '').trim().toLowerCase();
    const cleanDigits = cleanId.replace(/[^0-9]/g, '');
    const cleanPhone = cleanId.replace(/[\s.-]/g, '');

    const order = allOrders.find(o => {
      if (!o) return false;
      const oId = (o.id || '').toLowerCase();
      const oIdDigits = oId.replace(/[^0-9]/g, '');
      const oPhone = (o.phone || '').replace(/[\s.-]/g, '');

      if (oId === cleanId) return true;
      if (cleanDigits && oIdDigits === cleanDigits) return true;
      if (cleanPhone && oPhone === cleanPhone) return true;
      return false;
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customerName, phone, address, items, totalAmount, shippingFee, paymentMethod, note, userId } = req.body;

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ và tên người nhận hàng' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp số điện thoại nhận hàng' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ giao hàng' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Đơn hàng chưa có sản phẩm nào. Vui lòng chọn sản phẩm vào giỏ hàng.' });
    }

    const newId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const calculatedTotal = totalAmount || items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) + (shippingFee || 25000);

    const newOrder = {
      id: newId,
      userId: userId || null,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items,
      totalAmount: calculatedTotal,
      shippingFee: shippingFee || 25000,
      paymentMethod: paymentMethod || 'VietQR',
      paymentStatus: paymentMethod === 'VietQR' ? 'Chờ quét mã VietQR' : 'Chờ thanh toán khi nhận hàng',
      orderStatus: 'Chờ xác nhận',
      note: note || '',
      timeline: [
        { time: formattedDate, status: 'Đơn hàng mới tạo trên Website' }
      ],
      createdAt: now.toISOString()
    };

    // Save to real database (disk db.json and Neon PostgreSQL if connected)
    await dbSaveOrder(newOrder);

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công! Nghệ nhân xưởng sẽ liên hệ xác nhận sớm nhất.',
      data: newOrder,
      savedToNeon: isNeonConnected()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingCode } = req.body;
    const { id } = req.params;

    const updated = await dbUpdateOrderStatus(id, { orderStatus, paymentStatus, trackingCode });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
