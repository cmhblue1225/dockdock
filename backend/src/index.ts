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
import readingRoutes from './routes/reading.routes';
import recordRoutes from './routes/record.routes';
import reviewRoutes from './routes/review.routes';
import photoRoutes from './routes/photo.routes';
import recommendationRoutes from './routes/recommendation.routes';
import onboardingRoutes from './routes/onboarding.routes';
// TODO: 추가 라우트
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
const allowedOrigins = [
  'http://localhost:5173',                           // 로컬 개발
  'http://localhost:3000',                           // 로컬 개발 (대체 포트)
  'https://dockdock.minhyuk.kr',                     // 프로덕션 프론트엔드
  'https://dockdock-production.up.railway.app'       // Railway 백엔드 (Swagger 문서용)
];

// 환경 변수로 추가 origin 허용
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // origin이 없는 경우 (예: Postman, curl) 허용
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/v1/books', booksRoutes);
app.use('/api/v1/reading-books', readingRoutes);
app.use('/api/v1/reading-records', recordRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);

// TODO: 추가 라우트 등록
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
