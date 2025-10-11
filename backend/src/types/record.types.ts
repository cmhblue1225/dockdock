/**
 * 독서 기록 유형
 */
export type RecordType = 'note' | 'quote' | 'thought';

/**
 * 독서 기록 (reading_records 테이블)
 */
export interface ReadingRecord {
  id: string;
  reading_book_id: string;
  user_id: string;
  content: string;
  page_number: number | null;
  record_type: RecordType;
  created_at: string;
  updated_at: string;
}

/**
 * 독서 기록 생성 DTO
 */
export interface CreateReadingRecordDto {
  reading_book_id: string;
  content: string;
  page_number?: number;
  record_type?: RecordType;
}

/**
 * 독서 기록 업데이트 DTO
 */
export interface UpdateReadingRecordDto {
  content?: string;
  page_number?: number;
  record_type?: RecordType;
}

/**
 * 독서 기록 with 책 정보 (JOIN)
 */
export interface ReadingRecordWithBook extends ReadingRecord {
  reading_book: {
    id: string;
    book_id: string;
    status: string;
    book: {
      id: string;
      title: string;
      author: string | null;
      cover_image_url: string | null;
    };
  };
}
