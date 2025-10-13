import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '독독 (DockDock) API',
      version: '1.0.0',
      description: `
# 독독 (DockDock) API 문서

독서 관리 플랫폼을 위한 RESTful API입니다.

## 📱 iOS 개발자 가이드

**모든 API 엔드포인트에 Swift 코드 예시가 포함되어 있습니다!**

각 API 섹션을 펼치면 다음을 확인할 수 있습니다:
- ✅ Swift Service 레이어 구현 예시
- ✅ SwiftUI ViewModel 패턴
- ✅ Codable 모델 정의
- ✅ 에러 처리 방법
- ✅ 완전한 SwiftUI View 예시

## 🔐 인증

모든 인증이 필요한 API는 Bearer 토큰을 사용합니다:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

## 🌐 Base URL

- **개발**: \`http://localhost:3000/api/v1\`
- **프로덕션**: \`https://dockdock-production.up.railway.app/api/v1\`

## 📦 응답 형식

모든 API는 다음 형식으로 응답합니다:

\`\`\`json
{
  "success": true,
  "message": "요청이 성공했습니다",
  "data": { ... }
}
\`\`\`

## 🚀 빠른 시작 (Swift)

\`\`\`swift
// 1. 책 검색
let books = try await BookService.shared.searchBooks(query: "클린코드")

// 2. 위시리스트에 추가
let readingBook = try await ReadingBookService.shared.addToWishlist(bookId: book.id)

// 3. 독서 기록 작성
let record = try await RecordService.shared.createRecord(
    readingBookId: readingBook.id,
    content: "오늘의 독서 기록"
)
\`\`\`
      `,
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
