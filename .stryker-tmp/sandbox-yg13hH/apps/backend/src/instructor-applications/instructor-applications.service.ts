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
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorApplication } from './instructor-application.entity';
import { UsersService } from '../users/users.service';
import { CreateInstructorApplicationDto, ReviewApplicationDto } from './dto/instructor-application.dto';
@Injectable()
export class InstructorApplicationsService {
  constructor(@InjectRepository(InstructorApplication)
  private readonly repo: Repository<InstructorApplication>, private readonly usersService: UsersService) {}
  async apply(userId: string, dto: CreateInstructorApplicationDto) {
    if (stryMutAct_9fa48("3930")) {
      {}
    } else {
      stryCov_9fa48("3930");
      if (stryMutAct_9fa48("3933") ? false : stryMutAct_9fa48("3932") ? true : stryMutAct_9fa48("3931") ? dto.agreementAccepted : (stryCov_9fa48("3931", "3932", "3933"), !dto.agreementAccepted)) {
        if (stryMutAct_9fa48("3934")) {
          {}
        } else {
          stryCov_9fa48("3934");
          throw new BadRequestException(stryMutAct_9fa48("3935") ? "" : (stryCov_9fa48("3935"), 'You must accept the instructor agreement'));
        }
      }
      const existing = await this.repo.findOne(stryMutAct_9fa48("3936") ? {} : (stryCov_9fa48("3936"), {
        where: stryMutAct_9fa48("3937") ? {} : (stryCov_9fa48("3937"), {
          userId,
          status: stryMutAct_9fa48("3938") ? "" : (stryCov_9fa48("3938"), 'pending')
        })
      }));
      if (stryMutAct_9fa48("3940") ? false : stryMutAct_9fa48("3939") ? true : (stryCov_9fa48("3939", "3940"), existing)) {
        if (stryMutAct_9fa48("3941")) {
          {}
        } else {
          stryCov_9fa48("3941");
          throw new ConflictException(stryMutAct_9fa48("3942") ? "" : (stryCov_9fa48("3942"), 'You already have a pending application'));
        }
      }
      const user = await this.usersService.findById(userId);
      if (stryMutAct_9fa48("3945") ? false : stryMutAct_9fa48("3944") ? true : stryMutAct_9fa48("3943") ? user : (stryCov_9fa48("3943", "3944", "3945"), !user)) throw new NotFoundException(stryMutAct_9fa48("3946") ? "" : (stryCov_9fa48("3946"), 'User not found'));
      if (stryMutAct_9fa48("3949") ? user.role !== 'instructor' : stryMutAct_9fa48("3948") ? false : stryMutAct_9fa48("3947") ? true : (stryCov_9fa48("3947", "3948", "3949"), user.role === (stryMutAct_9fa48("3950") ? "" : (stryCov_9fa48("3950"), 'instructor')))) {
        if (stryMutAct_9fa48("3951")) {
          {}
        } else {
          stryCov_9fa48("3951");
          throw new ConflictException(stryMutAct_9fa48("3952") ? "" : (stryCov_9fa48("3952"), 'You are already an instructor'));
        }
      }
      const application = this.repo.create(stryMutAct_9fa48("3953") ? {} : (stryCov_9fa48("3953"), {
        ...dto,
        userId
      }));
      return this.repo.save(application);
    }
  }
  findMyApplication(userId: string) {
    if (stryMutAct_9fa48("3954")) {
      {}
    } else {
      stryCov_9fa48("3954");
      return this.repo.findOne(stryMutAct_9fa48("3955") ? {} : (stryCov_9fa48("3955"), {
        where: stryMutAct_9fa48("3956") ? {} : (stryCov_9fa48("3956"), {
          userId
        }),
        order: stryMutAct_9fa48("3957") ? {} : (stryCov_9fa48("3957"), {
          createdAt: stryMutAct_9fa48("3958") ? "" : (stryCov_9fa48("3958"), 'DESC')
        })
      }));
    }
  }
  findAll(status?: string) {
    if (stryMutAct_9fa48("3959")) {
      {}
    } else {
      stryCov_9fa48("3959");
      const where = status ? stryMutAct_9fa48("3960") ? {} : (stryCov_9fa48("3960"), {
        status: status as any
      }) : {};
      return this.repo.find(stryMutAct_9fa48("3961") ? {} : (stryCov_9fa48("3961"), {
        where,
        relations: stryMutAct_9fa48("3962") ? [] : (stryCov_9fa48("3962"), [stryMutAct_9fa48("3963") ? "" : (stryCov_9fa48("3963"), 'user')]),
        order: stryMutAct_9fa48("3964") ? {} : (stryCov_9fa48("3964"), {
          createdAt: stryMutAct_9fa48("3965") ? "" : (stryCov_9fa48("3965"), 'DESC')
        })
      }));
    }
  }
  async review(id: string, adminId: string, dto: ReviewApplicationDto) {
    if (stryMutAct_9fa48("3966")) {
      {}
    } else {
      stryCov_9fa48("3966");
      const application = await this.repo.findOne(stryMutAct_9fa48("3967") ? {} : (stryCov_9fa48("3967"), {
        where: stryMutAct_9fa48("3968") ? {} : (stryCov_9fa48("3968"), {
          id
        }),
        relations: stryMutAct_9fa48("3969") ? [] : (stryCov_9fa48("3969"), [stryMutAct_9fa48("3970") ? "" : (stryCov_9fa48("3970"), 'user')])
      }));
      if (stryMutAct_9fa48("3973") ? false : stryMutAct_9fa48("3972") ? true : stryMutAct_9fa48("3971") ? application : (stryCov_9fa48("3971", "3972", "3973"), !application)) throw new NotFoundException(stryMutAct_9fa48("3974") ? "" : (stryCov_9fa48("3974"), 'Application not found'));
      if (stryMutAct_9fa48("3977") ? application.status === 'pending' : stryMutAct_9fa48("3976") ? false : stryMutAct_9fa48("3975") ? true : (stryCov_9fa48("3975", "3976", "3977"), application.status !== (stryMutAct_9fa48("3978") ? "" : (stryCov_9fa48("3978"), 'pending')))) {
        if (stryMutAct_9fa48("3979")) {
          {}
        } else {
          stryCov_9fa48("3979");
          throw new BadRequestException(stryMutAct_9fa48("3980") ? "" : (stryCov_9fa48("3980"), 'Application has already been reviewed'));
        }
      }
      application.status = dto.status;
      application.adminNote = stryMutAct_9fa48("3981") ? dto.adminNote && null : (stryCov_9fa48("3981"), dto.adminNote ?? null);
      application.reviewedBy = adminId;
      application.reviewedAt = new Date();
      await this.repo.save(application);
      if (stryMutAct_9fa48("3984") ? dto.status !== 'approved' : stryMutAct_9fa48("3983") ? false : stryMutAct_9fa48("3982") ? true : (stryCov_9fa48("3982", "3983", "3984"), dto.status === (stryMutAct_9fa48("3985") ? "" : (stryCov_9fa48("3985"), 'approved')))) {
        if (stryMutAct_9fa48("3986")) {
          {}
        } else {
          stryCov_9fa48("3986");
          await this.usersService.update(application.userId, stryMutAct_9fa48("3987") ? {} : (stryCov_9fa48("3987"), {
            role: stryMutAct_9fa48("3988") ? "" : (stryCov_9fa48("3988"), 'instructor'),
            isVerified: stryMutAct_9fa48("3989") ? false : (stryCov_9fa48("3989"), true)
          }));
        }
      }
      return application;
    }
  }
}