import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '독독 (DockDock) API',
      version: '1.0.0',
      description: '독서 관리 플랫폼 API 문서 - iOS 및 Web 앱용',
      contact: {
        name: 'DockDock API Support',
        email: 'support@dockdock.app'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '로컬 개발 서버'
      },
      {
        url: 'https://dockdock-production.up.railway.app',
        description: '프로덕션 서버 (Railway)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase JWT 토큰'
        }
      },
      responses: {
        UnauthorizedError: {
          description: '인증 실패 - 유효하지 않은 토큰',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: '인증이 필요합니다'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: '유효성 검증 실패',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: '잘못된 요청입니다'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: '사용자 인증 관련 API'
      },
      {
        name: 'Books',
        description: '책 검색 및 조회 API (알라딘 API 통합)'
      },
      {
        name: 'Reading Books',
        description: '독서 목록 관리 API (위시리스트, 읽는중, 완독)'
      },
      {
        name: 'Reading Records',
        description: '독서 기록 API (메모, 인용구, 생각 기록)'
      },
      {
        name: 'Reviews',
        description: '독서 리뷰 및 평점 API (완독 후 리뷰 작성)'
      },
      {
        name: 'Upload',
        description: '파일 업로드 API (Supabase Storage) - 개발 예정'
      },
      {
        name: 'AI',
        description: 'AI 기반 책 추천 및 인사이트 API - 개발 예정'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // 라우트 파일에서 Swagger 주석 읽기
};

export const swaggerSpec = swaggerJsdoc(options);
