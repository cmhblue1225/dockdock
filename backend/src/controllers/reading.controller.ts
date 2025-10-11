import { Request, Response } from 'express';
import * as readingService from '../services/reading.service';
import { sendSuccess, sendError, sendPaginated, ErrorCodes } from '../utils/response.util';
import { CreateReadingBookDto, UpdateReadingBookDto } from '../types/reading.types';

/**
 * 읽고 있는 책 목록 조회
 * GET /api/v1/reading-books?status=reading&page=1&limit=20
 */
export async function getReadingBooks(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const { data, total } = await readingService.getReadingBooks(
      userId,
      status as any,
      limit,
      offset
    );

    return sendPaginated(res, data, page, limit, total);
  } catch (error) {
    console.error('getReadingBooks error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '읽고 있는 책 목록 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 특정 읽고 있는 책 조회
 * GET /api/v1/reading-books/:id
 */
export async function getReadingBookById(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    const readingBook = await readingService.getReadingBookById(id, userId);

    if (!readingBook) {
      return sendError(res, ErrorCodes.READING_BOOK_NOT_FOUND, '읽고 있는 책을 찾을 수 없습니다', null, 404);
    }

    return sendSuccess(res, readingBook);
  } catch (error) {
    console.error('getReadingBookById error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '읽고 있는 책 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 읽고 있는 책 등록
 * POST /api/v1/reading-books
 */
export async function createReadingBook(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const dto: CreateReadingBookDto = req.body;

    // 입력 검증
    if (!dto.book_id || !dto.status) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'book_id와 status는 필수입니다',
        null,
        400
      );
    }

    if (!['wishlist', 'reading', 'completed', 'paused'].includes(dto.status)) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'status는 wishlist, reading, completed, paused 중 하나여야 합니다',
        null,
        400
      );
    }

    const readingBook = await readingService.createReadingBook(userId, dto);

    return sendSuccess(res, readingBook, '책이 등록되었습니다', 201);
  } catch (error) {
    console.error('createReadingBook error:', error);

    if (error instanceof Error && error.message.includes('이미 등록된 책')) {
      return sendError(res, ErrorCodes.DUPLICATE_READING_BOOK, error.message, null, 409);
    }

    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '책 등록에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 읽고 있는 책 업데이트
 * PATCH /api/v1/reading-books/:id
 */
export async function updateReadingBook(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;
    const dto: UpdateReadingBookDto = req.body;

    // status 검증
    if (dto.status && !['wishlist', 'reading', 'completed', 'paused'].includes(dto.status)) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'status는 wishlist, reading, completed, paused 중 하나여야 합니다',
        null,
        400
      );
    }

    const readingBook = await readingService.updateReadingBook(id, userId, dto);

    return sendSuccess(res, readingBook, '책 정보가 업데이트되었습니다');
  } catch (error) {
    console.error('updateReadingBook error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '책 정보 업데이트에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 읽고 있는 책 삭제
 * DELETE /api/v1/reading-books/:id
 */
export async function deleteReadingBook(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    await readingService.deleteReadingBook(id, userId);

    return sendSuccess(res, null, '책이 삭제되었습니다');
  } catch (error) {
    console.error('deleteReadingBook error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '책 삭제에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
