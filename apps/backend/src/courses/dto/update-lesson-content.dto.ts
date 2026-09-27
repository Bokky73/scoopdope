import { IsString, IsArray, IsOptional, IsInt, Min, MinLength, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * DTO for updating lesson content with HTML sanitization and rich text support
 * Allows safe HTML tags for rich content (emphasis, links, lists, etc.)
 */
export class UpdateLessonContentDto {
  /**
   * Lesson content - required, minimum 10 characters, sanitized HTML
   * Safe tags: b, i, em, strong, a, p, ul, ol, li, br, h3, h4, h5, code, pre, blockquote
   */
  @IsString({ message: 'Content must be a string' })
  @MinLength(10, { message: 'Content must be at least 10 characters long' })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    return sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'h3', 'h4', 'h5', 'code', 'pre', 'blockquote'],
      allowedAttributes: {
        'a': ['href', 'title'],
      },
      disallowedTagsMode: 'discard',
      allowedSchemesByTag: {
        'a': ['http', 'https', 'mailto'],
      },
    });
  })
  content: string;

  /**
   * Learning objectives - optional array of strings
   * Each objective describes a learning outcome for the lesson
   */
  @IsOptional()
  @IsArray({ message: 'Learning objectives must be an array' })
  @ArrayMinSize(0)
  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return value;
    }
    // Sanitize each objective
    return value.map((obj) => {
      if (typeof obj === 'string') {
        return sanitizeHtml(obj, {
          allowedTags: [],
          allowedAttributes: {},
        }).trim();
      }
      return obj;
    });
  })
  learningObjectives?: string[];

  /**
   * Estimated duration in minutes - optional, must be positive
   */
  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be a positive number' })
  estimatedDurationMinutes?: number;
}
