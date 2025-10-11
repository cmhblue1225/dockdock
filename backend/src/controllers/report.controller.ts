import { Request, Response } from 'express';
import { getReportService } from '../services/report.service';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.util';
import { GenerateReportRequest } from '../types/report';

/**
 * 온보딩 레포트 생성
 * POST /api/v1/onboarding/report/generate
 */
export async function generateReport(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const requestBody: GenerateReportRequest = req.body;

    // 유효성 검사
    if (!requestBody.onboardingData) {
      return sendError(res, ErrorCodes.VALIDATION_ERROR, '온보딩 데이터가 필요합니다', null, 400);
    }

    if (
      !requestBody.onboardingData.purposes ||
      requestBody.onboardingData.purposes.length === 0
    ) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        '최소 1개 이상의 독서 목적을 선택해주세요',
        null,
        400
      );
    }

    if (
      !requestBody.onboardingData.favorite_genres ||
      requestBody.onboardingData.favorite_genres.length === 0
    ) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        '최소 1개 이상의 선호 장르를 선택해주세요',
        null,
        400
      );
    }

    console.log(`[ReportController] 레포트 생성 요청 - userId: ${userId}`);

    const reportService = getReportService();
    const report = await reportService.generateReport(userId, requestBody.onboardingData);

    return sendSuccess(res, report, '레포트가 성공적으로 생성되었습니다', 201);
  } catch (error) {
    console.error('[ReportController] generateReport error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '레포트 생성에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 사용자 레포트 조회
 * GET /api/v1/onboarding/report
 */
export async function getUserReport(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    console.log(`[ReportController] 레포트 조회 요청 - userId: ${userId}`);

    const reportService = getReportService();
    const report = await reportService.getUserReport(userId);

    if (!report) {
      return sendError(
        res,
        ErrorCodes.NOT_FOUND,
        '레포트를 찾을 수 없습니다. 온보딩을 먼저 완료해주세요.',
        null,
        404
      );
    }

    return sendSuccess(res, report, '레포트를 성공적으로 가져왔습니다');
  } catch (error) {
    console.error('[ReportController] getUserReport error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '레포트 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 레포트 재생성 (온보딩 재수행)
 * POST /api/v1/onboarding/report/regenerate
 */
export async function regenerateReport(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const requestBody: GenerateReportRequest = req.body;

    // 유효성 검사
    if (!requestBody.onboardingData) {
      return sendError(res, ErrorCodes.VALIDATION_ERROR, '온보딩 데이터가 필요합니다', null, 400);
    }

    console.log(`[ReportController] 레포트 재생성 요청 - userId: ${userId}`);

    const reportService = getReportService();
    const report = await reportService.generateReport(userId, requestBody.onboardingData);

    return sendSuccess(res, report, '레포트가 성공적으로 재생성되었습니다');
  } catch (error) {
    console.error('[ReportController] regenerateReport error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '레포트 재생성에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
