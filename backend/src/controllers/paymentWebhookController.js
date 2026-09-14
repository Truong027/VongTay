import { dbGetOrders, dbGetOrderById, dbUpdateOrder } from '../data/dbStore.js';

/**
 * Handle incoming payment webhook from SePay, Casso, or VietQR gateway
 * Automatically matches transaction content with order ID and marks order as paid.
 */
export const handlePaymentWebhook = async (req, res) => {
  try {
    console.log('🔔 [Payment Webhook Received]:', JSON.stringify(req.body));

    // Support both SePay object format and Casso array format
    const body = req.body || {};
    let transactions = [];

    if (Array.isArray(body.data)) {
      // Casso format
      transactions = body.data;
    } else if (body.id || body.transferAmount || body.content || body.description) {
      // SePay / Direct format
      transactions = [body];
    } else if (Array.isArray(body)) {
      transactions = body;
    }

    if (!transactions.length) {
      return res.status(200).json({ success: true, message: 'No transactions in payload' });
    }

    const allOrders = await dbGetOrders();
    const updatedOrders = [];

    for (const tx of transactions) {
      const content = String(tx.content || tx.description || tx.code || '').toUpperCase();
      const amount = Number(tx.transferAmount || tx.amount || tx.amountIn || 0);
      const txId = String(tx.id || tx.tid || tx.referenceCode || Date.now());

      if (!content) continue;

      // Find matched order by looking for order ID or order code in content
      const matchedOrder = allOrders.find(order => {
        const orderIdUpper = String(order.id || '').toUpperCase();
        const trackingCodeUpper = String(order.trackingCode || '').toUpperCase();
        
        // Exact match or sub-token match
        if (orderIdUpper && content.includes(orderIdUpper)) return true;
        if (trackingCodeUpper && content.includes(trackingCodeUpper)) return true;
        
        // Match numbers-only suffix if present (e.g. KV-1741234567 -> 1741234567)
        const numericPart = orderIdUpper.replace(/\D/g, '');
        if (numericPart && numericPart.length >= 6 && content.includes(numericPart)) return true;

        return false;
      });

      if (matchedOrder) {
        console.log(`✅ [Webhook Match] Found Order ${matchedOrder.id} for transaction ${txId} (Amount: ${amount})`);
        
        // Check if already paid
        if (matchedOrder.paymentStatus === 'Đã thanh toán' || matchedOrder.paymentStatus === 'paid') {
          console.log(`ℹ️ [Webhook] Order ${matchedOrder.id} was already marked as paid.`);
          updatedOrders.push(matchedOrder.id);
          continue;
        }

        // Update order status
        const updatePayload = {
          paymentStatus: 'Đã thanh toán',
          orderStatus: matchedOrder.orderStatus === 'Chờ xác nhận' ? 'Đã tiếp nhận' : matchedOrder.orderStatus,
          paymentMethod: 'VietQR Chuyển khoản tự động',
          paidAt: new Date().toISOString(),
          paymentTransactionId: txId,
          paymentAmountReceived: amount,
          timeline: [
            ...(matchedOrder.timeline || []),
            {
              time: new Date().toISOString(),
              status: 'Thanh toán thành công',
              desc: `Hệ thống tự động kích hoạt thanh toán qua ngân hàng (GD: ${txId}, Số tiền: ${new Intl.NumberFormat('vi-VN').format(amount)}đ).`
            }
          ]
        };

        const updated = await dbUpdateOrder(matchedOrder.id, updatePayload);
        if (updated) {
          updatedOrders.push(matchedOrder.id);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Đã xử lý webhook thành công, cập nhật ${updatedOrders.length} đơn hàng`,
      updatedOrders
    });
  } catch (error) {
    console.error('❌ [Payment Webhook Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Check payment status for a specific order (for real-time frontend polling)
 */
export const getOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await dbGetOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const isPaid = order.paymentStatus === 'Đã thanh toán' || 
                   order.paymentStatus === 'paid' || 
                   order.paymentStatus === 'completed';

    res.json({
      success: true,
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      isPaid,
      paidAt: order.paidAt || null,
      totalAmount: order.totalAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
