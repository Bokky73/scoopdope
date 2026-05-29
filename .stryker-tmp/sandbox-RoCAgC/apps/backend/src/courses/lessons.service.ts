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
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Lesson } from './lesson.entity';
import { SearchService } from '../search/search.service';
import { TranscribeService } from './transcribe.service';
import { Interval } from '@nestjs/schedule';
@Injectable()
export class LessonsService {
  private readonly logger = new Logger(LessonsService.name);
  constructor(@InjectRepository(Lesson)
  private repo: Repository<Lesson>, private readonly searchService: SearchService, private readonly transcribeService: TranscribeService) {}
  findByModule(moduleId: string) {
    if (stryMutAct_9fa48("2670")) {
      {}
    } else {
      stryCov_9fa48("2670");
      return this.repo.find(stryMutAct_9fa48("2671") ? {} : (stryCov_9fa48("2671"), {
        where: stryMutAct_9fa48("2672") ? {} : (stryCov_9fa48("2672"), {
          moduleId
        }),
        order: stryMutAct_9fa48("2673") ? {} : (stryCov_9fa48("2673"), {
          order: stryMutAct_9fa48("2674") ? "" : (stryCov_9fa48("2674"), 'ASC')
        })
      }));
    }
  }
  findOne(id: string) {
    if (stryMutAct_9fa48("2675")) {
      {}
    } else {
      stryCov_9fa48("2675");
      return this.repo.findOne(stryMutAct_9fa48("2676") ? {} : (stryCov_9fa48("2676"), {
        where: stryMutAct_9fa48("2677") ? {} : (stryCov_9fa48("2677"), {
          id
        })
      }));
    }
  }
  async create(moduleId: string, data: Partial<Lesson>) {
    if (stryMutAct_9fa48("2678")) {
      {}
    } else {
      stryCov_9fa48("2678");
      const lesson = await this.repo.save(this.repo.create(stryMutAct_9fa48("2679") ? {} : (stryCov_9fa48("2679"), {
        ...data,
        moduleId
      })));
      await this.searchService.indexLesson(lesson).catch(() => {});
      if (stryMutAct_9fa48("2681") ? false : stryMutAct_9fa48("2680") ? true : (stryCov_9fa48("2680", "2681"), lesson.videoUrl)) {
        if (stryMutAct_9fa48("2682")) {
          {}
        } else {
          stryCov_9fa48("2682");
          this.triggerTranscription(lesson);
        }
      }
      return lesson;
    }
  }
  async update(id: string, data: Partial<Lesson>) {
    if (stryMutAct_9fa48("2683")) {
      {}
    } else {
      stryCov_9fa48("2683");
      const lesson = await this.findOne(id);
      if (stryMutAct_9fa48("2686") ? false : stryMutAct_9fa48("2685") ? true : stryMutAct_9fa48("2684") ? lesson : (stryCov_9fa48("2684", "2685", "2686"), !lesson)) throw new NotFoundException(stryMutAct_9fa48("2687") ? "" : (stryCov_9fa48("2687"), 'Lesson not found'));
      const oldVideoUrl = lesson.videoUrl;
      const updated = await this.repo.save(stryMutAct_9fa48("2688") ? {} : (stryCov_9fa48("2688"), {
        ...lesson,
        ...data
      }));
      await this.searchService.indexLesson(updated).catch(() => {});
      if (stryMutAct_9fa48("2691") ? updated.videoUrl || updated.videoUrl !== oldVideoUrl : stryMutAct_9fa48("2690") ? false : stryMutAct_9fa48("2689") ? true : (stryCov_9fa48("2689", "2690", "2691"), updated.videoUrl && (stryMutAct_9fa48("2693") ? updated.videoUrl === oldVideoUrl : stryMutAct_9fa48("2692") ? true : (stryCov_9fa48("2692", "2693"), updated.videoUrl !== oldVideoUrl)))) {
        if (stryMutAct_9fa48("2694")) {
          {}
        } else {
          stryCov_9fa48("2694");
          this.triggerTranscription(updated);
        }
      }
      return updated;
    }
  }
  private async triggerTranscription(lesson: Lesson) {
    if (stryMutAct_9fa48("2695")) {
      {}
    } else {
      stryCov_9fa48("2695");
      try {
        if (stryMutAct_9fa48("2696")) {
          {}
        } else {
          stryCov_9fa48("2696");
          const jobName = await this.transcribeService.startTranscription(lesson.id, lesson.videoUrl);
          await this.repo.update(lesson.id, stryMutAct_9fa48("2697") ? {} : (stryCov_9fa48("2697"), {
            transcriptionJobName: jobName
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("2698")) {
          {}
        } else {
          stryCov_9fa48("2698");
          this.logger.error(stryMutAct_9fa48("2699") ? `` : (stryCov_9fa48("2699"), `Failed to trigger transcription for lesson ${lesson.id}: ${error.message}`));
        }
      }
    }
  }
  @Interval(60000)
  // Every 1 minute
  async checkTranscriptionJobs() {
    if (stryMutAct_9fa48("2700")) {
      {}
    } else {
      stryCov_9fa48("2700");
      const lessons = await this.repo.find(stryMutAct_9fa48("2701") ? {} : (stryCov_9fa48("2701"), {
        where: stryMutAct_9fa48("2702") ? {} : (stryCov_9fa48("2702"), {
          transcriptionJobName: Not(IsNull()),
          transcript: IsNull()
        })
      }));
      for (const lesson of lessons) {
        if (stryMutAct_9fa48("2703")) {
          {}
        } else {
          stryCov_9fa48("2703");
          try {
            if (stryMutAct_9fa48("2704")) {
              {}
            } else {
              stryCov_9fa48("2704");
              const result = await this.transcribeService.getTranscriptionResult(lesson.transcriptionJobName);
              if (stryMutAct_9fa48("2707") ? result || typeof result !== 'string' : stryMutAct_9fa48("2706") ? false : stryMutAct_9fa48("2705") ? true : (stryCov_9fa48("2705", "2706", "2707"), result && (stryMutAct_9fa48("2709") ? typeof result === 'string' : stryMutAct_9fa48("2708") ? true : (stryCov_9fa48("2708", "2709"), typeof result !== (stryMutAct_9fa48("2710") ? "" : (stryCov_9fa48("2710"), 'string')))))) {
                if (stryMutAct_9fa48("2711")) {
                  {}
                } else {
                  stryCov_9fa48("2711");
                  // COMPLETED
                  const srt = this.transcribeService.convertToSrt(result);
                  await this.repo.update(lesson.id, stryMutAct_9fa48("2712") ? {} : (stryCov_9fa48("2712"), {
                    transcript: result,
                    transcriptSrt: srt
                  }));
                  this.logger.log(stryMutAct_9fa48("2713") ? `` : (stryCov_9fa48("2713"), `Transcription completed for lesson ${lesson.id}`));
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("2714")) {
              {}
            } else {
              stryCov_9fa48("2714");
              this.logger.error(stryMutAct_9fa48("2715") ? `` : (stryCov_9fa48("2715"), `Error checking transcription for lesson ${lesson.id}: ${error.message}`));
            }
          }
        }
      }
    }
  }
  async remove(id: string) {
    if (stryMutAct_9fa48("2716")) {
      {}
    } else {
      stryCov_9fa48("2716");
      const lesson = await this.findOne(id);
      if (stryMutAct_9fa48("2719") ? false : stryMutAct_9fa48("2718") ? true : stryMutAct_9fa48("2717") ? lesson : (stryCov_9fa48("2717", "2718", "2719"), !lesson)) throw new NotFoundException(stryMutAct_9fa48("2720") ? "" : (stryCov_9fa48("2720"), 'Lesson not found'));
      await this.searchService.deleteFromIndex(stryMutAct_9fa48("2721") ? "" : (stryCov_9fa48("2721"), 'lessons'), id).catch(() => {});
      return this.repo.remove(lesson);
    }
  }
}