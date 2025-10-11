import { Request, Response } from 'express';
import * as onboardingService from '../services/onboarding.service';
import { sendSuccess, sendError, ErrorCodes } from '../utils/response.util';
import { SaveUserPreferencesDto } from '../types/onboarding.types';

/**
 * 온보딩 장르 목록 가져오기
 * GET /api/v1/onboarding/genres
 */
export async function getOnboardingGenres(req: Request, res: Response) {
  try {
    const genres = await onboardingService.getOnboardingGenres();
    return sendSuccess(res, genres, '장르 목록을 성공적으로 가져왔습니다');
  } catch (error) {
    console.error('getOnboardingGenres error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '장르 목록 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 특정 장르의 책 가져오기
 * GET /api/v1/onboarding/books/:genre
 */
export async function getGenreBooks(req: Request, res: Response) {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!genre) {
      return sendError(res, ErrorCodes.VALIDATION_ERROR, '장르가 필요합니다', null, 400);
    }

    const books = await onboardingService.getGenreBooks(genre, limit);

    return sendSuccess(res, books, `${genre} 장르의 책을 성공적으로 가져왔습니다`);
  } catch (error) {
    console.error('getGenreBooks error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '장르별 책 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 사용자 선호도 저장 (확장)
 * POST /api/v1/onboarding/preferences
 */
export async function saveUserPreferences(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const dto: SaveUserPreferencesDto = req.body;

    // 유효성 검사
    if (!dto.preferred_genres || dto.preferred_genres.length < 1) {
      return sendError(
        res,
        ErrorCodes.VALIDATION_ERROR,
        '최소 1개 이상의 장르를 선택해주세요',
        null,
        400
      );
    }

    // 확장된 선호도 데이터 추출
    const extendedPreferences = {
      reading_purposes: dto.reading_purposes,
      preferred_length: dto.preferred_length,
      reading_pace: dto.reading_pace,
      preferred_difficulty: dto.preferred_difficulty,
      preferred_moods: dto.preferred_moods,
      preferred_emotions: dto.preferred_emotions,
      narrative_styles: dto.narrative_styles,
      preferred_themes: dto.preferred_themes,
    };

    await onboardingService.saveUserPreferences(
      userId,
      dto.preferred_genres,
      dto.selected_book_ids,
      extendedPreferences
    );

    return sendSuccess(res, null, '선호도가 성공적으로 저장되었습니다', 201);
  } catch (error) {
    console.error('saveUserPreferences error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '선호도 저장에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}

/**
 * 온보딩 상태 확인
 * GET /api/v1/onboarding/status
 */
export async function getOnboardingStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, ErrorCodes.UNAUTHORIZED, '인증이 필요합니다', null, 401);
    }

    const completed = await onboardingService.getOnboardingStatus(userId);

    return sendSuccess(res, { completed }, '온보딩 상태를 성공적으로 가져왔습니다');
  } catch (error) {
    console.error('getOnboardingStatus error:', error);
    return sendError(
      res,
      ErrorCodes.INTERNAL_ERROR,
      '온보딩 상태 조회에 실패했습니다',
      error instanceof Error ? error.message : undefined,
      500
    );
  }
}
