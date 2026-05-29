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
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ComprehendClient, DetectToxicContentCommand, TextSegment } from '@aws-sdk/client-comprehend';
import { ModerationItem } from './moderation-item.entity';
import { ModerationLog } from './moderation-log.entity';
import { ContentType, ModerationAction, ModerationStatus } from './moderation.enums';
import { AppealDto, FlagContentDto, ModerationQueueQueryDto, ReviewItemDto } from './dto/moderation.dto';
@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly comprehend: ComprehendClient;
  private readonly toxicityThreshold: number;
  constructor(@InjectRepository(ModerationItem)
  private readonly itemRepo: Repository<ModerationItem>, @InjectRepository(ModerationLog)
  private readonly logRepo: Repository<ModerationLog>, private readonly config: ConfigService) {
    if (stryMutAct_9fa48("5107")) {
      {}
    } else {
      stryCov_9fa48("5107");
      this.comprehend = new ComprehendClient(stryMutAct_9fa48("5108") ? {} : (stryCov_9fa48("5108"), {
        region: stryMutAct_9fa48("5111") ? this.config.get<string>('aws.region') && 'us-east-1' : stryMutAct_9fa48("5110") ? false : stryMutAct_9fa48("5109") ? true : (stryCov_9fa48("5109", "5110", "5111"), this.config.get<string>(stryMutAct_9fa48("5112") ? "" : (stryCov_9fa48("5112"), 'aws.region')) || (stryMutAct_9fa48("5113") ? "" : (stryCov_9fa48("5113"), 'us-east-1'))),
        credentials: stryMutAct_9fa48("5114") ? {} : (stryCov_9fa48("5114"), {
          accessKeyId: stryMutAct_9fa48("5117") ? this.config.get<string>('aws.accessKeyId') && '' : stryMutAct_9fa48("5116") ? false : stryMutAct_9fa48("5115") ? true : (stryCov_9fa48("5115", "5116", "5117"), this.config.get<string>(stryMutAct_9fa48("5118") ? "" : (stryCov_9fa48("5118"), 'aws.accessKeyId')) || (stryMutAct_9fa48("5119") ? "Stryker was here!" : (stryCov_9fa48("5119"), ''))),
          secretAccessKey: stryMutAct_9fa48("5122") ? this.config.get<string>('aws.secretAccessKey') && '' : stryMutAct_9fa48("5121") ? false : stryMutAct_9fa48("5120") ? true : (stryCov_9fa48("5120", "5121", "5122"), this.config.get<string>(stryMutAct_9fa48("5123") ? "" : (stryCov_9fa48("5123"), 'aws.secretAccessKey')) || (stryMutAct_9fa48("5124") ? "Stryker was here!" : (stryCov_9fa48("5124"), '')))
        })
      }));
      this.toxicityThreshold = stryMutAct_9fa48("5127") ? this.config.get<number>('moderation.toxicityThreshold') && 0.7 : stryMutAct_9fa48("5126") ? false : stryMutAct_9fa48("5125") ? true : (stryCov_9fa48("5125", "5126", "5127"), this.config.get<number>(stryMutAct_9fa48("5128") ? "" : (stryCov_9fa48("5128"), 'moderation.toxicityThreshold')) || 0.7);
    }
  }

  /** Auto-moderate content via AWS Comprehend. Returns true if content was flagged. */
  async analyzeContent(contentType: ContentType, contentId: string, text: string, userId: string): Promise<boolean> {
    if (stryMutAct_9fa48("5129")) {
      {}
    } else {
      stryCov_9fa48("5129");
      let toxicityScore: number | null = null;
      let comprehendResult: Record<string, unknown> | null = null;
      try {
        if (stryMutAct_9fa48("5130")) {
          {}
        } else {
          stryCov_9fa48("5130");
          const segments: TextSegment[] = stryMutAct_9fa48("5131") ? [] : (stryCov_9fa48("5131"), [stryMutAct_9fa48("5132") ? {} : (stryCov_9fa48("5132"), {
            Text: text
          })]);
          const command = new DetectToxicContentCommand(stryMutAct_9fa48("5133") ? {} : (stryCov_9fa48("5133"), {
            TextSegments: segments,
            LanguageCode: stryMutAct_9fa48("5134") ? "" : (stryCov_9fa48("5134"), 'en')
          }));
          const response = await this.comprehend.send(command);
          comprehendResult = response as unknown as Record<string, unknown>;
          const resultItems = stryMutAct_9fa48("5135") ? response.ResultList && [] : (stryCov_9fa48("5135"), response.ResultList ?? (stryMutAct_9fa48("5136") ? ["Stryker was here"] : (stryCov_9fa48("5136"), [])));
          toxicityScore = stryMutAct_9fa48("5137") ? resultItems[0]?.Toxicity && null : (stryCov_9fa48("5137"), (stryMutAct_9fa48("5138") ? resultItems[0].Toxicity : (stryCov_9fa48("5138"), resultItems[0]?.Toxicity)) ?? null);
        }
      } catch (err) {
        if (stryMutAct_9fa48("5139")) {
          {}
        } else {
          stryCov_9fa48("5139");
          this.logger.warn(stryMutAct_9fa48("5140") ? `` : (stryCov_9fa48("5140"), `Comprehend analysis failed for ${contentType}:${contentId} — ${err}`));
        }
      }
      const isToxic = stryMutAct_9fa48("5143") ? toxicityScore !== null || toxicityScore >= this.toxicityThreshold : stryMutAct_9fa48("5142") ? false : stryMutAct_9fa48("5141") ? true : (stryCov_9fa48("5141", "5142", "5143"), (stryMutAct_9fa48("5145") ? toxicityScore === null : stryMutAct_9fa48("5144") ? true : (stryCov_9fa48("5144", "5145"), toxicityScore !== null)) && (stryMutAct_9fa48("5148") ? toxicityScore < this.toxicityThreshold : stryMutAct_9fa48("5147") ? toxicityScore > this.toxicityThreshold : stryMutAct_9fa48("5146") ? true : (stryCov_9fa48("5146", "5147", "5148"), toxicityScore >= this.toxicityThreshold)));
      if (stryMutAct_9fa48("5150") ? false : stryMutAct_9fa48("5149") ? true : (stryCov_9fa48("5149", "5150"), isToxic)) {
        if (stryMutAct_9fa48("5151")) {
          {}
        } else {
          stryCov_9fa48("5151");
          const item = this.itemRepo.create(stryMutAct_9fa48("5152") ? {} : (stryCov_9fa48("5152"), {
            contentType,
            contentId,
            reportedByUserId: userId,
            status: ModerationStatus.PENDING,
            flagReason: stryMutAct_9fa48("5153") ? "" : (stryCov_9fa48("5153"), 'Auto-flagged by AWS Comprehend'),
            toxicityScore,
            comprehendResult
          }));
          const saved = await this.itemRepo.save(item);
          await this.log(saved.id, contentType, contentId, ModerationAction.FLAG, null, stryMutAct_9fa48("5154") ? "" : (stryCov_9fa48("5154"), 'auto-flagged'));
        }
      }
      return isToxic;
    }
  }

  /** Manually flag content */
  async flagContent(dto: FlagContentDto, userId: string): Promise<ModerationItem> {
    if (stryMutAct_9fa48("5155")) {
      {}
    } else {
      stryCov_9fa48("5155");
      const existing = await this.itemRepo.findOne(stryMutAct_9fa48("5156") ? {} : (stryCov_9fa48("5156"), {
        where: stryMutAct_9fa48("5157") ? {} : (stryCov_9fa48("5157"), {
          contentType: dto.contentType,
          contentId: dto.contentId,
          status: ModerationStatus.PENDING
        })
      }));
      if (stryMutAct_9fa48("5159") ? false : stryMutAct_9fa48("5158") ? true : (stryCov_9fa48("5158", "5159"), existing)) return existing;
      const item = this.itemRepo.create(stryMutAct_9fa48("5160") ? {} : (stryCov_9fa48("5160"), {
        contentType: dto.contentType,
        contentId: dto.contentId,
        reportedByUserId: userId,
        status: ModerationStatus.PENDING,
        flagReason: stryMutAct_9fa48("5161") ? dto.reason && null : (stryCov_9fa48("5161"), dto.reason ?? null)
      }));
      const saved = await this.itemRepo.save(item);
      await this.log(saved.id, dto.contentType, dto.contentId, ModerationAction.FLAG, userId, dto.reason);
      return saved;
    }
  }

  /** Get moderation queue (admin only) */
  async getQueue(query: ModerationQueueQueryDto): Promise<ModerationItem[]> {
    if (stryMutAct_9fa48("5162")) {
      {}
    } else {
      stryCov_9fa48("5162");
      const where: FindOptionsWhere<ModerationItem> = {};
      if (stryMutAct_9fa48("5164") ? false : stryMutAct_9fa48("5163") ? true : (stryCov_9fa48("5163", "5164"), query.status)) where.status = query.status;
      if (stryMutAct_9fa48("5166") ? false : stryMutAct_9fa48("5165") ? true : (stryCov_9fa48("5165", "5166"), query.contentType)) where.contentType = query.contentType;
      return this.itemRepo.find(stryMutAct_9fa48("5167") ? {} : (stryCov_9fa48("5167"), {
        where,
        order: stryMutAct_9fa48("5168") ? {} : (stryCov_9fa48("5168"), {
          createdAt: stryMutAct_9fa48("5169") ? "" : (stryCov_9fa48("5169"), 'ASC')
        })
      }));
    }
  }

  /** Admin reviews an item */
  async reviewItem(id: string, dto: ReviewItemDto, adminId: string): Promise<ModerationItem> {
    if (stryMutAct_9fa48("5170")) {
      {}
    } else {
      stryCov_9fa48("5170");
      const item = await this.getItemOrThrow(id);
      if (stryMutAct_9fa48("5173") ? item.status !== ModerationStatus.PENDING || item.status !== ModerationStatus.APPEALED : stryMutAct_9fa48("5172") ? false : stryMutAct_9fa48("5171") ? true : (stryCov_9fa48("5171", "5172", "5173"), (stryMutAct_9fa48("5175") ? item.status === ModerationStatus.PENDING : stryMutAct_9fa48("5174") ? true : (stryCov_9fa48("5174", "5175"), item.status !== ModerationStatus.PENDING)) && (stryMutAct_9fa48("5177") ? item.status === ModerationStatus.APPEALED : stryMutAct_9fa48("5176") ? true : (stryCov_9fa48("5176", "5177"), item.status !== ModerationStatus.APPEALED)))) {
        if (stryMutAct_9fa48("5178")) {
          {}
        } else {
          stryCov_9fa48("5178");
          throw new BadRequestException(stryMutAct_9fa48("5179") ? "" : (stryCov_9fa48("5179"), 'Item is not pending review'));
        }
      }
      item.status = dto.status;
      item.reviewedByUserId = adminId;
      item.reviewNote = stryMutAct_9fa48("5180") ? dto.note && null : (stryCov_9fa48("5180"), dto.note ?? null);
      const saved = await this.itemRepo.save(item);
      const action = (stryMutAct_9fa48("5183") ? dto.status !== ModerationStatus.APPROVED : stryMutAct_9fa48("5182") ? false : stryMutAct_9fa48("5181") ? true : (stryCov_9fa48("5181", "5182", "5183"), dto.status === ModerationStatus.APPROVED)) ? ModerationAction.APPROVE : ModerationAction.REJECT;
      await this.log(id, item.contentType, item.contentId, action, adminId, dto.note);
      return saved;
    }
  }

  /** Content owner submits an appeal */
  async submitAppeal(id: string, dto: AppealDto, userId: string): Promise<ModerationItem> {
    if (stryMutAct_9fa48("5184")) {
      {}
    } else {
      stryCov_9fa48("5184");
      const item = await this.getItemOrThrow(id);
      if (stryMutAct_9fa48("5187") ? item.status === ModerationStatus.REJECTED : stryMutAct_9fa48("5186") ? false : stryMutAct_9fa48("5185") ? true : (stryCov_9fa48("5185", "5186", "5187"), item.status !== ModerationStatus.REJECTED)) {
        if (stryMutAct_9fa48("5188")) {
          {}
        } else {
          stryCov_9fa48("5188");
          throw new BadRequestException(stryMutAct_9fa48("5189") ? "" : (stryCov_9fa48("5189"), 'Only rejected items can be appealed'));
        }
      }
      if (stryMutAct_9fa48("5191") ? false : stryMutAct_9fa48("5190") ? true : (stryCov_9fa48("5190", "5191"), item.appealedByUserId)) {
        if (stryMutAct_9fa48("5192")) {
          {}
        } else {
          stryCov_9fa48("5192");
          throw new BadRequestException(stryMutAct_9fa48("5193") ? "" : (stryCov_9fa48("5193"), 'Appeal already submitted'));
        }
      }
      item.status = ModerationStatus.APPEALED;
      item.appealReason = dto.reason;
      item.appealedByUserId = userId;
      const saved = await this.itemRepo.save(item);
      await this.log(id, item.contentType, item.contentId, ModerationAction.APPEAL_SUBMITTED, userId, dto.reason);
      return saved;
    }
  }

  /** Admin resolves an appeal */
  async resolveAppeal(id: string, approve: boolean, adminId: string, note?: string): Promise<ModerationItem> {
    if (stryMutAct_9fa48("5194")) {
      {}
    } else {
      stryCov_9fa48("5194");
      const item = await this.getItemOrThrow(id);
      if (stryMutAct_9fa48("5197") ? item.status === ModerationStatus.APPEALED : stryMutAct_9fa48("5196") ? false : stryMutAct_9fa48("5195") ? true : (stryCov_9fa48("5195", "5196", "5197"), item.status !== ModerationStatus.APPEALED)) {
        if (stryMutAct_9fa48("5198")) {
          {}
        } else {
          stryCov_9fa48("5198");
          throw new BadRequestException(stryMutAct_9fa48("5199") ? "" : (stryCov_9fa48("5199"), 'Item is not under appeal'));
        }
      }
      item.status = approve ? ModerationStatus.APPROVED : ModerationStatus.REJECTED;
      item.reviewedByUserId = adminId;
      item.reviewNote = stryMutAct_9fa48("5200") ? note && null : (stryCov_9fa48("5200"), note ?? null);
      const saved = await this.itemRepo.save(item);
      const action = approve ? ModerationAction.APPEAL_APPROVED : ModerationAction.APPEAL_REJECTED;
      await this.log(id, item.contentType, item.contentId, action, adminId, note);
      return saved;
    }
  }
  async getItemOrThrow(id: string): Promise<ModerationItem> {
    if (stryMutAct_9fa48("5201")) {
      {}
    } else {
      stryCov_9fa48("5201");
      const item = await this.itemRepo.findOne(stryMutAct_9fa48("5202") ? {} : (stryCov_9fa48("5202"), {
        where: stryMutAct_9fa48("5203") ? {} : (stryCov_9fa48("5203"), {
          id
        })
      }));
      if (stryMutAct_9fa48("5206") ? false : stryMutAct_9fa48("5205") ? true : stryMutAct_9fa48("5204") ? item : (stryCov_9fa48("5204", "5205", "5206"), !item)) throw new NotFoundException(stryMutAct_9fa48("5207") ? "" : (stryCov_9fa48("5207"), 'Moderation item not found'));
      return item;
    }
  }
  async getLogs(moderationItemId: string): Promise<ModerationLog[]> {
    if (stryMutAct_9fa48("5208")) {
      {}
    } else {
      stryCov_9fa48("5208");
      return this.logRepo.find(stryMutAct_9fa48("5209") ? {} : (stryCov_9fa48("5209"), {
        where: stryMutAct_9fa48("5210") ? {} : (stryCov_9fa48("5210"), {
          moderationItemId
        }),
        order: stryMutAct_9fa48("5211") ? {} : (stryCov_9fa48("5211"), {
          createdAt: stryMutAct_9fa48("5212") ? "" : (stryCov_9fa48("5212"), 'ASC')
        })
      }));
    }
  }
  private async log(moderationItemId: string, contentType: ContentType, contentId: string, action: ModerationAction, performedByUserId: string | null, note?: string) {
    if (stryMutAct_9fa48("5213")) {
      {}
    } else {
      stryCov_9fa48("5213");
      const entry = this.logRepo.create(stryMutAct_9fa48("5214") ? {} : (stryCov_9fa48("5214"), {
        moderationItemId,
        contentType,
        contentId,
        action,
        performedByUserId,
        note: stryMutAct_9fa48("5215") ? note && null : (stryCov_9fa48("5215"), note ?? null)
      }));
      await this.logRepo.save(entry);
    }
  }
}