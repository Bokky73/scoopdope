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
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payout } from './payout.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);
  constructor(@InjectRepository(Payout)
  private payoutsRepository: Repository<Payout>, @InjectRepository(Enrollment)
  private enrollmentsRepository: Repository<Enrollment>, @InjectRepository(Course)
  private coursesRepository: Repository<Course>, private configService: ConfigService) {}
  async calculatePayouts(startDate: Date, endDate: Date): Promise<Payout[]> {
    if (stryMutAct_9fa48("5525")) {
      {}
    } else {
      stryCov_9fa48("5525");
      const platformFeePercent = this.configService.get<number>(stryMutAct_9fa48("5526") ? "" : (stryCov_9fa48("5526"), 'PLATFORM_FEE_PERCENT'), 20);
      const courses = await this.coursesRepository.find(stryMutAct_9fa48("5527") ? {} : (stryCov_9fa48("5527"), {
        where: stryMutAct_9fa48("5528") ? {} : (stryCov_9fa48("5528"), {
          instructorId: null
        }),
        relations: stryMutAct_9fa48("5529") ? [] : (stryCov_9fa48("5529"), [stryMutAct_9fa48("5530") ? "" : (stryCov_9fa48("5530"), 'instructor')])
      }));
      const payouts: Payout[] = stryMutAct_9fa48("5531") ? ["Stryker was here"] : (stryCov_9fa48("5531"), []);
      for (const course of courses) {
        if (stryMutAct_9fa48("5532")) {
          {}
        } else {
          stryCov_9fa48("5532");
          if (stryMutAct_9fa48("5535") ? false : stryMutAct_9fa48("5534") ? true : stryMutAct_9fa48("5533") ? course.instructor : (stryCov_9fa48("5533", "5534", "5535"), !course.instructor)) continue;
          const completions = await this.enrollmentsRepository.count(stryMutAct_9fa48("5536") ? {} : (stryCov_9fa48("5536"), {
            where: stryMutAct_9fa48("5537") ? {} : (stryCov_9fa48("5537"), {
              courseId: course.id,
              completedAt: Between(startDate, endDate)
            })
          }));
          if (stryMutAct_9fa48("5540") ? completions !== 0 : stryMutAct_9fa48("5539") ? false : stryMutAct_9fa48("5538") ? true : (stryCov_9fa48("5538", "5539", "5540"), completions === 0)) continue;
          const coursePrice = this.configService.get<number>(stryMutAct_9fa48("5541") ? `` : (stryCov_9fa48("5541"), `COURSE_PRICE_${course.id}`), 0);
          const totalRevenue = stryMutAct_9fa48("5542") ? completions / coursePrice : (stryCov_9fa48("5542"), completions * coursePrice);
          const platformFee = stryMutAct_9fa48("5543") ? totalRevenue * platformFeePercent * 100 : (stryCov_9fa48("5543"), (stryMutAct_9fa48("5544") ? totalRevenue / platformFeePercent : (stryCov_9fa48("5544"), totalRevenue * platformFeePercent)) / 100);
          const instructorShare = stryMutAct_9fa48("5545") ? totalRevenue + platformFee : (stryCov_9fa48("5545"), totalRevenue - platformFee);
          const payout = this.payoutsRepository.create(stryMutAct_9fa48("5546") ? {} : (stryCov_9fa48("5546"), {
            instructorId: course.instructor.id,
            courseId: course.id,
            totalRevenue,
            platformFee,
            instructorShare,
            status: stryMutAct_9fa48("5547") ? "" : (stryCov_9fa48("5547"), 'pending'),
            payoutDate: new Date()
          }));
          payouts.push(payout);
        }
      }
      return this.payoutsRepository.save(payouts);
    }
  }
  async processPayout(payoutId: string): Promise<Payout> {
    if (stryMutAct_9fa48("5548")) {
      {}
    } else {
      stryCov_9fa48("5548");
      const payout = await this.payoutsRepository.findOne(stryMutAct_9fa48("5549") ? {} : (stryCov_9fa48("5549"), {
        where: stryMutAct_9fa48("5550") ? {} : (stryCov_9fa48("5550"), {
          id: payoutId
        }),
        relations: stryMutAct_9fa48("5551") ? [] : (stryCov_9fa48("5551"), [stryMutAct_9fa48("5552") ? "" : (stryCov_9fa48("5552"), 'instructor')])
      }));
      if (stryMutAct_9fa48("5555") ? false : stryMutAct_9fa48("5554") ? true : stryMutAct_9fa48("5553") ? payout : (stryCov_9fa48("5553", "5554", "5555"), !payout)) {
        if (stryMutAct_9fa48("5556")) {
          {}
        } else {
          stryCov_9fa48("5556");
          throw new NotFoundException(stryMutAct_9fa48("5557") ? "" : (stryCov_9fa48("5557"), 'Payout not found'));
        }
      }
      try {
        if (stryMutAct_9fa48("5558")) {
          {}
        } else {
          stryCov_9fa48("5558");
          payout.status = stryMutAct_9fa48("5559") ? "" : (stryCov_9fa48("5559"), 'processed');
          payout.transactionId = stryMutAct_9fa48("5560") ? `` : (stryCov_9fa48("5560"), `TXN-${Date.now()}`);
          this.logger.log(stryMutAct_9fa48("5561") ? `` : (stryCov_9fa48("5561"), `Payout processed for instructor ${payout.instructor.email}: $${payout.instructorShare}`));
        }
      } catch (error) {
        if (stryMutAct_9fa48("5562")) {
          {}
        } else {
          stryCov_9fa48("5562");
          payout.status = stryMutAct_9fa48("5563") ? "" : (stryCov_9fa48("5563"), 'failed');
          this.logger.error(stryMutAct_9fa48("5564") ? `` : (stryCov_9fa48("5564"), `Payout failed: ${error.message}`));
        }
      }
      return this.payoutsRepository.save(payout);
    }
  }
  async getInstructorPayouts(instructorId: string): Promise<Payout[]> {
    if (stryMutAct_9fa48("5565")) {
      {}
    } else {
      stryCov_9fa48("5565");
      return this.payoutsRepository.find(stryMutAct_9fa48("5566") ? {} : (stryCov_9fa48("5566"), {
        where: stryMutAct_9fa48("5567") ? {} : (stryCov_9fa48("5567"), {
          instructorId
        }),
        relations: stryMutAct_9fa48("5568") ? [] : (stryCov_9fa48("5568"), [stryMutAct_9fa48("5569") ? "" : (stryCov_9fa48("5569"), 'course')]),
        order: stryMutAct_9fa48("5570") ? {} : (stryCov_9fa48("5570"), {
          createdAt: stryMutAct_9fa48("5571") ? "" : (stryCov_9fa48("5571"), 'DESC')
        })
      }));
    }
  }
  async getPayoutStats(instructorId: string): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    processedPayouts: number;
  }> {
    if (stryMutAct_9fa48("5572")) {
      {}
    } else {
      stryCov_9fa48("5572");
      const payouts = await this.payoutsRepository.find(stryMutAct_9fa48("5573") ? {} : (stryCov_9fa48("5573"), {
        where: stryMutAct_9fa48("5574") ? {} : (stryCov_9fa48("5574"), {
          instructorId
        })
      }));
      const totalEarnings = payouts.reduce(stryMutAct_9fa48("5575") ? () => undefined : (stryCov_9fa48("5575"), (sum, p) => stryMutAct_9fa48("5576") ? sum - Number(p.instructorShare) : (stryCov_9fa48("5576"), sum + Number(p.instructorShare))), 0);
      const pendingPayouts = stryMutAct_9fa48("5577") ? payouts.length : (stryCov_9fa48("5577"), payouts.filter(stryMutAct_9fa48("5578") ? () => undefined : (stryCov_9fa48("5578"), p => stryMutAct_9fa48("5581") ? p.status !== 'pending' : stryMutAct_9fa48("5580") ? false : stryMutAct_9fa48("5579") ? true : (stryCov_9fa48("5579", "5580", "5581"), p.status === (stryMutAct_9fa48("5582") ? "" : (stryCov_9fa48("5582"), 'pending'))))).length);
      const processedPayouts = stryMutAct_9fa48("5583") ? payouts.length : (stryCov_9fa48("5583"), payouts.filter(stryMutAct_9fa48("5584") ? () => undefined : (stryCov_9fa48("5584"), p => stryMutAct_9fa48("5587") ? p.status !== 'processed' : stryMutAct_9fa48("5586") ? false : stryMutAct_9fa48("5585") ? true : (stryCov_9fa48("5585", "5586", "5587"), p.status === (stryMutAct_9fa48("5588") ? "" : (stryCov_9fa48("5588"), 'processed'))))).length);
      return stryMutAct_9fa48("5589") ? {} : (stryCov_9fa48("5589"), {
        totalEarnings,
        pendingPayouts,
        processedPayouts
      });
    }
  }
  async getPayoutHistory(instructorId: string, limit = 10): Promise<Payout[]> {
    if (stryMutAct_9fa48("5590")) {
      {}
    } else {
      stryCov_9fa48("5590");
      return this.payoutsRepository.find(stryMutAct_9fa48("5591") ? {} : (stryCov_9fa48("5591"), {
        where: stryMutAct_9fa48("5592") ? {} : (stryCov_9fa48("5592"), {
          instructorId
        }),
        relations: stryMutAct_9fa48("5593") ? [] : (stryCov_9fa48("5593"), [stryMutAct_9fa48("5594") ? "" : (stryCov_9fa48("5594"), 'course')]),
        order: stryMutAct_9fa48("5595") ? {} : (stryCov_9fa48("5595"), {
          createdAt: stryMutAct_9fa48("5596") ? "" : (stryCov_9fa48("5596"), 'DESC')
        }),
        take: limit
      }));
    }
  }
  async getMonthlyRevenue(instructorId: string): Promise<{
    month: string;
    revenue: number;
  }[]> {
    if (stryMutAct_9fa48("5597")) {
      {}
    } else {
      stryCov_9fa48("5597");
      const payouts = await this.payoutsRepository.find(stryMutAct_9fa48("5598") ? {} : (stryCov_9fa48("5598"), {
        where: stryMutAct_9fa48("5599") ? {} : (stryCov_9fa48("5599"), {
          instructorId,
          status: stryMutAct_9fa48("5600") ? "" : (stryCov_9fa48("5600"), 'processed')
        }),
        order: stryMutAct_9fa48("5601") ? {} : (stryCov_9fa48("5601"), {
          payoutDate: stryMutAct_9fa48("5602") ? "" : (stryCov_9fa48("5602"), 'ASC')
        })
      }));
      const byMonth: Record<string, number> = {};
      for (const p of payouts) {
        if (stryMutAct_9fa48("5603")) {
          {}
        } else {
          stryCov_9fa48("5603");
          const key = stryMutAct_9fa48("5604") ? p.payoutDate.toISOString() : (stryCov_9fa48("5604"), p.payoutDate.toISOString().slice(0, 7)); // YYYY-MM
          byMonth[key] = stryMutAct_9fa48("5605") ? (byMonth[key] ?? 0) - Number(p.instructorShare) : (stryCov_9fa48("5605"), (stryMutAct_9fa48("5606") ? byMonth[key] && 0 : (stryCov_9fa48("5606"), byMonth[key] ?? 0)) + Number(p.instructorShare));
        }
      }
      return Object.entries(byMonth).map(stryMutAct_9fa48("5607") ? () => undefined : (stryCov_9fa48("5607"), ([month, revenue]) => stryMutAct_9fa48("5608") ? {} : (stryCov_9fa48("5608"), {
        month,
        revenue
      })));
    }
  }
  async getPerCourseRevenue(instructorId: string): Promise<{
    courseId: string;
    courseTitle: string;
    revenue: number;
    payoutCount: number;
  }[]> {
    if (stryMutAct_9fa48("5609")) {
      {}
    } else {
      stryCov_9fa48("5609");
      const payouts = await this.payoutsRepository.find(stryMutAct_9fa48("5610") ? {} : (stryCov_9fa48("5610"), {
        where: stryMutAct_9fa48("5611") ? {} : (stryCov_9fa48("5611"), {
          instructorId
        }),
        relations: stryMutAct_9fa48("5612") ? [] : (stryCov_9fa48("5612"), [stryMutAct_9fa48("5613") ? "" : (stryCov_9fa48("5613"), 'course')])
      }));
      const byCourse: Record<string, {
        courseTitle: string;
        revenue: number;
        payoutCount: number;
      }> = {};
      for (const p of payouts) {
        if (stryMutAct_9fa48("5614")) {
          {}
        } else {
          stryCov_9fa48("5614");
          if (stryMutAct_9fa48("5617") ? false : stryMutAct_9fa48("5616") ? true : stryMutAct_9fa48("5615") ? byCourse[p.courseId] : (stryCov_9fa48("5615", "5616", "5617"), !byCourse[p.courseId])) {
            if (stryMutAct_9fa48("5618")) {
              {}
            } else {
              stryCov_9fa48("5618");
              byCourse[p.courseId] = stryMutAct_9fa48("5619") ? {} : (stryCov_9fa48("5619"), {
                courseTitle: stryMutAct_9fa48("5620") ? p.course?.title && p.courseId : (stryCov_9fa48("5620"), (stryMutAct_9fa48("5621") ? p.course.title : (stryCov_9fa48("5621"), p.course?.title)) ?? p.courseId),
                revenue: 0,
                payoutCount: 0
              });
            }
          }
          stryMutAct_9fa48("5622") ? byCourse[p.courseId].revenue -= Number(p.instructorShare) : (stryCov_9fa48("5622"), byCourse[p.courseId].revenue += Number(p.instructorShare));
          stryMutAct_9fa48("5623") ? byCourse[p.courseId].payoutCount -= 1 : (stryCov_9fa48("5623"), byCourse[p.courseId].payoutCount += 1);
        }
      }
      return Object.entries(byCourse).map(stryMutAct_9fa48("5624") ? () => undefined : (stryCov_9fa48("5624"), ([courseId, data]) => stryMutAct_9fa48("5625") ? {} : (stryCov_9fa48("5625"), {
        courseId,
        ...data
      })));
    }
  }
  async getRevenueProjection(instructorId: string): Promise<{
    projectedMonthly: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    if (stryMutAct_9fa48("5626")) {
      {}
    } else {
      stryCov_9fa48("5626");
      const monthly = await this.getMonthlyRevenue(instructorId);
      if (stryMutAct_9fa48("5630") ? monthly.length >= 2 : stryMutAct_9fa48("5629") ? monthly.length <= 2 : stryMutAct_9fa48("5628") ? false : stryMutAct_9fa48("5627") ? true : (stryCov_9fa48("5627", "5628", "5629", "5630"), monthly.length < 2)) {
        if (stryMutAct_9fa48("5631")) {
          {}
        } else {
          stryCov_9fa48("5631");
          return stryMutAct_9fa48("5632") ? {} : (stryCov_9fa48("5632"), {
            projectedMonthly: stryMutAct_9fa48("5633") ? monthly[0]?.revenue && 0 : (stryCov_9fa48("5633"), (stryMutAct_9fa48("5634") ? monthly[0].revenue : (stryCov_9fa48("5634"), monthly[0]?.revenue)) ?? 0),
            trend: stryMutAct_9fa48("5635") ? "" : (stryCov_9fa48("5635"), 'stable')
          });
        }
      }
      const last = monthly[stryMutAct_9fa48("5636") ? monthly.length + 1 : (stryCov_9fa48("5636"), monthly.length - 1)].revenue;
      const prev = monthly[stryMutAct_9fa48("5637") ? monthly.length + 2 : (stryCov_9fa48("5637"), monthly.length - 2)].revenue;
      const trend: 'up' | 'down' | 'stable' = (stryMutAct_9fa48("5641") ? last <= prev * 1.05 : stryMutAct_9fa48("5640") ? last >= prev * 1.05 : stryMutAct_9fa48("5639") ? false : stryMutAct_9fa48("5638") ? true : (stryCov_9fa48("5638", "5639", "5640", "5641"), last > (stryMutAct_9fa48("5642") ? prev / 1.05 : (stryCov_9fa48("5642"), prev * 1.05)))) ? stryMutAct_9fa48("5643") ? "" : (stryCov_9fa48("5643"), 'up') : (stryMutAct_9fa48("5647") ? last >= prev * 0.95 : stryMutAct_9fa48("5646") ? last <= prev * 0.95 : stryMutAct_9fa48("5645") ? false : stryMutAct_9fa48("5644") ? true : (stryCov_9fa48("5644", "5645", "5646", "5647"), last < (stryMutAct_9fa48("5648") ? prev / 0.95 : (stryCov_9fa48("5648"), prev * 0.95)))) ? stryMutAct_9fa48("5649") ? "" : (stryCov_9fa48("5649"), 'down') : stryMutAct_9fa48("5650") ? "" : (stryCov_9fa48("5650"), 'stable');

      // Simple linear projection: average growth applied to last month
      const avgGrowth = stryMutAct_9fa48("5651") ? monthly.slice(1).reduce((sum, m, i) => sum + (m.revenue - monthly[i].revenue), 0) * (monthly.length - 1) : (stryCov_9fa48("5651"), (stryMutAct_9fa48("5652") ? monthly.reduce((sum, m, i) => sum + (m.revenue - monthly[i].revenue), 0) : (stryCov_9fa48("5652"), monthly.slice(1).reduce(stryMutAct_9fa48("5653") ? () => undefined : (stryCov_9fa48("5653"), (sum, m, i) => stryMutAct_9fa48("5654") ? sum - (m.revenue - monthly[i].revenue) : (stryCov_9fa48("5654"), sum + (stryMutAct_9fa48("5655") ? m.revenue + monthly[i].revenue : (stryCov_9fa48("5655"), m.revenue - monthly[i].revenue)))), 0))) / (stryMutAct_9fa48("5656") ? monthly.length + 1 : (stryCov_9fa48("5656"), monthly.length - 1)));
      const projectedMonthly = stryMutAct_9fa48("5657") ? Math.min(0, last + avgGrowth) : (stryCov_9fa48("5657"), Math.max(0, stryMutAct_9fa48("5658") ? last - avgGrowth : (stryCov_9fa48("5658"), last + avgGrowth)));
      return stryMutAct_9fa48("5659") ? {} : (stryCov_9fa48("5659"), {
        projectedMonthly: stryMutAct_9fa48("5660") ? Math.round(projectedMonthly * 100) * 100 : (stryCov_9fa48("5660"), Math.round(stryMutAct_9fa48("5661") ? projectedMonthly / 100 : (stryCov_9fa48("5661"), projectedMonthly * 100)) / 100),
        trend
      });
    }
  }
}