import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';

/**
 * DTO for reordering lessons within a module.
 * Accepts an array of lesson IDs in the desired order.
 * The order values will be reassigned sequentially starting from 0.
 *
 * Example:
 * {
 *   "lessonIds": ["uuid-1", "uuid-2", "uuid-3"]
 * }
 *
 * Partial reordering is supported - only specified lessons will have their order updated.
 * Other lessons will retain their existing order values.
 */
export class ReorderLessonsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one lesson ID must be provided' })
  @IsUUID('4', { each: true, message: 'Each lesson ID must be a valid UUID' })
  lessonIds: string[];
}
