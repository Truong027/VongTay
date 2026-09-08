import { 
  dbGetOrders, 
  syncAllDataToNeon, 
  getDbTelemetry 
} from '../data/dbStore.js';
import { isNeonConnected, getConnectionInfo, ensureNeonConnected } from '../data/neonDb.js';

export const getAdminStats = async (req, res) => {
  try {
    await ensureNeonConnected();
    const orders = await dbGetOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'Đã thanh toán')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingCrafting = orders.filter(o => 
      o.orderStatus === 'Chờ xác nhận' || o.orderStatus === 'Đang kết hạt thủ công'
    ).length;

    const completedOrders = orders.filter(o => 
      o.orderStatus === 'Đã hoàn thiện, chuẩn bị giao' || o.orderStatus === 'Đang giao hàng' || o.orderStatus === 'Đã giao hàng'
    ).length;

    const telemetry = await getDbTelemetry();

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingCrafting,
        completedOrders,
        inventoryStatus: {
          beadsInStock: 1250,
          silverCharmsInStock: 240,
          cordsRolls: 85
        },
        telemetry,
        recentOrders: orders.slice(0, 8)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncNeonDatabase = async (req, res) => {
  try {
    const result = await syncAllDataToNeon();
    res.json({
      success: true,
      message: 'Đã đồng bộ toàn bộ sản phẩm, tài khoản và đơn hàng thực tế vào Neon Tech PostgreSQL!',
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDatabaseTelemetry = async (req, res) => {
  try {
    await ensureNeonConnected();
    const telemetry = await getDbTelemetry();
    res.json({
      success: true,
      data: {
        ...telemetry,
        connection: getConnectionInfo()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
