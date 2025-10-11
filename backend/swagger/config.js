"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
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
                url: 'https://api.dockdock.app',
                description: '프로덕션 서버'
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
                name: 'Reading',
                description: '독서 관리 API (독서 중인 책, 진행률 등)'
            },
            {
                name: 'Records',
                description: '독서 기록 API (메모, 사진, 인용구 등)'
            },
            {
                name: 'Reviews',
                description: '독서 후기 및 평점 API'
            },
            {
                name: 'Upload',
                description: '파일 업로드 API (Supabase Storage)'
            },
            {
                name: 'AI',
                description: 'AI 기반 책 추천 및 인사이트 API (OpenAI)'
            }
        ]
    },
    apis: ['./src/routes/*.ts'], // 라우트 파일에서 Swagger 주석 읽기
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=config.js.map