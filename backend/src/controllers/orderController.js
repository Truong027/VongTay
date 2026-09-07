import { 
  dbGetOrders, 
  dbSaveOrder, 
  dbUpdateOrderStatus 
} from '../data/dbStore.js';
import { isNeonConnected } from '../data/neonDb.js';

export const getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const allOrders = await dbGetOrders();
    let result = [...allOrders];

    if (status && status !== 'all') {
      result = result.filter(o => o.orderStatus === status);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => 
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.phone && o.phone.includes(q))
      );
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
    const order = allOrders.find(o => o.id === id);
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
    const { customerName, phone, address, items, totalAmount, shippingFee, paymentMethod, note } = req.body;

    if (!customerName || !phone || !address || !items || !items.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp đầy đủ thông tin: họ tên, số điện thoại, địa chỉ và sản phẩm' 
      });
    }

    const newId = `DH-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const calculatedTotal = totalAmount || items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0) + (shippingFee || 25000);

    const newOrder = {
      id: newId,
      customerName,
      phone,
      address,
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
