/**
 * 독서 사진 (reading_photos 테이블)
 */
export interface ReadingPhoto {
  id: string;
  reading_record_id: string;
  user_id: string;
  photo_url: string;
  created_at: string;
}

/**
 * 사진 업로드 DTO
 */
export interface CreatePhotoDto {
  reading_record_id: string;
  file: Express.Multer.File;
}

/**
 * 사진 with 기록 정보 (JOIN)
 */
export interface PhotoWithRecord extends ReadingPhoto {
  reading_record: {
    id: string;
    reading_book_id: string;
    content: string;
    page_number: number | null;
  };
}
