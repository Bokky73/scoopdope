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
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { WaitlistEntry } from './waitlist-entry.entity';
import { Course } from '../courses/course.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { User } from '../users/user.entity';
@Injectable()
export class WaitlistService {
  constructor(@InjectRepository(WaitlistEntry)
  private waitlistRepo: Repository<WaitlistEntry>, @InjectRepository(Course)
  private courseRepo: Repository<Course>, @InjectRepository(Enrollment)
  private enrollmentRepo: Repository<Enrollment>, @InjectRepository(User)
  private userRepo: Repository<User>, private eventEmitter: EventEmitter2, private dataSource: DataSource) {}

  /**
   * Returns the current enrollment count for a course.
   */
  async getEnrollmentCount(courseId: string): Promise<number> {
    if (stryMutAct_9fa48("7355")) {
      {}
    } else {
      stryCov_9fa48("7355");
      return this.enrollmentRepo.count(stryMutAct_9fa48("7356") ? {} : (stryCov_9fa48("7356"), {
        where: stryMutAct_9fa48("7357") ? {} : (stryCov_9fa48("7357"), {
          courseId
        })
      }));
    }
  }

  /**
   * Returns whether a course is full (maxEnrollment set and reached).
   */
  async isFull(courseId: string): Promise<boolean> {
    if (stryMutAct_9fa48("7358")) {
      {}
    } else {
      stryCov_9fa48("7358");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("7359") ? {} : (stryCov_9fa48("7359"), {
        where: stryMutAct_9fa48("7360") ? {} : (stryCov_9fa48("7360"), {
          id: courseId
        })
      }));
      if (stryMutAct_9fa48("7363") ? !course && !course.maxEnrollment : stryMutAct_9fa48("7362") ? false : stryMutAct_9fa48("7361") ? true : (stryCov_9fa48("7361", "7362", "7363"), (stryMutAct_9fa48("7364") ? course : (stryCov_9fa48("7364"), !course)) || (stryMutAct_9fa48("7365") ? course.maxEnrollment : (stryCov_9fa48("7365"), !course.maxEnrollment)))) return stryMutAct_9fa48("7366") ? true : (stryCov_9fa48("7366"), false);
      const count = await this.getEnrollmentCount(courseId);
      return stryMutAct_9fa48("7370") ? count < course.maxEnrollment : stryMutAct_9fa48("7369") ? count > course.maxEnrollment : stryMutAct_9fa48("7368") ? false : stryMutAct_9fa48("7367") ? true : (stryCov_9fa48("7367", "7368", "7369", "7370"), count >= course.maxEnrollment);
    }
  }

  /**
   * Join the waitlist for a course.
   */
  async join(userId: string, courseId: string): Promise<WaitlistEntry> {
    if (stryMutAct_9fa48("7371")) {
      {}
    } else {
      stryCov_9fa48("7371");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("7372") ? {} : (stryCov_9fa48("7372"), {
        where: stryMutAct_9fa48("7373") ? {} : (stryCov_9fa48("7373"), {
          id: courseId
        })
      }));
      if (stryMutAct_9fa48("7376") ? false : stryMutAct_9fa48("7375") ? true : stryMutAct_9fa48("7374") ? course : (stryCov_9fa48("7374", "7375", "7376"), !course)) throw new NotFoundException(stryMutAct_9fa48("7377") ? "" : (stryCov_9fa48("7377"), 'Course not found'));

      // Must be a published course
      if (stryMutAct_9fa48("7380") ? !course.isPublished || course.status !== 'published' : stryMutAct_9fa48("7379") ? false : stryMutAct_9fa48("7378") ? true : (stryCov_9fa48("7378", "7379", "7380"), (stryMutAct_9fa48("7381") ? course.isPublished : (stryCov_9fa48("7381"), !course.isPublished)) && (stryMutAct_9fa48("7383") ? course.status === 'published' : stryMutAct_9fa48("7382") ? true : (stryCov_9fa48("7382", "7383"), course.status !== (stryMutAct_9fa48("7384") ? "" : (stryCov_9fa48("7384"), 'published')))))) {
        if (stryMutAct_9fa48("7385")) {
          {}
        } else {
          stryCov_9fa48("7385");
          throw new BadRequestException(stryMutAct_9fa48("7386") ? "" : (stryCov_9fa48("7386"), 'Course is not available for enrollment or waitlisting'));
        }
      }

      // Already enrolled?
      const enrolled = await this.enrollmentRepo.findOne(stryMutAct_9fa48("7387") ? {} : (stryCov_9fa48("7387"), {
        where: stryMutAct_9fa48("7388") ? {} : (stryCov_9fa48("7388"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("7390") ? false : stryMutAct_9fa48("7389") ? true : (stryCov_9fa48("7389", "7390"), enrolled)) throw new ConflictException(stryMutAct_9fa48("7391") ? "" : (stryCov_9fa48("7391"), 'Already enrolled in this course'));

      // Already on waitlist?
      const existing = await this.waitlistRepo.findOne(stryMutAct_9fa48("7392") ? {} : (stryCov_9fa48("7392"), {
        where: stryMutAct_9fa48("7393") ? {} : (stryCov_9fa48("7393"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("7395") ? false : stryMutAct_9fa48("7394") ? true : (stryCov_9fa48("7394", "7395"), existing)) throw new ConflictException(stryMutAct_9fa48("7396") ? "" : (stryCov_9fa48("7396"), 'Already on the waitlist for this course'));

      // If course is not full, they should just enroll directly
      const full = await this.isFull(courseId);
      if (stryMutAct_9fa48("7399") ? false : stryMutAct_9fa48("7398") ? true : stryMutAct_9fa48("7397") ? full : (stryCov_9fa48("7397", "7398", "7399"), !full)) {
        if (stryMutAct_9fa48("7400")) {
          {}
        } else {
          stryCov_9fa48("7400");
          throw new BadRequestException(stryMutAct_9fa48("7401") ? "" : (stryCov_9fa48("7401"), 'Course has available spots — please enroll directly'));
        }
      }

      // Determine next position
      const maxPos = await this.waitlistRepo.createQueryBuilder(stryMutAct_9fa48("7402") ? "" : (stryCov_9fa48("7402"), 'w')).select(stryMutAct_9fa48("7403") ? "" : (stryCov_9fa48("7403"), 'MAX(w.position)'), stryMutAct_9fa48("7404") ? "" : (stryCov_9fa48("7404"), 'max')).where(stryMutAct_9fa48("7405") ? "" : (stryCov_9fa48("7405"), 'w.courseId = :courseId'), stryMutAct_9fa48("7406") ? {} : (stryCov_9fa48("7406"), {
        courseId
      })).getRawOne<{
        max: string | null;
      }>();
      const position = stryMutAct_9fa48("7407") ? (Number(maxPos?.max) || 0) - 1 : (stryCov_9fa48("7407"), (stryMutAct_9fa48("7410") ? Number(maxPos?.max) && 0 : stryMutAct_9fa48("7409") ? false : stryMutAct_9fa48("7408") ? true : (stryCov_9fa48("7408", "7409", "7410"), Number(stryMutAct_9fa48("7411") ? maxPos.max : (stryCov_9fa48("7411"), maxPos?.max)) || 0)) + 1);
      const entry = await this.waitlistRepo.save(this.waitlistRepo.create(stryMutAct_9fa48("7412") ? {} : (stryCov_9fa48("7412"), {
        userId,
        courseId,
        position
      })));
      const user = await this.userRepo.findOne(stryMutAct_9fa48("7413") ? {} : (stryCov_9fa48("7413"), {
        where: stryMutAct_9fa48("7414") ? {} : (stryCov_9fa48("7414"), {
          id: userId
        })
      }));
      this.eventEmitter.emit(stryMutAct_9fa48("7415") ? "" : (stryCov_9fa48("7415"), 'waitlist.joined'), stryMutAct_9fa48("7416") ? {} : (stryCov_9fa48("7416"), {
        userId,
        courseId,
        courseTitle: course.title,
        position,
        userEmail: stryMutAct_9fa48("7417") ? user?.email && '' : (stryCov_9fa48("7417"), (stryMutAct_9fa48("7418") ? user.email : (stryCov_9fa48("7418"), user?.email)) ?? (stryMutAct_9fa48("7419") ? "Stryker was here!" : (stryCov_9fa48("7419"), ''))),
        userName: stryMutAct_9fa48("7420") ? (user?.username ?? user?.email) && 'Student' : (stryCov_9fa48("7420"), (stryMutAct_9fa48("7421") ? user?.username && user?.email : (stryCov_9fa48("7421"), (stryMutAct_9fa48("7422") ? user.username : (stryCov_9fa48("7422"), user?.username)) ?? (stryMutAct_9fa48("7423") ? user.email : (stryCov_9fa48("7423"), user?.email)))) ?? (stryMutAct_9fa48("7424") ? "" : (stryCov_9fa48("7424"), 'Student')))
      }));
      return entry;
    }
  }

  /**
   * Leave the waitlist.
   */
  async leave(userId: string, courseId: string): Promise<void> {
    if (stryMutAct_9fa48("7425")) {
      {}
    } else {
      stryCov_9fa48("7425");
      const entry = await this.waitlistRepo.findOne(stryMutAct_9fa48("7426") ? {} : (stryCov_9fa48("7426"), {
        where: stryMutAct_9fa48("7427") ? {} : (stryCov_9fa48("7427"), {
          userId,
          courseId
        })
      }));
      if (stryMutAct_9fa48("7430") ? false : stryMutAct_9fa48("7429") ? true : stryMutAct_9fa48("7428") ? entry : (stryCov_9fa48("7428", "7429", "7430"), !entry)) throw new NotFoundException(stryMutAct_9fa48("7431") ? "" : (stryCov_9fa48("7431"), 'Not on the waitlist for this course'));
      const removedPosition = entry.position;
      await this.waitlistRepo.remove(entry);

      // Compact positions for remaining entries
      await this.waitlistRepo.createQueryBuilder().update(WaitlistEntry).set(stryMutAct_9fa48("7432") ? {} : (stryCov_9fa48("7432"), {
        position: stryMutAct_9fa48("7433") ? () => undefined : (stryCov_9fa48("7433"), () => stryMutAct_9fa48("7434") ? "" : (stryCov_9fa48("7434"), 'position - 1'))
      })).where(stryMutAct_9fa48("7435") ? "" : (stryCov_9fa48("7435"), 'courseId = :courseId AND position > :pos'), stryMutAct_9fa48("7436") ? {} : (stryCov_9fa48("7436"), {
        courseId,
        pos: removedPosition
      })).execute();
    }
  }

  /**
   * Get a user's waitlist position for a course (null if not on waitlist).
   */
  async getPosition(userId: string, courseId: string): Promise<number | null> {
    if (stryMutAct_9fa48("7437")) {
      {}
    } else {
      stryCov_9fa48("7437");
      const entry = await this.waitlistRepo.findOne(stryMutAct_9fa48("7438") ? {} : (stryCov_9fa48("7438"), {
        where: stryMutAct_9fa48("7439") ? {} : (stryCov_9fa48("7439"), {
          userId,
          courseId
        })
      }));
      return stryMutAct_9fa48("7440") ? entry?.position && null : (stryCov_9fa48("7440"), (stryMutAct_9fa48("7441") ? entry.position : (stryCov_9fa48("7441"), entry?.position)) ?? null);
    }
  }

  /**
   * Get all waitlist entries for a course (admin view), ordered by position.
   */
  async listForCourse(courseId: string): Promise<WaitlistEntry[]> {
    if (stryMutAct_9fa48("7442")) {
      {}
    } else {
      stryCov_9fa48("7442");
      return this.waitlistRepo.find(stryMutAct_9fa48("7443") ? {} : (stryCov_9fa48("7443"), {
        where: stryMutAct_9fa48("7444") ? {} : (stryCov_9fa48("7444"), {
          courseId
        }),
        relations: stryMutAct_9fa48("7445") ? [] : (stryCov_9fa48("7445"), [stryMutAct_9fa48("7446") ? "" : (stryCov_9fa48("7446"), 'user')]),
        order: stryMutAct_9fa48("7447") ? {} : (stryCov_9fa48("7447"), {
          position: stryMutAct_9fa48("7448") ? "" : (stryCov_9fa48("7448"), 'ASC')
        })
      }));
    }
  }

  /**
   * Get all waitlist entries for a user.
   */
  async listForUser(userId: string): Promise<WaitlistEntry[]> {
    if (stryMutAct_9fa48("7449")) {
      {}
    } else {
      stryCov_9fa48("7449");
      return this.waitlistRepo.find(stryMutAct_9fa48("7450") ? {} : (stryCov_9fa48("7450"), {
        where: stryMutAct_9fa48("7451") ? {} : (stryCov_9fa48("7451"), {
          userId
        }),
        relations: stryMutAct_9fa48("7452") ? [] : (stryCov_9fa48("7452"), [stryMutAct_9fa48("7453") ? "" : (stryCov_9fa48("7453"), 'course')]),
        order: stryMutAct_9fa48("7454") ? {} : (stryCov_9fa48("7454"), {
          joinedAt: stryMutAct_9fa48("7455") ? "" : (stryCov_9fa48("7455"), 'ASC')
        })
      }));
    }
  }

  /**
   * Admin: remove a specific user from a course waitlist.
   */
  async adminRemove(courseId: string, userId: string): Promise<void> {
    if (stryMutAct_9fa48("7456")) {
      {}
    } else {
      stryCov_9fa48("7456");
      return this.leave(userId, courseId);
    }
  }

  /**
   * Attempt to auto-enroll the next person on the waitlist when a spot opens.
   * Called after a student unenrolls or when maxEnrollment is increased.
   */
  async promoteNext(courseId: string): Promise<void> {
    if (stryMutAct_9fa48("7457")) {
      {}
    } else {
      stryCov_9fa48("7457");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("7458") ? {} : (stryCov_9fa48("7458"), {
        where: stryMutAct_9fa48("7459") ? {} : (stryCov_9fa48("7459"), {
          id: courseId
        })
      }));
      if (stryMutAct_9fa48("7462") ? !course && !course.maxEnrollment : stryMutAct_9fa48("7461") ? false : stryMutAct_9fa48("7460") ? true : (stryCov_9fa48("7460", "7461", "7462"), (stryMutAct_9fa48("7463") ? course : (stryCov_9fa48("7463"), !course)) || (stryMutAct_9fa48("7464") ? course.maxEnrollment : (stryCov_9fa48("7464"), !course.maxEnrollment)))) return;
      const currentCount = await this.getEnrollmentCount(courseId);
      if (stryMutAct_9fa48("7468") ? currentCount < course.maxEnrollment : stryMutAct_9fa48("7467") ? currentCount > course.maxEnrollment : stryMutAct_9fa48("7466") ? false : stryMutAct_9fa48("7465") ? true : (stryCov_9fa48("7465", "7466", "7467", "7468"), currentCount >= course.maxEnrollment)) return;

      // Get the first person on the waitlist
      const next = await this.waitlistRepo.findOne(stryMutAct_9fa48("7469") ? {} : (stryCov_9fa48("7469"), {
        where: stryMutAct_9fa48("7470") ? {} : (stryCov_9fa48("7470"), {
          courseId,
          position: 1
        }),
        relations: stryMutAct_9fa48("7471") ? [] : (stryCov_9fa48("7471"), [stryMutAct_9fa48("7472") ? "" : (stryCov_9fa48("7472"), 'user')])
      }));
      if (stryMutAct_9fa48("7475") ? false : stryMutAct_9fa48("7474") ? true : stryMutAct_9fa48("7473") ? next : (stryCov_9fa48("7473", "7474", "7475"), !next)) return;

      // Use a transaction to atomically enroll and remove from waitlist
      await this.dataSource.transaction(async manager => {
        if (stryMutAct_9fa48("7476")) {
          {}
        } else {
          stryCov_9fa48("7476");
          // Create enrollment
          const enrollmentRepo = manager.getRepository(Enrollment);
          const existing = await enrollmentRepo.findOne(stryMutAct_9fa48("7477") ? {} : (stryCov_9fa48("7477"), {
            where: stryMutAct_9fa48("7478") ? {} : (stryCov_9fa48("7478"), {
              userId: next.userId,
              courseId
            })
          }));
          if (stryMutAct_9fa48("7481") ? false : stryMutAct_9fa48("7480") ? true : stryMutAct_9fa48("7479") ? existing : (stryCov_9fa48("7479", "7480", "7481"), !existing)) {
            if (stryMutAct_9fa48("7482")) {
              {}
            } else {
              stryCov_9fa48("7482");
              await enrollmentRepo.save(enrollmentRepo.create(stryMutAct_9fa48("7483") ? {} : (stryCov_9fa48("7483"), {
                userId: next.userId,
                courseId
              })));
            }
          }

          // Remove from waitlist
          await manager.getRepository(WaitlistEntry).remove(next);

          // Compact remaining positions
          await manager.getRepository(WaitlistEntry).createQueryBuilder().update(WaitlistEntry).set(stryMutAct_9fa48("7484") ? {} : (stryCov_9fa48("7484"), {
            position: stryMutAct_9fa48("7485") ? () => undefined : (stryCov_9fa48("7485"), () => stryMutAct_9fa48("7486") ? "" : (stryCov_9fa48("7486"), 'position - 1'))
          })).where(stryMutAct_9fa48("7487") ? "" : (stryCov_9fa48("7487"), 'courseId = :courseId'), stryMutAct_9fa48("7488") ? {} : (stryCov_9fa48("7488"), {
            courseId
          })).execute();
        }
      });
      const user = next.user;
      this.eventEmitter.emit(stryMutAct_9fa48("7489") ? "" : (stryCov_9fa48("7489"), 'waitlist.enrolled'), stryMutAct_9fa48("7490") ? {} : (stryCov_9fa48("7490"), {
        userId: next.userId,
        courseId,
        courseTitle: course.title,
        userEmail: stryMutAct_9fa48("7491") ? user?.email && '' : (stryCov_9fa48("7491"), (stryMutAct_9fa48("7492") ? user.email : (stryCov_9fa48("7492"), user?.email)) ?? (stryMutAct_9fa48("7493") ? "Stryker was here!" : (stryCov_9fa48("7493"), ''))),
        userName: stryMutAct_9fa48("7494") ? (user?.username ?? user?.email) && 'Student' : (stryCov_9fa48("7494"), (stryMutAct_9fa48("7495") ? user?.username && user?.email : (stryCov_9fa48("7495"), (stryMutAct_9fa48("7496") ? user.username : (stryCov_9fa48("7496"), user?.username)) ?? (stryMutAct_9fa48("7497") ? user.email : (stryCov_9fa48("7497"), user?.email)))) ?? (stryMutAct_9fa48("7498") ? "" : (stryCov_9fa48("7498"), 'Student')))
      }));
      this.eventEmitter.emit(stryMutAct_9fa48("7499") ? "" : (stryCov_9fa48("7499"), 'enrollment.created'), stryMutAct_9fa48("7500") ? {} : (stryCov_9fa48("7500"), {
        enrollmentId: stryMutAct_9fa48("7501") ? "Stryker was here!" : (stryCov_9fa48("7501"), ''),
        userId: next.userId,
        courseId,
        enrolledAt: new Date(),
        userEmail: stryMutAct_9fa48("7502") ? user?.email && '' : (stryCov_9fa48("7502"), (stryMutAct_9fa48("7503") ? user.email : (stryCov_9fa48("7503"), user?.email)) ?? (stryMutAct_9fa48("7504") ? "Stryker was here!" : (stryCov_9fa48("7504"), ''))),
        userName: stryMutAct_9fa48("7505") ? (user?.username ?? user?.email) && 'Student' : (stryCov_9fa48("7505"), (stryMutAct_9fa48("7506") ? user?.username && user?.email : (stryCov_9fa48("7506"), (stryMutAct_9fa48("7507") ? user.username : (stryCov_9fa48("7507"), user?.username)) ?? (stryMutAct_9fa48("7508") ? user.email : (stryCov_9fa48("7508"), user?.email)))) ?? (stryMutAct_9fa48("7509") ? "" : (stryCov_9fa48("7509"), 'Student'))),
        courseTitle: course.title
      }));
    }
  }

  /**
   * Returns waitlist size for a course.
   */
  async getWaitlistCount(courseId: string): Promise<number> {
    if (stryMutAct_9fa48("7510")) {
      {}
    } else {
      stryCov_9fa48("7510");
      return this.waitlistRepo.count(stryMutAct_9fa48("7511") ? {} : (stryCov_9fa48("7511"), {
        where: stryMutAct_9fa48("7512") ? {} : (stryCov_9fa48("7512"), {
          courseId
        })
      }));
    }
  }

  /**
   * Triggered when a student unenrolls — attempt to promote the next person.
   */
  @OnEvent('enrollment.removed')
  async handleEnrollmentRemoved(payload: {
    courseId: string;
  }): Promise<void> {
    if (stryMutAct_9fa48("7513")) {
      {}
    } else {
      stryCov_9fa48("7513");
      await this.promoteNext(payload.courseId);
    }
  }
}