import { Request, Response } from 'express';
import * as photoService from '../services/photo.service';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.util';

/**
 * 사진 업로드
 * POST /api/v1/photos
 */
export async function uploadPhoto(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { reading_record_id } = req.body;
    const file = req.file;

    if (!reading_record_id) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'reading_record_id는 필수입니다',
        null,
        400
      );
    }

    if (!file) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        '사진 파일을 업로드해주세요',
        null,
        400
      );
    }

    // Storage에 업로드
    const photoUrl = await photoService.uploadPhotoToStorage(userId, file);

    // DB에 저장
    const photo = await photoService.createReadingPhoto(userId, reading_record_id, photoUrl);

    return sendSuccess(res, photo, '사진이 업로드되었습니다', 201);
  } catch (error) {
    console.error('uploadPhoto error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '사진 업로드에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 특정 기록의 사진 목록 조회
 * GET /api/v1/photos?reading_record_id=xxx
 */
export async function getPhotos(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const readingRecordId = req.query.reading_record_id as string;

    if (!readingRecordId) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        'reading_record_id는 필수입니다',
        null,
        400
      );
    }

    const photos = await photoService.getPhotosByRecordId(readingRecordId, userId);

    return sendSuccess(res, photos);
  } catch (error) {
    console.error('getPhotos error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '사진 목록 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 사진 삭제
 * DELETE /api/v1/photos/:id
 */
export async function deletePhoto(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const { id } = req.params;

    await photoService.deleteReadingPhoto(id, userId);

    return sendSuccess(res, null, '사진이 삭제되었습니다');
  } catch (error) {
    console.error('deletePhoto error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '사진 삭제에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
