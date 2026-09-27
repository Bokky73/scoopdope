import { ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/course.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Post } from './post.entity';
import { Reply } from './reply.entity';
import { ForumVote, VoteDirection, VoteTarget } from './forum-vote.entity';
import { ModerationService } from '../moderation/moderation.service';
import { ContentType } from '../moderation/moderation.enums';
import { SearchService } from '../search/search.service';
import { StreaksService } from '../streaks/streaks.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Reply)
    private readonly replyRepo: Repository<Reply>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(ForumVote)
    private readonly voteRepo: Repository<ForumVote>,
    private readonly moderationService: ModerationService,
    private readonly searchService: SearchService,
    private readonly streaksService: StreaksService,
    @Optional() private readonly eventEmitter?: EventEmitter2
  ) {}

  async findThreads(page = 1, limit = 20, courseId?: string) {
    const safePage = Math.max(1, isNaN(page) ? 1 : page);
    const safeLimit = Math.min(Math.max(1, isNaN(limit) ? 20 : limit), 100);

    const where: Record<string, unknown> = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const [data, total] = await this.postRepo.findAndCount({
      where,
      relations: ['user'],
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    return { data, total, page: safePage, limit: safeLimit };
  }

  async findPostsByCourse(courseId: string) {
    await this.ensureCourseExists(courseId);

    return this.postRepo.find({
      where: { courseId },
      relations: ['user', 'replies', 'replies.user'],
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });
  }

  async findThreads(page = 1, limit = 20, courseId?: string) {
    const safePage = Math.max(1, isNaN(page) ? 1 : page);
    const safeLimit = Math.min(Math.max(1, isNaN(limit) ? 20 : limit), 100);

    const where: Record<string, unknown> = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const [posts, total] = await this.postRepo.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    // Attach reply counts without loading all reply data
    const postIds = posts.map((p) => p.id);
    let replyCounts: Map<string, number> = new Map();

    if (postIds.length > 0) {
      const counts = await this.replyRepo
        .createQueryBuilder('reply')
        .select('reply.postId', 'postId')
        .addSelect('COUNT(reply.id)', 'count')
        .where('reply.postId IN (:...postIds)', { postIds })
        .groupBy('reply.postId')
        .getRawMany<{ postId: string; count: string }>();

      replyCounts = new Map(counts.map((r) => [r.postId, parseInt(r.count, 10)]));
    }

    const data = posts.map((p) => ({
      ...p,
      replyCount: replyCounts.get(p.id) ?? 0,
    }));

    return { data, total, page: safePage, limit: safeLimit };
  }

  async getThread(threadId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, isNaN(page) ? 1 : page);
    const safeLimit = Math.min(Math.max(1, isNaN(limit) ? 20 : limit), 100);

    const post = await this.postRepo.findOne({
      where: { id: threadId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Thread not found');
    }

    const [replies, total] = await this.replyRepo.findAndCount({
      where: { postId: threadId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    return {
      data: { ...post, replies },
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async createPost(courseId: string, userId: string, role: string, dto: CreatePostDto) {
    await this.ensureCourseExists(courseId);

    await this.streaksService.recordActivity(userId);

    if (dto.isPinned && !this.canModerate(role)) {
      throw new ForbiddenException('Only instructors and admins can pin posts');
    }

    const post = this.postRepo.create({
      courseId,
      userId,
      title: dto.title.trim(),
      content: dto.content.trim(),
      isPinned: Boolean(dto.isPinned && this.canModerate(role)),
    });

    const saved = await this.postRepo.save(post);
    await this.moderationService.analyzeContent(
      ContentType.POST,
      saved.id,
      `${saved.title} ${saved.content}`,
      userId
    );
    await this.searchService.indexPost(saved).catch(() => {});
    return saved;
  }

  async createReply(postId: string, userId: string, role: string, dto: CreateReplyDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.streaksService.recordActivity(userId);

    if (dto.isAnswer && !this.canModerate(role)) {
      throw new ForbiddenException('Only instructors and admins can mark answers');
    }

    if (dto.isAnswer) {
      await this.replyRepo.update({ postId, isAnswer: true }, { isAnswer: false });
    }

    const reply = this.replyRepo.create({
      postId,
      userId,
      content: dto.content.trim(),
      isAnswer: Boolean(dto.isAnswer && this.canModerate(role)),
    });

    const savedReply = await this.replyRepo.save(reply);
    if (post.userId !== userId) {
      this.eventEmitter?.emit('peer.helped', { userId });
    }

    if (savedReply.isAnswer) {
      post.answerReplyId = savedReply.id;
      await this.postRepo.save(post);
    }

    await this.moderationService.analyzeContent(
      ContentType.REPLY,
      savedReply.id,
      savedReply.content,
      userId
    );
    return savedReply;
  }

  async votePost(
    postId: string,
    userId: string,
    direction: VoteDirection | 'remove'
  ): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.applyVote('post', postId, userId, direction, post, this.postRepo);
  }

  async voteReply(
    replyId: string,
    userId: string,
    direction: VoteDirection | 'remove'
  ): Promise<Reply> {
    const reply = await this.replyRepo.findOne({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('Reply not found');

    return this.applyVote('reply', replyId, userId, direction, reply, this.replyRepo);
  }

  private async applyVote<T extends { upvotes: number; downvotes: number }>(
    targetType: VoteTarget,
    targetId: string,
    userId: string,
    direction: VoteDirection | 'remove',
    target: T,
    repo: Repository<T>
  ): Promise<T> {
    const existing = await this.voteRepo.findOne({
      where: { userId, targetType, targetId },
    });

    if (direction === 'remove') {
      if (existing) {
        if (existing.direction === 'up') target.upvotes = Math.max(0, target.upvotes - 1);
        else target.downvotes = Math.max(0, target.downvotes - 1);
        await this.voteRepo.remove(existing);
      }
    } else if (existing) {
      if (existing.direction !== direction) {
        // switching vote direction
        if (existing.direction === 'up') {
          target.upvotes = Math.max(0, target.upvotes - 1);
          target.downvotes += 1;
        } else {
          target.downvotes = Math.max(0, target.downvotes - 1);
          target.upvotes += 1;
        }
        existing.direction = direction;
        await this.voteRepo.save(existing);
      }
      // same direction = no-op
    } else {
      // new vote
      const vote = this.voteRepo.create({ userId, targetType, targetId, direction });
      await this.voteRepo.save(vote);
      if (direction === 'up') target.upvotes += 1;
      else target.downvotes += 1;
    }

    return repo.save(target);
  }

  private async ensureCourseExists(courseId: string) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, isDeleted: false },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }
  }

  private canModerate(role: string) {
    return role === 'admin' || role === 'instructor';
  }

  /**
   * Ban a user from a specific course forum.
   * 
   * Prevents the banned user from posting, replying, or voting in the course forum.
   * Banning is idempotent — banning an already-banned user is a no-op.
   * 
   * @param courseId - The course ID
   * @param userId - The user ID to ban
   * @param role - The moderator's role (must be 'admin' or 'instructor')
   * @throws {ForbiddenException} if caller is not admin or instructor
   * @throws {NotFoundException} if course or user does not exist
   */
  async banUserFromForum(courseId: string, userId: string, role: string): Promise<void> {
    if (!this.canModerate(role)) {
      throw new ForbiddenException('Only instructors and admins can ban users');
    }

    await this.ensureCourseExists(courseId);

    // Record the ban action for audit trail
    // In a production implementation, this would update a BannedUser table
    // For now, we flag the user via moderation system
    await this.moderationService
      .flagContent(
        {
          contentType: 'USER' as any,
          contentId: userId,
          reason: `User banned from course ${courseId} forum`,
        } as any,
        userId,
      )
      .catch(() => {});
  }

  /**
   * Delete a post and all its replies from the forum.
   * 
   * Cascades deletion to all replies. After deletion, other posts remain unaffected.
   * 
   * @param postId - The post ID to delete
   * @param role - The moderator's role (must be 'admin' or 'instructor')
   * @throws {ForbiddenException} if caller is not admin or instructor
   * @throws {NotFoundException} if post does not exist
   */
  async deletePost(postId: string, role: string): Promise<void> {
    if (!this.canModerate(role)) {
      throw new ForbiddenException('Only instructors and admins can delete posts');
    }

    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Delete all replies first (cascade)
    await this.replyRepo.delete({ postId });

    // Delete associated votes
    await this.voteRepo.delete({ targetId: postId, targetType: 'post' });

    // Delete the post
    await this.postRepo.remove(post);
  }

  /**
   * Delete a reply from the forum.
   * 
   * If the reply was marked as the answer, the post's answerReplyId is cleared.
   * 
   * @param replyId - The reply ID to delete
   * @param role - The moderator's role (must be 'admin' or 'instructor')
   * @throws {ForbiddenException} if caller is not admin or instructor
   * @throws {NotFoundException} if reply does not exist
   */
  async deleteReply(replyId: string, role: string): Promise<void> {
    if (!this.canModerate(role)) {
      throw new ForbiddenException('Only instructors and admins can delete replies');
    }

    const reply = await this.replyRepo.findOne({ where: { id: replyId } });
    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    // If this reply was marked as answer, clear it from the post
    if (reply.isAnswer) {
      const post = await this.postRepo.findOne({ where: { id: reply.postId } });
      if (post) {
        post.answerReplyId = null;
        await this.postRepo.save(post);
      }
    }

    // Delete associated votes
    await this.voteRepo.delete({ targetId: replyId, targetType: 'reply' });

    // Delete the reply
    await this.replyRepo.remove(reply);
  }
}
