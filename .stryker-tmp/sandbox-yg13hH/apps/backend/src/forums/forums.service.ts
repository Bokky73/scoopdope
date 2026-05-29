function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/course.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Post } from './post.entity';
import { Reply } from './reply.entity';
import { ModerationService } from '../moderation/moderation.service';
import { ContentType } from '../moderation/moderation.enums';
import { SearchService } from '../search/search.service';
import { StreaksService } from '../streaks/streaks.service';
@Injectable()
export class ForumsService {
  constructor(@InjectRepository(Post)
  private readonly postRepo: Repository<Post>, @InjectRepository(Reply)
  private readonly replyRepo: Repository<Reply>, @InjectRepository(Course)
  private readonly courseRepo: Repository<Course>, private readonly moderationService: ModerationService, private readonly searchService: SearchService, private readonly streaksService: StreaksService) {}
  async findPostsByCourse(courseId: string) {
    if (stryMutAct_9fa48("3576")) {
      {}
    } else {
      stryCov_9fa48("3576");
      await this.ensureCourseExists(courseId);
      return this.postRepo.find(stryMutAct_9fa48("3577") ? {} : (stryCov_9fa48("3577"), {
        where: stryMutAct_9fa48("3578") ? {} : (stryCov_9fa48("3578"), {
          courseId
        }),
        relations: stryMutAct_9fa48("3579") ? [] : (stryCov_9fa48("3579"), [stryMutAct_9fa48("3580") ? "" : (stryCov_9fa48("3580"), 'user'), stryMutAct_9fa48("3581") ? "" : (stryCov_9fa48("3581"), 'replies'), stryMutAct_9fa48("3582") ? "" : (stryCov_9fa48("3582"), 'replies.user')]),
        order: stryMutAct_9fa48("3583") ? {} : (stryCov_9fa48("3583"), {
          isPinned: stryMutAct_9fa48("3584") ? "" : (stryCov_9fa48("3584"), 'DESC'),
          createdAt: stryMutAct_9fa48("3585") ? "" : (stryCov_9fa48("3585"), 'DESC')
        })
      }));
    }
  }
  async createPost(courseId: string, userId: string, role: string, dto: CreatePostDto) {
    if (stryMutAct_9fa48("3586")) {
      {}
    } else {
      stryCov_9fa48("3586");
      await this.ensureCourseExists(courseId);

      // Record activity for streak
      await this.streaksService.recordActivity(userId);
      if (stryMutAct_9fa48("3589") ? dto.isPinned || !this.canModerate(role) : stryMutAct_9fa48("3588") ? false : stryMutAct_9fa48("3587") ? true : (stryCov_9fa48("3587", "3588", "3589"), dto.isPinned && (stryMutAct_9fa48("3590") ? this.canModerate(role) : (stryCov_9fa48("3590"), !this.canModerate(role))))) {
        if (stryMutAct_9fa48("3591")) {
          {}
        } else {
          stryCov_9fa48("3591");
          throw new ForbiddenException(stryMutAct_9fa48("3592") ? "" : (stryCov_9fa48("3592"), 'Only instructors and admins can pin posts'));
        }
      }
      const post = this.postRepo.create(stryMutAct_9fa48("3593") ? {} : (stryCov_9fa48("3593"), {
        courseId,
        userId,
        title: stryMutAct_9fa48("3594") ? dto.title : (stryCov_9fa48("3594"), dto.title.trim()),
        content: stryMutAct_9fa48("3595") ? dto.content : (stryCov_9fa48("3595"), dto.content.trim()),
        isPinned: Boolean(stryMutAct_9fa48("3598") ? dto.isPinned || this.canModerate(role) : stryMutAct_9fa48("3597") ? false : stryMutAct_9fa48("3596") ? true : (stryCov_9fa48("3596", "3597", "3598"), dto.isPinned && this.canModerate(role)))
      }));
      const saved = await this.postRepo.save(post);
      await this.moderationService.analyzeContent(ContentType.POST, saved.id, stryMutAct_9fa48("3599") ? `` : (stryCov_9fa48("3599"), `${saved.title} ${saved.content}`), userId);
      await this.searchService.indexPost(saved).catch(() => {});
      return saved;
    }
  }
  async createReply(postId: string, userId: string, role: string, dto: CreateReplyDto) {
    if (stryMutAct_9fa48("3600")) {
      {}
    } else {
      stryCov_9fa48("3600");
      const post = await this.postRepo.findOne(stryMutAct_9fa48("3601") ? {} : (stryCov_9fa48("3601"), {
        where: stryMutAct_9fa48("3602") ? {} : (stryCov_9fa48("3602"), {
          id: postId
        })
      }));
      if (stryMutAct_9fa48("3605") ? false : stryMutAct_9fa48("3604") ? true : stryMutAct_9fa48("3603") ? post : (stryCov_9fa48("3603", "3604", "3605"), !post)) {
        if (stryMutAct_9fa48("3606")) {
          {}
        } else {
          stryCov_9fa48("3606");
          throw new NotFoundException(stryMutAct_9fa48("3607") ? "" : (stryCov_9fa48("3607"), 'Post not found'));
        }
      }

      // Record activity for streak
      await this.streaksService.recordActivity(userId);
      if (stryMutAct_9fa48("3610") ? dto.isAnswer || !this.canModerate(role) : stryMutAct_9fa48("3609") ? false : stryMutAct_9fa48("3608") ? true : (stryCov_9fa48("3608", "3609", "3610"), dto.isAnswer && (stryMutAct_9fa48("3611") ? this.canModerate(role) : (stryCov_9fa48("3611"), !this.canModerate(role))))) {
        if (stryMutAct_9fa48("3612")) {
          {}
        } else {
          stryCov_9fa48("3612");
          throw new ForbiddenException(stryMutAct_9fa48("3613") ? "" : (stryCov_9fa48("3613"), 'Only instructors and admins can mark answers'));
        }
      }
      if (stryMutAct_9fa48("3615") ? false : stryMutAct_9fa48("3614") ? true : (stryCov_9fa48("3614", "3615"), dto.isAnswer)) {
        if (stryMutAct_9fa48("3616")) {
          {}
        } else {
          stryCov_9fa48("3616");
          await this.replyRepo.update(stryMutAct_9fa48("3617") ? {} : (stryCov_9fa48("3617"), {
            postId,
            isAnswer: stryMutAct_9fa48("3618") ? false : (stryCov_9fa48("3618"), true)
          }), stryMutAct_9fa48("3619") ? {} : (stryCov_9fa48("3619"), {
            isAnswer: stryMutAct_9fa48("3620") ? true : (stryCov_9fa48("3620"), false)
          }));
        }
      }
      const reply = this.replyRepo.create(stryMutAct_9fa48("3621") ? {} : (stryCov_9fa48("3621"), {
        postId,
        userId,
        content: stryMutAct_9fa48("3622") ? dto.content : (stryCov_9fa48("3622"), dto.content.trim()),
        isAnswer: Boolean(stryMutAct_9fa48("3625") ? dto.isAnswer || this.canModerate(role) : stryMutAct_9fa48("3624") ? false : stryMutAct_9fa48("3623") ? true : (stryCov_9fa48("3623", "3624", "3625"), dto.isAnswer && this.canModerate(role)))
      }));
      const savedReply = await this.replyRepo.save(reply);
      if (stryMutAct_9fa48("3627") ? false : stryMutAct_9fa48("3626") ? true : (stryCov_9fa48("3626", "3627"), savedReply.isAnswer)) {
        if (stryMutAct_9fa48("3628")) {
          {}
        } else {
          stryCov_9fa48("3628");
          post.answerReplyId = savedReply.id;
          await this.postRepo.save(post);
        }
      }
      await this.moderationService.analyzeContent(ContentType.REPLY, savedReply.id, savedReply.content, userId);
      return savedReply;
    }
  }
  private async ensureCourseExists(courseId: string) {
    if (stryMutAct_9fa48("3629")) {
      {}
    } else {
      stryCov_9fa48("3629");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("3630") ? {} : (stryCov_9fa48("3630"), {
        where: stryMutAct_9fa48("3631") ? {} : (stryCov_9fa48("3631"), {
          id: courseId,
          isDeleted: stryMutAct_9fa48("3632") ? true : (stryCov_9fa48("3632"), false)
        })
      }));
      if (stryMutAct_9fa48("3635") ? false : stryMutAct_9fa48("3634") ? true : stryMutAct_9fa48("3633") ? course : (stryCov_9fa48("3633", "3634", "3635"), !course)) {
        if (stryMutAct_9fa48("3636")) {
          {}
        } else {
          stryCov_9fa48("3636");
          throw new NotFoundException(stryMutAct_9fa48("3637") ? "" : (stryCov_9fa48("3637"), 'Course not found'));
        }
      }
    }
  }
  private canModerate(role: string) {
    if (stryMutAct_9fa48("3638")) {
      {}
    } else {
      stryCov_9fa48("3638");
      return stryMutAct_9fa48("3641") ? role === 'admin' && role === 'instructor' : stryMutAct_9fa48("3640") ? false : stryMutAct_9fa48("3639") ? true : (stryCov_9fa48("3639", "3640", "3641"), (stryMutAct_9fa48("3643") ? role !== 'admin' : stryMutAct_9fa48("3642") ? false : (stryCov_9fa48("3642", "3643"), role === (stryMutAct_9fa48("3644") ? "" : (stryCov_9fa48("3644"), 'admin')))) || (stryMutAct_9fa48("3646") ? role !== 'instructor' : stryMutAct_9fa48("3645") ? false : (stryCov_9fa48("3645", "3646"), role === (stryMutAct_9fa48("3647") ? "" : (stryCov_9fa48("3647"), 'instructor')))));
    }
  }
}