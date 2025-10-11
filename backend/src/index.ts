import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger/config';

// 라우트 임포트
import authRoutes from './routes/auth.routes';
import booksRoutes from './routes/books.routes';
// TODO: 추가 라우트
// import readingRoutes from './routes/reading.routes';
// import recordsRoutes from './routes/records.routes';
// import reviewsRoutes from './routes/reviews.routes';
// import uploadRoutes from './routes/upload.routes';
// import aiRoutes from './routes/ai.routes';

// 환경 변수 로드
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 미들웨어 설정
// ============================================

// 보안 헤더
app.use(helmet());

// CORS 설정
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 요청 로깅
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body 파서
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Swagger API 문서
// ============================================

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '독독 (DockDock) API 문서'
}));

// ============================================
// 헬스 체크
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API 라우트 등록
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
// TODO: 추가 라우트 등록
// app.use('/api/reading-books', readingRoutes);
// app.use('/api/reading-records', recordsRoutes);
// app.use('/api/reviews', reviewsRoutes);
// app.use('/api/upload', uploadRoutes);
// app.use('/api/ai', aiRoutes);

// ============================================
// 루트 경로
// ============================================

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '독독 (DockDock) API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// ============================================
// 404 핸들러
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.path
  });
});

// ============================================
// 에러 핸들러
// ============================================

app.use((error: Error, _req: Request, res: Response, _next: any) => {
  console.error('Error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============================================
// 서버 시작
// ============================================

app.listen(PORT, () => {
  console.log(`
🚀 독독 (DockDock) API Server Started!

📍 Server: http://localhost:${PORT}
📚 API Docs: http://localhost:${PORT}/api-docs
❤️  Health Check: http://localhost:${PORT}/health
🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export default app;
