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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './survey.entity';
import { SurveyQuestion } from './survey-question.entity';
import { SurveyResponse } from './survey-response.entity';
@Injectable()
export class SurveysService {
  constructor(@InjectRepository(Survey)
  private surveyRepo: Repository<Survey>, @InjectRepository(SurveyQuestion)
  private questionRepo: Repository<SurveyQuestion>, @InjectRepository(SurveyResponse)
  private responseRepo: Repository<SurveyResponse>) {}
  async createSurvey(courseId: string, title: string, description: string, triggerType: 'completion' | 'milestone', triggerMilestone?: number, allowAnonymous = stryMutAct_9fa48("6912") ? true : (stryCov_9fa48("6912"), false)): Promise<Survey> {
    if (stryMutAct_9fa48("6913")) {
      {}
    } else {
      stryCov_9fa48("6913");
      const survey = this.surveyRepo.create(stryMutAct_9fa48("6914") ? {} : (stryCov_9fa48("6914"), {
        courseId,
        title,
        description,
        triggerType,
        triggerMilestone,
        allowAnonymous
      }));
      return this.surveyRepo.save(survey);
    }
  }

  /** Auto-create a default NPS + open-ended survey for a course on completion */
  async createCompletionSurvey(courseId: string, courseTitle: string): Promise<Survey> {
    if (stryMutAct_9fa48("6915")) {
      {}
    } else {
      stryCov_9fa48("6915");
      const existing = await this.surveyRepo.findOne(stryMutAct_9fa48("6916") ? {} : (stryCov_9fa48("6916"), {
        where: stryMutAct_9fa48("6917") ? {} : (stryCov_9fa48("6917"), {
          courseId,
          triggerType: stryMutAct_9fa48("6918") ? "" : (stryCov_9fa48("6918"), 'completion'),
          isActive: stryMutAct_9fa48("6919") ? false : (stryCov_9fa48("6919"), true)
        })
      }));
      if (stryMutAct_9fa48("6921") ? false : stryMutAct_9fa48("6920") ? true : (stryCov_9fa48("6920", "6921"), existing)) return existing;
      const survey = await this.createSurvey(courseId, stryMutAct_9fa48("6922") ? `` : (stryCov_9fa48("6922"), `${courseTitle} — Feedback`), stryMutAct_9fa48("6923") ? "" : (stryCov_9fa48("6923"), 'Help us improve this course with your feedback.'), stryMutAct_9fa48("6924") ? "" : (stryCov_9fa48("6924"), 'completion'), undefined, stryMutAct_9fa48("6925") ? false : (stryCov_9fa48("6925"), true));
      await this.addQuestion(survey.id, stryMutAct_9fa48("6926") ? "" : (stryCov_9fa48("6926"), 'How likely are you to recommend this course? (0–10)'), stryMutAct_9fa48("6927") ? "" : (stryCov_9fa48("6927"), 'rating'), 1, undefined, stryMutAct_9fa48("6928") ? false : (stryCov_9fa48("6928"), true));
      await this.addQuestion(survey.id, stryMutAct_9fa48("6929") ? "" : (stryCov_9fa48("6929"), 'What did you enjoy most about this course?'), stryMutAct_9fa48("6930") ? "" : (stryCov_9fa48("6930"), 'text'), 2, undefined, stryMutAct_9fa48("6931") ? true : (stryCov_9fa48("6931"), false));
      await this.addQuestion(survey.id, stryMutAct_9fa48("6932") ? "" : (stryCov_9fa48("6932"), 'What could be improved?'), stryMutAct_9fa48("6933") ? "" : (stryCov_9fa48("6933"), 'text'), 3, undefined, stryMutAct_9fa48("6934") ? true : (stryCov_9fa48("6934"), false));
      return survey;
    }
  }
  async addQuestion(surveyId: string, text: string, type: 'rating' | 'text' | 'mcq', order: number, options?: string[], required = stryMutAct_9fa48("6935") ? false : (stryCov_9fa48("6935"), true)): Promise<SurveyQuestion> {
    if (stryMutAct_9fa48("6936")) {
      {}
    } else {
      stryCov_9fa48("6936");
      const question = this.questionRepo.create(stryMutAct_9fa48("6937") ? {} : (stryCov_9fa48("6937"), {
        surveyId,
        text,
        type,
        order,
        options,
        required
      }));
      return this.questionRepo.save(question);
    }
  }
  async submitResponse(surveyId: string, userId: string, answers: Record<string, string | number>, isAnonymous = stryMutAct_9fa48("6938") ? true : (stryCov_9fa48("6938"), false)): Promise<SurveyResponse> {
    if (stryMutAct_9fa48("6939")) {
      {}
    } else {
      stryCov_9fa48("6939");
      const survey = await this.surveyRepo.findOne(stryMutAct_9fa48("6940") ? {} : (stryCov_9fa48("6940"), {
        where: stryMutAct_9fa48("6941") ? {} : (stryCov_9fa48("6941"), {
          id: surveyId
        })
      }));
      const response = this.responseRepo.create(stryMutAct_9fa48("6942") ? {} : (stryCov_9fa48("6942"), {
        surveyId,
        userId: (stryMutAct_9fa48("6945") ? survey?.allowAnonymous || isAnonymous : stryMutAct_9fa48("6944") ? false : stryMutAct_9fa48("6943") ? true : (stryCov_9fa48("6943", "6944", "6945"), (stryMutAct_9fa48("6946") ? survey.allowAnonymous : (stryCov_9fa48("6946"), survey?.allowAnonymous)) && isAnonymous)) ? stryMutAct_9fa48("6947") ? "" : (stryCov_9fa48("6947"), 'anonymous') : userId,
        answers,
        isAnonymous: (stryMutAct_9fa48("6948") ? survey.allowAnonymous : (stryCov_9fa48("6948"), survey?.allowAnonymous)) ? isAnonymous : stryMutAct_9fa48("6949") ? true : (stryCov_9fa48("6949"), false)
      }));
      return this.responseRepo.save(response);
    }
  }
  async getSurveyByCourse(courseId: string): Promise<Survey[]> {
    if (stryMutAct_9fa48("6950")) {
      {}
    } else {
      stryCov_9fa48("6950");
      return this.surveyRepo.find(stryMutAct_9fa48("6951") ? {} : (stryCov_9fa48("6951"), {
        where: stryMutAct_9fa48("6952") ? {} : (stryCov_9fa48("6952"), {
          courseId,
          isActive: stryMutAct_9fa48("6953") ? false : (stryCov_9fa48("6953"), true)
        }),
        relations: stryMutAct_9fa48("6954") ? [] : (stryCov_9fa48("6954"), [stryMutAct_9fa48("6955") ? "" : (stryCov_9fa48("6955"), 'questions')]),
        order: stryMutAct_9fa48("6956") ? {} : (stryCov_9fa48("6956"), {
          createdAt: stryMutAct_9fa48("6957") ? "" : (stryCov_9fa48("6957"), 'DESC')
        })
      }));
    }
  }
  async getResponsesForSurvey(surveyId: string): Promise<SurveyResponse[]> {
    if (stryMutAct_9fa48("6958")) {
      {}
    } else {
      stryCov_9fa48("6958");
      return this.responseRepo.find(stryMutAct_9fa48("6959") ? {} : (stryCov_9fa48("6959"), {
        where: stryMutAct_9fa48("6960") ? {} : (stryCov_9fa48("6960"), {
          surveyId
        }),
        relations: stryMutAct_9fa48("6961") ? [] : (stryCov_9fa48("6961"), [stryMutAct_9fa48("6962") ? "" : (stryCov_9fa48("6962"), 'user')])
      }));
    }
  }
  async getAnalytics(surveyId: string): Promise<{
    totalResponses: number;
    npsScore: number | null;
    questionStats: Record<string, any>;
  }> {
    if (stryMutAct_9fa48("6963")) {
      {}
    } else {
      stryCov_9fa48("6963");
      const survey = await this.surveyRepo.findOne(stryMutAct_9fa48("6964") ? {} : (stryCov_9fa48("6964"), {
        where: stryMutAct_9fa48("6965") ? {} : (stryCov_9fa48("6965"), {
          id: surveyId
        }),
        relations: stryMutAct_9fa48("6966") ? [] : (stryCov_9fa48("6966"), [stryMutAct_9fa48("6967") ? "" : (stryCov_9fa48("6967"), 'responses'), stryMutAct_9fa48("6968") ? "" : (stryCov_9fa48("6968"), 'questions')])
      }));
      if (stryMutAct_9fa48("6971") ? false : stryMutAct_9fa48("6970") ? true : stryMutAct_9fa48("6969") ? survey : (stryCov_9fa48("6969", "6970", "6971"), !survey)) throw new Error(stryMutAct_9fa48("6972") ? "" : (stryCov_9fa48("6972"), 'Survey not found'));
      const totalResponses = survey.responses.length;
      const questionStats: Record<string, any> = {};
      let npsScore: number | null = null;
      for (const question of survey.questions) {
        if (stryMutAct_9fa48("6973")) {
          {}
        } else {
          stryCov_9fa48("6973");
          const responses = survey.responses.map(stryMutAct_9fa48("6974") ? () => undefined : (stryCov_9fa48("6974"), r => r.answers[question.id]));
          if (stryMutAct_9fa48("6977") ? question.type !== 'rating' : stryMutAct_9fa48("6976") ? false : stryMutAct_9fa48("6975") ? true : (stryCov_9fa48("6975", "6976", "6977"), question.type === (stryMutAct_9fa48("6978") ? "" : (stryCov_9fa48("6978"), 'rating')))) {
            if (stryMutAct_9fa48("6979")) {
              {}
            } else {
              stryCov_9fa48("6979");
              const ratings = responses.filter(r => typeof r === 'number') as number[];
              const avg = (stryMutAct_9fa48("6983") ? ratings.length <= 0 : stryMutAct_9fa48("6982") ? ratings.length >= 0 : stryMutAct_9fa48("6981") ? false : stryMutAct_9fa48("6980") ? true : (stryCov_9fa48("6980", "6981", "6982", "6983"), ratings.length > 0)) ? stryMutAct_9fa48("6984") ? ratings.reduce((a, b) => a + b) * ratings.length : (stryCov_9fa48("6984"), ratings.reduce(stryMutAct_9fa48("6985") ? () => undefined : (stryCov_9fa48("6985"), (a, b) => stryMutAct_9fa48("6986") ? a - b : (stryCov_9fa48("6986"), a + b))) / ratings.length) : 0;
              questionStats[question.id] = stryMutAct_9fa48("6987") ? {} : (stryCov_9fa48("6987"), {
                average: avg,
                count: ratings.length
              });

              // NPS: first rating question with 0-10 scale
              if (stryMutAct_9fa48("6990") ? npsScore === null || ratings.length > 0 : stryMutAct_9fa48("6989") ? false : stryMutAct_9fa48("6988") ? true : (stryCov_9fa48("6988", "6989", "6990"), (stryMutAct_9fa48("6992") ? npsScore !== null : stryMutAct_9fa48("6991") ? true : (stryCov_9fa48("6991", "6992"), npsScore === null)) && (stryMutAct_9fa48("6995") ? ratings.length <= 0 : stryMutAct_9fa48("6994") ? ratings.length >= 0 : stryMutAct_9fa48("6993") ? true : (stryCov_9fa48("6993", "6994", "6995"), ratings.length > 0)))) {
                if (stryMutAct_9fa48("6996")) {
                  {}
                } else {
                  stryCov_9fa48("6996");
                  const promoters = stryMutAct_9fa48("6997") ? ratings.length : (stryCov_9fa48("6997"), ratings.filter(stryMutAct_9fa48("6998") ? () => undefined : (stryCov_9fa48("6998"), r => stryMutAct_9fa48("7002") ? r < 9 : stryMutAct_9fa48("7001") ? r > 9 : stryMutAct_9fa48("7000") ? false : stryMutAct_9fa48("6999") ? true : (stryCov_9fa48("6999", "7000", "7001", "7002"), r >= 9))).length);
                  const detractors = stryMutAct_9fa48("7003") ? ratings.length : (stryCov_9fa48("7003"), ratings.filter(stryMutAct_9fa48("7004") ? () => undefined : (stryCov_9fa48("7004"), r => stryMutAct_9fa48("7008") ? r > 6 : stryMutAct_9fa48("7007") ? r < 6 : stryMutAct_9fa48("7006") ? false : stryMutAct_9fa48("7005") ? true : (stryCov_9fa48("7005", "7006", "7007", "7008"), r <= 6))).length);
                  npsScore = Math.round(stryMutAct_9fa48("7009") ? (promoters - detractors) / ratings.length / 100 : (stryCov_9fa48("7009"), (stryMutAct_9fa48("7010") ? (promoters - detractors) * ratings.length : (stryCov_9fa48("7010"), (stryMutAct_9fa48("7011") ? promoters + detractors : (stryCov_9fa48("7011"), promoters - detractors)) / ratings.length)) * 100));
                }
              }
            }
          } else if (stryMutAct_9fa48("7014") ? question.type !== 'mcq' : stryMutAct_9fa48("7013") ? false : stryMutAct_9fa48("7012") ? true : (stryCov_9fa48("7012", "7013", "7014"), question.type === (stryMutAct_9fa48("7015") ? "" : (stryCov_9fa48("7015"), 'mcq')))) {
            if (stryMutAct_9fa48("7016")) {
              {}
            } else {
              stryCov_9fa48("7016");
              const counts: Record<string, number> = {};
              responses.forEach(r => {
                if (stryMutAct_9fa48("7017")) {
                  {}
                } else {
                  stryCov_9fa48("7017");
                  if (stryMutAct_9fa48("7019") ? false : stryMutAct_9fa48("7018") ? true : (stryCov_9fa48("7018", "7019"), r)) counts[String(r)] = stryMutAct_9fa48("7020") ? (counts[String(r)] || 0) - 1 : (stryCov_9fa48("7020"), (stryMutAct_9fa48("7023") ? counts[String(r)] && 0 : stryMutAct_9fa48("7022") ? false : stryMutAct_9fa48("7021") ? true : (stryCov_9fa48("7021", "7022", "7023"), counts[String(r)] || 0)) + 1);
                }
              });
              questionStats[question.id] = counts;
            }
          } else {
            if (stryMutAct_9fa48("7024")) {
              {}
            } else {
              stryCov_9fa48("7024");
              questionStats[question.id] = stryMutAct_9fa48("7025") ? {} : (stryCov_9fa48("7025"), {
                responses: stryMutAct_9fa48("7026") ? responses : (stryCov_9fa48("7026"), responses.filter(stryMutAct_9fa48("7027") ? () => undefined : (stryCov_9fa48("7027"), r => r)))
              });
            }
          }
        }
      }
      return stryMutAct_9fa48("7028") ? {} : (stryCov_9fa48("7028"), {
        totalResponses,
        npsScore,
        questionStats
      });
    }
  }

  /** Aggregate survey results across all courses for an instructor */
  async getInstructorSurveyAggregate(instructorId: string): Promise<{
    courseId: string;
    surveyId: string;
    title: string;
    totalResponses: number;
    npsScore: number | null;
  }[]> {
    if (stryMutAct_9fa48("7029")) {
      {}
    } else {
      stryCov_9fa48("7029");
      const surveys = await this.surveyRepo.find(stryMutAct_9fa48("7030") ? {} : (stryCov_9fa48("7030"), {
        where: stryMutAct_9fa48("7031") ? {} : (stryCov_9fa48("7031"), {
          isActive: stryMutAct_9fa48("7032") ? false : (stryCov_9fa48("7032"), true)
        }),
        relations: stryMutAct_9fa48("7033") ? [] : (stryCov_9fa48("7033"), [stryMutAct_9fa48("7034") ? "" : (stryCov_9fa48("7034"), 'course'), stryMutAct_9fa48("7035") ? "" : (stryCov_9fa48("7035"), 'responses'), stryMutAct_9fa48("7036") ? "" : (stryCov_9fa48("7036"), 'questions')])
      }));
      const instructorSurveys = stryMutAct_9fa48("7037") ? surveys : (stryCov_9fa48("7037"), surveys.filter(stryMutAct_9fa48("7038") ? () => undefined : (stryCov_9fa48("7038"), s => stryMutAct_9fa48("7041") ? s.course || (s.course as any).instructorId === instructorId : stryMutAct_9fa48("7040") ? false : stryMutAct_9fa48("7039") ? true : (stryCov_9fa48("7039", "7040", "7041"), s.course && (stryMutAct_9fa48("7043") ? (s.course as any).instructorId !== instructorId : stryMutAct_9fa48("7042") ? true : (stryCov_9fa48("7042", "7043"), (s.course as any).instructorId === instructorId))))));
      return Promise.all(instructorSurveys.map(async s => {
        if (stryMutAct_9fa48("7044")) {
          {}
        } else {
          stryCov_9fa48("7044");
          const analytics = await this.getAnalytics(s.id);
          return stryMutAct_9fa48("7045") ? {} : (stryCov_9fa48("7045"), {
            courseId: s.courseId,
            surveyId: s.id,
            title: s.title,
            totalResponses: analytics.totalResponses,
            npsScore: analytics.npsScore
          });
        }
      }));
    }
  }
}