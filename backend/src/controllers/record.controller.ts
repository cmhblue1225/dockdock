import { Request, Response } from 'express';
import * as recordService from '../services/record.service';
import { sendSuccess, sendError, sendPaginated, ErrorCodes } from '../utils/response.util';
import { CreateReadingRecordDto, UpdateReadingRecordDto } from '../types/record.types';

/**
 * 독서 기록 목록 조회
 * GET /api/v1/reading-records?reading_book_id={id}&page=1&limit=50
 */
export async function getReadingRecords(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const readingBookId = req.query.reading_book_id as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const { data, total } = await recordService.getReadingRecords(
      userId,
      readingBookId,
      limit,
      offset
    );

    return sendPaginated(res, data, page, limit, total);
  } catch (error) {
    console.error('getReadingRecords error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '독서 기록 목록 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 특정 독서 기록 조회
 * GET /api/v1/reading-records/:id
 */
export async function getReadingRecordById(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    const record = await recordService.getReadingRecordById(id, userId);

    if (!record) {
      return sendError(res, ErrorCodes.NOT_FOUND, '독서 기록을 찾을 수 없습니다', null, 404);
    }

    return sendSuccess(res, record);
  } catch (error) {
    console.error('getReadingRecordById error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '독서 기록 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 독서 기록 생성
 * POST /api/v1/reading-records
 */
export async function createReadingRecord(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const dto: CreateReadingRecordDto = req.body;

    // 입력 검증
    if (!dto.reading_book_id || !dto.content) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'reading_book_id와 content는 필수입니다',
        null,
        400
      );
    }

    if (dto.record_type && !['note', 'quote', 'thought'].includes(dto.record_type)) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'record_type은 note, quote, thought 중 하나여야 합니다',
        null,
        400
      );
    }

    const record = await recordService.createReadingRecord(userId, dto);

    return sendSuccess(res, record, '독서 기록이 생성되었습니다', 201);
  } catch (error) {
    console.error('createReadingRecord error:', error);

    if (error instanceof Error && error.message.includes('권한이 없습니다')) {
      return sendError(res, ErrorCodes.FORBIDDEN, error.message, null, 403);
    }

    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '독서 기록 생성에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 독서 기록 업데이트
 * PATCH /api/v1/reading-records/:id
 */
export async function updateReadingRecord(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;
    const dto: UpdateReadingRecordDto = req.body;

    // record_type 검증
    if (dto.record_type && !['note', 'quote', 'thought'].includes(dto.record_type)) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'record_type은 note, quote, thought 중 하나여야 합니다',
        null,
        400
      );
    }

    const record = await recordService.updateReadingRecord(id, userId, dto);

    return sendSuccess(res, record, '독서 기록이 업데이트되었습니다');
  } catch (error) {
    console.error('updateReadingRecord error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '독서 기록 업데이트에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 독서 기록 삭제
 * DELETE /api/v1/reading-records/:id
 */
export async function deleteReadingRecord(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    await recordService.deleteReadingRecord(id, userId);

    return sendSuccess(res, null, '독서 기록이 삭제되었습니다');
  } catch (error) {
    console.error('deleteReadingRecord error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '독서 기록 삭제에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
