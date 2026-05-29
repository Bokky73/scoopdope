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
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { LearningPath } from './learning-path.entity';
import { LearningPathEnrollment } from './learning-path-enrollment.entity';
import { Course } from '../courses/course.entity';
import { CreateLearningPathDto, UpdateLearningPathDto } from './dto/learning-path.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersService } from '../users/users.service';
@Injectable()
export class LearningPathsService {
  constructor(@InjectRepository(LearningPath)
  private pathRepo: Repository<LearningPath>, @InjectRepository(LearningPathEnrollment)
  private enrollmentRepo: Repository<LearningPathEnrollment>, @InjectRepository(Course)
  private courseRepo: Repository<Course>, private enrollmentsService: EnrollmentsService, private credentialsService: CredentialsService, private usersService: UsersService) {}
  findAll(publishedOnly = stryMutAct_9fa48("4142") ? false : (stryCov_9fa48("4142"), true)) {
    if (stryMutAct_9fa48("4143")) {
      {}
    } else {
      stryCov_9fa48("4143");
      const where = publishedOnly ? stryMutAct_9fa48("4144") ? {} : (stryCov_9fa48("4144"), {
        isPublished: stryMutAct_9fa48("4145") ? false : (stryCov_9fa48("4145"), true)
      }) : {};
      return this.pathRepo.find(stryMutAct_9fa48("4146") ? {} : (stryCov_9fa48("4146"), {
        where,
        relations: stryMutAct_9fa48("4147") ? [] : (stryCov_9fa48("4147"), [stryMutAct_9fa48("4148") ? "" : (stryCov_9fa48("4148"), 'courses')]),
        order: stryMutAct_9fa48("4149") ? {} : (stryCov_9fa48("4149"), {
          createdAt: stryMutAct_9fa48("4150") ? "" : (stryCov_9fa48("4150"), 'DESC')
        })
      }));
    }
  }
  async findOne(id: string) {
    if (stryMutAct_9fa48("4151")) {
      {}
    } else {
      stryCov_9fa48("4151");
      const path = await this.pathRepo.findOne(stryMutAct_9fa48("4152") ? {} : (stryCov_9fa48("4152"), {
        where: stryMutAct_9fa48("4153") ? {} : (stryCov_9fa48("4153"), {
          id
        }),
        relations: stryMutAct_9fa48("4154") ? [] : (stryCov_9fa48("4154"), [stryMutAct_9fa48("4155") ? "" : (stryCov_9fa48("4155"), 'courses')])
      }));
      if (stryMutAct_9fa48("4158") ? false : stryMutAct_9fa48("4157") ? true : stryMutAct_9fa48("4156") ? path : (stryCov_9fa48("4156", "4157", "4158"), !path)) throw new NotFoundException(stryMutAct_9fa48("4159") ? "" : (stryCov_9fa48("4159"), 'Learning path not found'));
      return path;
    }
  }
  async create(dto: CreateLearningPathDto) {
    if (stryMutAct_9fa48("4160")) {
      {}
    } else {
      stryCov_9fa48("4160");
      const courses = await this.courseRepo.findBy(stryMutAct_9fa48("4161") ? {} : (stryCov_9fa48("4161"), {
        id: In(dto.courseIds)
      }));
      if (stryMutAct_9fa48("4164") ? courses.length === dto.courseIds.length : stryMutAct_9fa48("4163") ? false : stryMutAct_9fa48("4162") ? true : (stryCov_9fa48("4162", "4163", "4164"), courses.length !== dto.courseIds.length)) {
        if (stryMutAct_9fa48("4165")) {
          {}
        } else {
          stryCov_9fa48("4165");
          throw new BadRequestException(stryMutAct_9fa48("4166") ? "" : (stryCov_9fa48("4166"), 'One or more courses not found'));
        }
      }
      const path = this.pathRepo.create(stryMutAct_9fa48("4167") ? {} : (stryCov_9fa48("4167"), {
        ...dto,
        courseOrder: stryMutAct_9fa48("4168") ? dto.courseOrder && dto.courseIds : (stryCov_9fa48("4168"), dto.courseOrder ?? dto.courseIds),
        courses
      }));
      return this.pathRepo.save(path);
    }
  }
  async update(id: string, dto: UpdateLearningPathDto) {
    if (stryMutAct_9fa48("4169")) {
      {}
    } else {
      stryCov_9fa48("4169");
      const path = await this.findOne(id);
      if (stryMutAct_9fa48("4171") ? false : stryMutAct_9fa48("4170") ? true : (stryCov_9fa48("4170", "4171"), dto.courseIds)) {
        if (stryMutAct_9fa48("4172")) {
          {}
        } else {
          stryCov_9fa48("4172");
          const courses = await this.courseRepo.findBy(stryMutAct_9fa48("4173") ? {} : (stryCov_9fa48("4173"), {
            id: In(dto.courseIds)
          }));
          if (stryMutAct_9fa48("4176") ? courses.length === dto.courseIds.length : stryMutAct_9fa48("4175") ? false : stryMutAct_9fa48("4174") ? true : (stryCov_9fa48("4174", "4175", "4176"), courses.length !== dto.courseIds.length)) {
            if (stryMutAct_9fa48("4177")) {
              {}
            } else {
              stryCov_9fa48("4177");
              throw new BadRequestException(stryMutAct_9fa48("4178") ? "" : (stryCov_9fa48("4178"), 'One or more courses not found'));
            }
          }
          path.courses = courses;
          if (stryMutAct_9fa48("4181") ? false : stryMutAct_9fa48("4180") ? true : stryMutAct_9fa48("4179") ? dto.courseOrder : (stryCov_9fa48("4179", "4180", "4181"), !dto.courseOrder)) path.courseOrder = dto.courseIds;
        }
      }
      Object.assign(path, stryMutAct_9fa48("4182") ? {} : (stryCov_9fa48("4182"), {
        ...dto,
        courseIds: undefined
      }));
      return this.pathRepo.save(path);
    }
  }
  async delete(id: string) {
    if (stryMutAct_9fa48("4183")) {
      {}
    } else {
      stryCov_9fa48("4183");
      const path = await this.findOne(id);
      await this.pathRepo.remove(path);
    }
  }
  async enroll(userId: string, learningPathId: string) {
    if (stryMutAct_9fa48("4184")) {
      {}
    } else {
      stryCov_9fa48("4184");
      const path = await this.findOne(learningPathId);
      if (stryMutAct_9fa48("4187") ? false : stryMutAct_9fa48("4186") ? true : stryMutAct_9fa48("4185") ? path.isPublished : (stryCov_9fa48("4185", "4186", "4187"), !path.isPublished)) throw new BadRequestException(stryMutAct_9fa48("4188") ? "" : (stryCov_9fa48("4188"), 'Learning path is not available'));
      const existing = await this.enrollmentRepo.findOne(stryMutAct_9fa48("4189") ? {} : (stryCov_9fa48("4189"), {
        where: stryMutAct_9fa48("4190") ? {} : (stryCov_9fa48("4190"), {
          userId,
          learningPathId
        })
      }));
      if (stryMutAct_9fa48("4192") ? false : stryMutAct_9fa48("4191") ? true : (stryCov_9fa48("4191", "4192"), existing)) throw new ConflictException(stryMutAct_9fa48("4193") ? "" : (stryCov_9fa48("4193"), 'Already enrolled in this learning path'));
      const enrollment = await this.enrollmentRepo.save(this.enrollmentRepo.create(stryMutAct_9fa48("4194") ? {} : (stryCov_9fa48("4194"), {
        userId,
        learningPathId
      })));

      // Enroll in all courses sequentially
      for (const course of path.courses) {
        if (stryMutAct_9fa48("4195")) {
          {}
        } else {
          stryCov_9fa48("4195");
          try {
            if (stryMutAct_9fa48("4196")) {
              {}
            } else {
              stryCov_9fa48("4196");
              await this.enrollmentsService.enroll(userId, course.id);
            }
          } catch (err) {
            if (stryMutAct_9fa48("4197")) {
              {}
            } else {
              stryCov_9fa48("4197");
              if (stryMutAct_9fa48("4200") ? false : stryMutAct_9fa48("4199") ? true : stryMutAct_9fa48("4198") ? err instanceof ConflictException : (stryCov_9fa48("4198", "4199", "4200"), !(err instanceof ConflictException))) throw err;
            }
          }
        }
      }
      return enrollment;
    }
  }
  getEnrollments(userId: string) {
    if (stryMutAct_9fa48("4201")) {
      {}
    } else {
      stryCov_9fa48("4201");
      return this.enrollmentRepo.find(stryMutAct_9fa48("4202") ? {} : (stryCov_9fa48("4202"), {
        where: stryMutAct_9fa48("4203") ? {} : (stryCov_9fa48("4203"), {
          userId
        }),
        relations: stryMutAct_9fa48("4204") ? [] : (stryCov_9fa48("4204"), [stryMutAct_9fa48("4205") ? "" : (stryCov_9fa48("4205"), 'learningPath'), stryMutAct_9fa48("4206") ? "" : (stryCov_9fa48("4206"), 'learningPath.courses')])
      }));
    }
  }

  /** Called when a course is completed — checks if the full path is now done */
  async updateProgress(userId: string, courseId: string) {
    if (stryMutAct_9fa48("4207")) {
      {}
    } else {
      stryCov_9fa48("4207");
      const enrollments = await this.enrollmentRepo.find(stryMutAct_9fa48("4208") ? {} : (stryCov_9fa48("4208"), {
        where: stryMutAct_9fa48("4209") ? {} : (stryCov_9fa48("4209"), {
          userId,
          completedAt: IsNull()
        }),
        relations: stryMutAct_9fa48("4210") ? [] : (stryCov_9fa48("4210"), [stryMutAct_9fa48("4211") ? "" : (stryCov_9fa48("4211"), 'learningPath'), stryMutAct_9fa48("4212") ? "" : (stryCov_9fa48("4212"), 'learningPath.courses')])
      }));
      for (const enrollment of enrollments) {
        if (stryMutAct_9fa48("4213")) {
          {}
        } else {
          stryCov_9fa48("4213");
          const inPath = stryMutAct_9fa48("4214") ? enrollment.learningPath.courses.every(c => c.id === courseId) : (stryCov_9fa48("4214"), enrollment.learningPath.courses.some(stryMutAct_9fa48("4215") ? () => undefined : (stryCov_9fa48("4215"), c => stryMutAct_9fa48("4218") ? c.id !== courseId : stryMutAct_9fa48("4217") ? false : stryMutAct_9fa48("4216") ? true : (stryCov_9fa48("4216", "4217", "4218"), c.id === courseId))));
          if (stryMutAct_9fa48("4221") ? false : stryMutAct_9fa48("4220") ? true : stryMutAct_9fa48("4219") ? inPath : (stryCov_9fa48("4219", "4220", "4221"), !inPath)) continue;
          const courseIds = enrollment.learningPath.courses.map(stryMutAct_9fa48("4222") ? () => undefined : (stryCov_9fa48("4222"), c => c.id));
          const userEnrollments = await this.enrollmentsService.findByUser(userId);
          const pathEnrollments = stryMutAct_9fa48("4223") ? userEnrollments : (stryCov_9fa48("4223"), userEnrollments.filter(stryMutAct_9fa48("4224") ? () => undefined : (stryCov_9fa48("4224"), e => courseIds.includes(e.courseId))));
          const allCompleted = stryMutAct_9fa48("4227") ? pathEnrollments.length === courseIds.length || pathEnrollments.every(e => e.completedAt !== null) : stryMutAct_9fa48("4226") ? false : stryMutAct_9fa48("4225") ? true : (stryCov_9fa48("4225", "4226", "4227"), (stryMutAct_9fa48("4229") ? pathEnrollments.length !== courseIds.length : stryMutAct_9fa48("4228") ? true : (stryCov_9fa48("4228", "4229"), pathEnrollments.length === courseIds.length)) && (stryMutAct_9fa48("4230") ? pathEnrollments.some(e => e.completedAt !== null) : (stryCov_9fa48("4230"), pathEnrollments.every(stryMutAct_9fa48("4231") ? () => undefined : (stryCov_9fa48("4231"), e => stryMutAct_9fa48("4234") ? e.completedAt === null : stryMutAct_9fa48("4233") ? false : stryMutAct_9fa48("4232") ? true : (stryCov_9fa48("4232", "4233", "4234"), e.completedAt !== null))))));
          if (stryMutAct_9fa48("4236") ? false : stryMutAct_9fa48("4235") ? true : (stryCov_9fa48("4235", "4236"), allCompleted)) {
            if (stryMutAct_9fa48("4237")) {
              {}
            } else {
              stryCov_9fa48("4237");
              enrollment.completedAt = new Date();
              await this.enrollmentRepo.save(enrollment);
              const user = await this.usersService.findById(userId);
              if (stryMutAct_9fa48("4240") ? user.stellarPublicKey : stryMutAct_9fa48("4239") ? false : stryMutAct_9fa48("4238") ? true : (stryCov_9fa48("4238", "4239", "4240"), user?.stellarPublicKey)) {
                if (stryMutAct_9fa48("4241")) {
                  {}
                } else {
                  stryCov_9fa48("4241");
                  await this.credentialsService.issueLearningPath(userId, enrollment.learningPathId, user.stellarPublicKey);
                }
              }
            }
          }
        }
      }
    }
  }
}