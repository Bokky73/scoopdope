// @ts-nocheck
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
import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from './course.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { Review } from './review.entity';
@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review)
  private readonly reviewRepo: Repository<Review>, @InjectRepository(Enrollment)
  private readonly enrollmentRepo: Repository<Enrollment>, @InjectRepository(Course)
  private readonly courseRepo: Repository<Course>) {}
  async create(courseId: string, userId: string, dto: CreateReviewDto) {
    if (stryMutAct_9fa48("2950")) {
      {}
    } else {
      stryCov_9fa48("2950");
      await this.ensureCourseExists(courseId);
      const existing = await this.reviewRepo.findOne(stryMutAct_9fa48("2951") ? {} : (stryCov_9fa48("2951"), {
        where: stryMutAct_9fa48("2952") ? {} : (stryCov_9fa48("2952"), {
          courseId,
          userId
        })
      }));
      if (stryMutAct_9fa48("2954") ? false : stryMutAct_9fa48("2953") ? true : (stryCov_9fa48("2953", "2954"), existing)) {
        if (stryMutAct_9fa48("2955")) {
          {}
        } else {
          stryCov_9fa48("2955");
          throw new ConflictException(stryMutAct_9fa48("2956") ? "" : (stryCov_9fa48("2956"), 'You have already reviewed this course'));
        }
      }
      const enrollment = await this.enrollmentRepo.findOne(stryMutAct_9fa48("2957") ? {} : (stryCov_9fa48("2957"), {
        where: stryMutAct_9fa48("2958") ? {} : (stryCov_9fa48("2958"), {
          courseId,
          userId
        })
      }));
      if (stryMutAct_9fa48("2961") ? !enrollment && !enrollment.completedAt : stryMutAct_9fa48("2960") ? false : stryMutAct_9fa48("2959") ? true : (stryCov_9fa48("2959", "2960", "2961"), (stryMutAct_9fa48("2962") ? enrollment : (stryCov_9fa48("2962"), !enrollment)) || (stryMutAct_9fa48("2963") ? enrollment.completedAt : (stryCov_9fa48("2963"), !enrollment.completedAt)))) {
        if (stryMutAct_9fa48("2964")) {
          {}
        } else {
          stryCov_9fa48("2964");
          throw new UnprocessableEntityException(stryMutAct_9fa48("2965") ? "" : (stryCov_9fa48("2965"), 'Only users with completed enrollments can review this course'));
        }
      }
      const review = this.reviewRepo.create(stryMutAct_9fa48("2966") ? {} : (stryCov_9fa48("2966"), {
        courseId,
        userId,
        rating: dto.rating,
        comment: stryMutAct_9fa48("2969") ? dto.comment?.trim() && null : stryMutAct_9fa48("2968") ? false : stryMutAct_9fa48("2967") ? true : (stryCov_9fa48("2967", "2968", "2969"), (stryMutAct_9fa48("2971") ? dto.comment.trim() : stryMutAct_9fa48("2970") ? dto.comment : (stryCov_9fa48("2970", "2971"), dto.comment?.trim())) || null)
      }));
      return this.reviewRepo.save(review);
    }
  }
  async findByCourse(courseId: string, query: ReviewQueryDto = {}) {
    if (stryMutAct_9fa48("2972")) {
      {}
    } else {
      stryCov_9fa48("2972");
      await this.ensureCourseExists(courseId);
      const {
        page = 1,
        limit = 20
      } = query;
      const offset = stryMutAct_9fa48("2973") ? (page - 1) / limit : (stryCov_9fa48("2973"), (stryMutAct_9fa48("2974") ? page + 1 : (stryCov_9fa48("2974"), page - 1)) * limit);
      const [data, total] = await this.reviewRepo.findAndCount(stryMutAct_9fa48("2975") ? {} : (stryCov_9fa48("2975"), {
        where: stryMutAct_9fa48("2976") ? {} : (stryCov_9fa48("2976"), {
          courseId
        }),
        order: stryMutAct_9fa48("2977") ? {} : (stryCov_9fa48("2977"), {
          createdAt: stryMutAct_9fa48("2978") ? "" : (stryCov_9fa48("2978"), 'DESC')
        }),
        relations: stryMutAct_9fa48("2979") ? [] : (stryCov_9fa48("2979"), [stryMutAct_9fa48("2980") ? "" : (stryCov_9fa48("2980"), 'user')]),
        skip: offset,
        take: limit
      }));
      return stryMutAct_9fa48("2981") ? {} : (stryCov_9fa48("2981"), {
        data,
        total,
        page,
        limit
      });
    }
  }
  private async ensureCourseExists(courseId: string) {
    if (stryMutAct_9fa48("2982")) {
      {}
    } else {
      stryCov_9fa48("2982");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("2983") ? {} : (stryCov_9fa48("2983"), {
        where: stryMutAct_9fa48("2984") ? {} : (stryCov_9fa48("2984"), {
          id: courseId,
          isDeleted: stryMutAct_9fa48("2985") ? true : (stryCov_9fa48("2985"), false)
        })
      }));
      if (stryMutAct_9fa48("2988") ? false : stryMutAct_9fa48("2987") ? true : stryMutAct_9fa48("2986") ? course : (stryCov_9fa48("2986", "2987", "2988"), !course)) {
        if (stryMutAct_9fa48("2989")) {
          {}
        } else {
          stryCov_9fa48("2989");
          throw new NotFoundException(stryMutAct_9fa48("2990") ? "" : (stryCov_9fa48("2990"), 'Course not found'));
        }
      }
    }
  }
}