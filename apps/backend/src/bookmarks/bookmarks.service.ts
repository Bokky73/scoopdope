import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBookmark } from './user-bookmark.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(UserBookmark)
    private bookmarkRepo: Repository<UserBookmark>,
  ) {}

  /**
   * Add a bookmark for a lesson. Idempotent: returns existing if already bookmarked.
   */
  async addBookmark(userId: string, lessonId: string): Promise<UserBookmark> {
    const existing = await this.bookmarkRepo.findOne({
      where: { userId, lessonId },
    });
    if (existing) {
      return existing;
    }
    const bookmark = this.bookmarkRepo.create({ userId, lessonId });
    return this.bookmarkRepo.save(bookmark);
  }

  /**
   * Remove a bookmark for a lesson. Throws 404 if not bookmarked.
   */
  async removeBookmark(userId: string, lessonId: string): Promise<void> {
    const bookmark = await this.bookmarkRepo.findOne({
      where: { userId, lessonId },
    });
    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }
    await this.bookmarkRepo.remove(bookmark);
  }

  /**
   * Toggle a bookmark: creates if absent, removes if present.
   * Returns { bookmarked: boolean } indicating the new state.
   */
  async toggleBookmark(
    userId: string,
    lessonId: string,
  ): Promise<{ bookmarked: boolean; bookmark?: UserBookmark }> {
    const existing = await this.bookmarkRepo.findOne({
      where: { userId, lessonId },
    });

    if (existing) {
      await this.bookmarkRepo.remove(existing);
      return { bookmarked: false };
    }

    const bookmark = this.bookmarkRepo.create({ userId, lessonId });
    const saved = await this.bookmarkRepo.save(bookmark);
    return { bookmarked: true, bookmark: saved };
  }

  /**
   * Get all bookmarks for a user with lesson details, ordered newest first.
   */
  async getUserBookmarks(userId: string): Promise<UserBookmark[]> {
    return this.bookmarkRepo.find({
      where: { userId },
      relations: ['lesson', 'lesson.module'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if a specific lesson is bookmarked by the user.
   */
  async isBookmarked(userId: string, lessonId: string): Promise<boolean> {
    const count = await this.bookmarkRepo.count({
      where: { userId, lessonId },
    });
    return count > 0;
  }

  /**
   * Get the total bookmark count for a user.
   */
  async getBookmarkCount(userId: string): Promise<number> {
    return this.bookmarkRepo.count({ where: { userId } });
  }
}
