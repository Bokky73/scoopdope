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
import { Bundle } from './bundle.entity';
import { BundleEnrollment } from './bundle-enrollment.entity';
import { Course } from '../courses/course.entity';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { StellarService } from '../stellar/stellar.service';
import { CredentialsService } from '../credentials/credentials.service';
import { UsersService } from '../users/users.service';
@Injectable()
export class BundlesService {
  constructor(@InjectRepository(Bundle)
  private bundleRepo: Repository<Bundle>, @InjectRepository(BundleEnrollment)
  private bundleEnrollmentRepo: Repository<BundleEnrollment>, @InjectRepository(Course)
  private courseRepo: Repository<Course>, private enrollmentsService: EnrollmentsService, private stellarService: StellarService, private credentialsService: CredentialsService, private usersService: UsersService) {}
  async findAll(publishedOnly = stryMutAct_9fa48("1438") ? false : (stryCov_9fa48("1438"), true)) {
    if (stryMutAct_9fa48("1439")) {
      {}
    } else {
      stryCov_9fa48("1439");
      const where = publishedOnly ? stryMutAct_9fa48("1440") ? {} : (stryCov_9fa48("1440"), {
        isPublished: stryMutAct_9fa48("1441") ? false : (stryCov_9fa48("1441"), true)
      }) : {};
      return this.bundleRepo.find(stryMutAct_9fa48("1442") ? {} : (stryCov_9fa48("1442"), {
        where,
        relations: stryMutAct_9fa48("1443") ? [] : (stryCov_9fa48("1443"), [stryMutAct_9fa48("1444") ? "" : (stryCov_9fa48("1444"), 'courses')]),
        order: stryMutAct_9fa48("1445") ? {} : (stryCov_9fa48("1445"), {
          createdAt: stryMutAct_9fa48("1446") ? "" : (stryCov_9fa48("1446"), 'DESC')
        })
      }));
    }
  }
  async findOne(id: string) {
    if (stryMutAct_9fa48("1447")) {
      {}
    } else {
      stryCov_9fa48("1447");
      const bundle = await this.bundleRepo.findOne(stryMutAct_9fa48("1448") ? {} : (stryCov_9fa48("1448"), {
        where: stryMutAct_9fa48("1449") ? {} : (stryCov_9fa48("1449"), {
          id
        }),
        relations: stryMutAct_9fa48("1450") ? [] : (stryCov_9fa48("1450"), [stryMutAct_9fa48("1451") ? "" : (stryCov_9fa48("1451"), 'courses')])
      }));
      if (stryMutAct_9fa48("1454") ? false : stryMutAct_9fa48("1453") ? true : stryMutAct_9fa48("1452") ? bundle : (stryCov_9fa48("1452", "1453", "1454"), !bundle)) throw new NotFoundException(stryMutAct_9fa48("1455") ? "" : (stryCov_9fa48("1455"), 'Bundle not found'));
      return bundle;
    }
  }
  async create(dto: CreateBundleDto) {
    if (stryMutAct_9fa48("1456")) {
      {}
    } else {
      stryCov_9fa48("1456");
      const courses = await this.courseRepo.findBy(stryMutAct_9fa48("1457") ? {} : (stryCov_9fa48("1457"), {
        id: In(dto.courseIds)
      }));
      if (stryMutAct_9fa48("1460") ? courses.length === dto.courseIds.length : stryMutAct_9fa48("1459") ? false : stryMutAct_9fa48("1458") ? true : (stryCov_9fa48("1458", "1459", "1460"), courses.length !== dto.courseIds.length)) {
        if (stryMutAct_9fa48("1461")) {
          {}
        } else {
          stryCov_9fa48("1461");
          throw new BadRequestException(stryMutAct_9fa48("1462") ? "" : (stryCov_9fa48("1462"), 'One or more courses not found'));
        }
      }
      const bundle = this.bundleRepo.create(stryMutAct_9fa48("1463") ? {} : (stryCov_9fa48("1463"), {
        ...dto,
        courses
      }));
      return this.bundleRepo.save(bundle);
    }
  }
  async update(id: string, dto: UpdateBundleDto) {
    if (stryMutAct_9fa48("1464")) {
      {}
    } else {
      stryCov_9fa48("1464");
      const bundle = await this.findOne(id);
      if (stryMutAct_9fa48("1466") ? false : stryMutAct_9fa48("1465") ? true : (stryCov_9fa48("1465", "1466"), dto.courseIds)) {
        if (stryMutAct_9fa48("1467")) {
          {}
        } else {
          stryCov_9fa48("1467");
          const courses = await this.courseRepo.findBy(stryMutAct_9fa48("1468") ? {} : (stryCov_9fa48("1468"), {
            id: In(dto.courseIds)
          }));
          if (stryMutAct_9fa48("1471") ? courses.length === dto.courseIds.length : stryMutAct_9fa48("1470") ? false : stryMutAct_9fa48("1469") ? true : (stryCov_9fa48("1469", "1470", "1471"), courses.length !== dto.courseIds.length)) {
            if (stryMutAct_9fa48("1472")) {
              {}
            } else {
              stryCov_9fa48("1472");
              throw new BadRequestException(stryMutAct_9fa48("1473") ? "" : (stryCov_9fa48("1473"), 'One or more courses not found'));
            }
          }
          bundle.courses = courses;
        }
      }
      Object.assign(bundle, stryMutAct_9fa48("1474") ? {} : (stryCov_9fa48("1474"), {
        ...dto,
        courseIds: undefined // remove from dto to avoid typeorm error
      }));
      return this.bundleRepo.save(bundle);
    }
  }
  async delete(id: string) {
    if (stryMutAct_9fa48("1475")) {
      {}
    } else {
      stryCov_9fa48("1475");
      const bundle = await this.findOne(id);
      await this.bundleRepo.remove(bundle);
    }
  }
  async purchase(userId: string, bundleId: string) {
    if (stryMutAct_9fa48("1476")) {
      {}
    } else {
      stryCov_9fa48("1476");
      const bundle = await this.findOne(bundleId);
      if (stryMutAct_9fa48("1479") ? false : stryMutAct_9fa48("1478") ? true : stryMutAct_9fa48("1477") ? bundle.isPublished : (stryCov_9fa48("1477", "1478", "1479"), !bundle.isPublished)) throw new BadRequestException(stryMutAct_9fa48("1480") ? "" : (stryCov_9fa48("1480"), 'Bundle is not available for purchase'));
      const existing = await this.bundleEnrollmentRepo.findOne(stryMutAct_9fa48("1481") ? {} : (stryCov_9fa48("1481"), {
        where: stryMutAct_9fa48("1482") ? {} : (stryCov_9fa48("1482"), {
          userId,
          bundleId
        })
      }));
      if (stryMutAct_9fa48("1484") ? false : stryMutAct_9fa48("1483") ? true : (stryCov_9fa48("1483", "1484"), existing)) throw new ConflictException(stryMutAct_9fa48("1485") ? "" : (stryCov_9fa48("1485"), 'Already purchased this bundle'));

      // 1. Check user BST balance
      const user = await this.enrollmentsService.findByUser(userId); // Just to check if user exists, actually I should get user entity
      // In a real implementation, we would check Stellar balance here
      // const balance = await this.stellarService.getTokenBalance(userPublicKey);
      // if (balance < (bundle.discountPrice ?? bundle.price)) throw new BadRequestException('Insufficient balance');

      // 2. Create Bundle Enrollment
      const bundleEnrollment = await this.bundleEnrollmentRepo.save(this.bundleEnrollmentRepo.create(stryMutAct_9fa48("1486") ? {} : (stryCov_9fa48("1486"), {
        userId,
        bundleId
      })));

      // 3. Enroll in all courses
      for (const course of bundle.courses) {
        if (stryMutAct_9fa48("1487")) {
          {}
        } else {
          stryCov_9fa48("1487");
          try {
            if (stryMutAct_9fa48("1488")) {
              {}
            } else {
              stryCov_9fa48("1488");
              await this.enrollmentsService.enroll(userId, course.id);
            }
          } catch (err) {
            if (stryMutAct_9fa48("1489")) {
              {}
            } else {
              stryCov_9fa48("1489");
              // Ignore "Already enrolled" errors if they were already enrolled in a specific course
              if (stryMutAct_9fa48("1492") ? false : stryMutAct_9fa48("1491") ? true : stryMutAct_9fa48("1490") ? err instanceof ConflictException : (stryCov_9fa48("1490", "1491", "1492"), !(err instanceof ConflictException))) throw err;
            }
          }
        }
      }
      return bundleEnrollment;
    }
  }
  async getEnrollments(userId: string) {
    if (stryMutAct_9fa48("1493")) {
      {}
    } else {
      stryCov_9fa48("1493");
      return this.bundleEnrollmentRepo.find(stryMutAct_9fa48("1494") ? {} : (stryCov_9fa48("1494"), {
        where: stryMutAct_9fa48("1495") ? {} : (stryCov_9fa48("1495"), {
          userId
        }),
        relations: stryMutAct_9fa48("1496") ? [] : (stryCov_9fa48("1496"), [stryMutAct_9fa48("1497") ? "" : (stryCov_9fa48("1497"), 'bundle'), stryMutAct_9fa48("1498") ? "" : (stryCov_9fa48("1498"), 'bundle.courses')])
      }));
    }
  }
  async updateProgress(userId: string, courseId: string) {
    if (stryMutAct_9fa48("1499")) {
      {}
    } else {
      stryCov_9fa48("1499");
      // Check if this course belongs to any bundles the user is enrolled in
      const bundleEnrollments = await this.bundleEnrollmentRepo.find(stryMutAct_9fa48("1500") ? {} : (stryCov_9fa48("1500"), {
        where: stryMutAct_9fa48("1501") ? {} : (stryCov_9fa48("1501"), {
          userId,
          completedAt: IsNull()
        }),
        relations: stryMutAct_9fa48("1502") ? [] : (stryCov_9fa48("1502"), [stryMutAct_9fa48("1503") ? "" : (stryCov_9fa48("1503"), 'bundle'), stryMutAct_9fa48("1504") ? "" : (stryCov_9fa48("1504"), 'bundle.courses')])
      }));
      for (const enrollment of bundleEnrollments) {
        if (stryMutAct_9fa48("1505")) {
          {}
        } else {
          stryCov_9fa48("1505");
          const isCourseInBundle = stryMutAct_9fa48("1506") ? enrollment.bundle.courses.every(c => c.id === courseId) : (stryCov_9fa48("1506"), enrollment.bundle.courses.some(stryMutAct_9fa48("1507") ? () => undefined : (stryCov_9fa48("1507"), c => stryMutAct_9fa48("1510") ? c.id !== courseId : stryMutAct_9fa48("1509") ? false : stryMutAct_9fa48("1508") ? true : (stryCov_9fa48("1508", "1509", "1510"), c.id === courseId))));
          if (stryMutAct_9fa48("1512") ? false : stryMutAct_9fa48("1511") ? true : (stryCov_9fa48("1511", "1512"), isCourseInBundle)) {
            if (stryMutAct_9fa48("1513")) {
              {}
            } else {
              stryCov_9fa48("1513");
              // Check if ALL courses in this bundle are completed
              const courseIds = enrollment.bundle.courses.map(stryMutAct_9fa48("1514") ? () => undefined : (stryCov_9fa48("1514"), c => c.id));
              const userEnrollments = await this.enrollmentsService.findByUser(userId);
              const bundleCoursesEnrollments = stryMutAct_9fa48("1515") ? userEnrollments : (stryCov_9fa48("1515"), userEnrollments.filter(stryMutAct_9fa48("1516") ? () => undefined : (stryCov_9fa48("1516"), e => courseIds.includes(e.courseId))));
              const allCompleted = stryMutAct_9fa48("1519") ? bundleCoursesEnrollments.length === courseIds.length || bundleCoursesEnrollments.every(e => e.completedAt !== null) : stryMutAct_9fa48("1518") ? false : stryMutAct_9fa48("1517") ? true : (stryCov_9fa48("1517", "1518", "1519"), (stryMutAct_9fa48("1521") ? bundleCoursesEnrollments.length !== courseIds.length : stryMutAct_9fa48("1520") ? true : (stryCov_9fa48("1520", "1521"), bundleCoursesEnrollments.length === courseIds.length)) && (stryMutAct_9fa48("1522") ? bundleCoursesEnrollments.some(e => e.completedAt !== null) : (stryCov_9fa48("1522"), bundleCoursesEnrollments.every(stryMutAct_9fa48("1523") ? () => undefined : (stryCov_9fa48("1523"), e => stryMutAct_9fa48("1526") ? e.completedAt === null : stryMutAct_9fa48("1525") ? false : stryMutAct_9fa48("1524") ? true : (stryCov_9fa48("1524", "1525", "1526"), e.completedAt !== null))))));
              if (stryMutAct_9fa48("1528") ? false : stryMutAct_9fa48("1527") ? true : (stryCov_9fa48("1527", "1528"), allCompleted)) {
                if (stryMutAct_9fa48("1529")) {
                  {}
                } else {
                  stryCov_9fa48("1529");
                  enrollment.completedAt = new Date();
                  await this.bundleEnrollmentRepo.save(enrollment);

                  // Issue bundle completion certificate
                  const user = await this.usersService.findById(userId);
                  if (stryMutAct_9fa48("1532") ? user.stellarPublicKey : stryMutAct_9fa48("1531") ? false : stryMutAct_9fa48("1530") ? true : (stryCov_9fa48("1530", "1531", "1532"), user?.stellarPublicKey)) {
                    if (stryMutAct_9fa48("1533")) {
                      {}
                    } else {
                      stryCov_9fa48("1533");
                      await this.credentialsService.issueBundle(userId, enrollment.bundleId, user.stellarPublicKey);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}