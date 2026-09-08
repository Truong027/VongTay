import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customizerRoutes from './routes/customizerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';

// Phòng vệ chống sập tiến trình Node.js (Anti-crash handlers)
process.on('uncaughtException', (err) => {
  console.error('🛡️ Bắt lỗi ngoại lệ toàn cục (Uncaught Exception):', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🛡️ Bắt Promise Rejection toàn cục:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Allow up to 20MB for webcam base64 photo capture
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(morgan('dev'));

// Routes across all 10 tables
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/customizer', customizerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Vòng Tay Handmade API Service',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 30px; border-radius: 12px; background: #faf7f2; border: 1px solid #e2d9cd; color: #2e261f;">
      <h1 style="color: #b86b4b; margin-top: 0;">📿 VÒNG TAY HANDMADE BACKEND API</h1>
      <p>Hệ thống máy chủ dịch vụ quản lý vòng tay thủ công mỹ nghệ, phối charm, AI Scanner & Neon Database.</p>
      <ul>
        <li><a href="/api/products" style="color: #b86b4b;">GET /api/products</a> - Danh sách sản phẩm vòng tay</li>
        <li><a href="/api/products/categories" style="color: #b86b4b;">GET /api/products/categories</a> - Danh mục sản phẩm</li>
        <li><a href="/api/customizer/options" style="color: #b86b4b;">GET /api/customizer/options</a> - Tùy chọn phối vòng tự làm</li>
        <li><a href="/api/orders" style="color: #b86b4b;">GET /api/orders</a> - Danh sách đơn hàng</li>
        <li><a href="/api/admin/stats" style="color: #b86b4b;">GET /api/admin/stats</a> - Thống kê xưởng & doanh số</li>
        <li><a href="/api/auth/me" style="color: #b86b4b;">GET /api/auth/me</a> - Trạng thái xác thực & Neon DB</li>
        <li><strong>POST /api/ai/analyze-wrist</strong> - AI Gemini Vision nhận diện cổ tay qua camera</li>
      </ul>
      <p style="font-size: 13px; color: #887869;">Backend đang hoạt động ổn định trên cổng ${PORT}.</p>
    </div>
  `);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống máy chủ'
  });
});

if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`✨ Backend API Vòng Tay Handmade đang chạy tại http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Cổng ${PORT} đang có tiến trình backend khác hoạt động. Dịch vụ vẫn sẵn sàng tại http://localhost:${PORT}`);
    } else {
      console.error('Lỗi máy chủ Express:', err);
    }
  });
}

export default app;
