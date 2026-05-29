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
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchAnalytic } from './search-analytic.entity';
import { Course } from '../courses/course.entity';
import { Lesson } from '../courses/lesson.entity';
import { Post } from '../forums/post.entity';
export type IndexName = 'courses' | 'lessons' | 'posts';
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  constructor(private readonly es: ElasticsearchService, @InjectRepository(SearchAnalytic)
  private readonly analyticsRepo: Repository<SearchAnalytic>) {}
  async onModuleInit() {
    if (stryMutAct_9fa48("6104")) {
      {}
    } else {
      stryCov_9fa48("6104");
      await this.ensureIndices();
    }
  }

  // ─── Index management ──────────────────────────────────────────────────────

  private async ensureIndices() {
    if (stryMutAct_9fa48("6105")) {
      {}
    } else {
      stryCov_9fa48("6105");
      const indices: Record<IndexName, object> = stryMutAct_9fa48("6106") ? {} : (stryCov_9fa48("6106"), {
        courses: stryMutAct_9fa48("6107") ? {} : (stryCov_9fa48("6107"), {
          mappings: stryMutAct_9fa48("6108") ? {} : (stryCov_9fa48("6108"), {
            properties: stryMutAct_9fa48("6109") ? {} : (stryCov_9fa48("6109"), {
              title: stryMutAct_9fa48("6110") ? {} : (stryCov_9fa48("6110"), {
                type: stryMutAct_9fa48("6111") ? "" : (stryCov_9fa48("6111"), 'text'),
                analyzer: stryMutAct_9fa48("6112") ? "" : (stryCov_9fa48("6112"), 'standard'),
                copy_to: stryMutAct_9fa48("6113") ? "" : (stryCov_9fa48("6113"), 'suggest')
              }),
              description: stryMutAct_9fa48("6114") ? {} : (stryCov_9fa48("6114"), {
                type: stryMutAct_9fa48("6115") ? "" : (stryCov_9fa48("6115"), 'text'),
                analyzer: stryMutAct_9fa48("6116") ? "" : (stryCov_9fa48("6116"), 'standard')
              }),
              level: stryMutAct_9fa48("6117") ? {} : (stryCov_9fa48("6117"), {
                type: stryMutAct_9fa48("6118") ? "" : (stryCov_9fa48("6118"), 'keyword')
              }),
              language: stryMutAct_9fa48("6119") ? {} : (stryCov_9fa48("6119"), {
                type: stryMutAct_9fa48("6120") ? "" : (stryCov_9fa48("6120"), 'keyword')
              }),
              durationHours: stryMutAct_9fa48("6121") ? {} : (stryCov_9fa48("6121"), {
                type: stryMutAct_9fa48("6122") ? "" : (stryCov_9fa48("6122"), 'float')
              }),
              isPublished: stryMutAct_9fa48("6123") ? {} : (stryCov_9fa48("6123"), {
                type: stryMutAct_9fa48("6124") ? "" : (stryCov_9fa48("6124"), 'boolean')
              }),
              suggest: stryMutAct_9fa48("6125") ? {} : (stryCov_9fa48("6125"), {
                type: stryMutAct_9fa48("6126") ? "" : (stryCov_9fa48("6126"), 'completion')
              })
            })
          })
        }),
        lessons: stryMutAct_9fa48("6127") ? {} : (stryCov_9fa48("6127"), {
          mappings: stryMutAct_9fa48("6128") ? {} : (stryCov_9fa48("6128"), {
            properties: stryMutAct_9fa48("6129") ? {} : (stryCov_9fa48("6129"), {
              title: stryMutAct_9fa48("6130") ? {} : (stryCov_9fa48("6130"), {
                type: stryMutAct_9fa48("6131") ? "" : (stryCov_9fa48("6131"), 'text'),
                analyzer: stryMutAct_9fa48("6132") ? "" : (stryCov_9fa48("6132"), 'standard'),
                copy_to: stryMutAct_9fa48("6133") ? "" : (stryCov_9fa48("6133"), 'suggest')
              }),
              content: stryMutAct_9fa48("6134") ? {} : (stryCov_9fa48("6134"), {
                type: stryMutAct_9fa48("6135") ? "" : (stryCov_9fa48("6135"), 'text'),
                analyzer: stryMutAct_9fa48("6136") ? "" : (stryCov_9fa48("6136"), 'standard')
              }),
              moduleId: stryMutAct_9fa48("6137") ? {} : (stryCov_9fa48("6137"), {
                type: stryMutAct_9fa48("6138") ? "" : (stryCov_9fa48("6138"), 'keyword')
              }),
              durationMinutes: stryMutAct_9fa48("6139") ? {} : (stryCov_9fa48("6139"), {
                type: stryMutAct_9fa48("6140") ? "" : (stryCov_9fa48("6140"), 'integer')
              }),
              suggest: stryMutAct_9fa48("6141") ? {} : (stryCov_9fa48("6141"), {
                type: stryMutAct_9fa48("6142") ? "" : (stryCov_9fa48("6142"), 'completion')
              })
            })
          })
        }),
        posts: stryMutAct_9fa48("6143") ? {} : (stryCov_9fa48("6143"), {
          mappings: stryMutAct_9fa48("6144") ? {} : (stryCov_9fa48("6144"), {
            properties: stryMutAct_9fa48("6145") ? {} : (stryCov_9fa48("6145"), {
              title: stryMutAct_9fa48("6146") ? {} : (stryCov_9fa48("6146"), {
                type: stryMutAct_9fa48("6147") ? "" : (stryCov_9fa48("6147"), 'text'),
                analyzer: stryMutAct_9fa48("6148") ? "" : (stryCov_9fa48("6148"), 'standard'),
                copy_to: stryMutAct_9fa48("6149") ? "" : (stryCov_9fa48("6149"), 'suggest')
              }),
              content: stryMutAct_9fa48("6150") ? {} : (stryCov_9fa48("6150"), {
                type: stryMutAct_9fa48("6151") ? "" : (stryCov_9fa48("6151"), 'text'),
                analyzer: stryMutAct_9fa48("6152") ? "" : (stryCov_9fa48("6152"), 'standard')
              }),
              courseId: stryMutAct_9fa48("6153") ? {} : (stryCov_9fa48("6153"), {
                type: stryMutAct_9fa48("6154") ? "" : (stryCov_9fa48("6154"), 'keyword')
              }),
              userId: stryMutAct_9fa48("6155") ? {} : (stryCov_9fa48("6155"), {
                type: stryMutAct_9fa48("6156") ? "" : (stryCov_9fa48("6156"), 'keyword')
              }),
              suggest: stryMutAct_9fa48("6157") ? {} : (stryCov_9fa48("6157"), {
                type: stryMutAct_9fa48("6158") ? "" : (stryCov_9fa48("6158"), 'completion')
              })
            })
          })
        })
      });
      for (const [index, body] of Object.entries(indices)) {
        if (stryMutAct_9fa48("6159")) {
          {}
        } else {
          stryCov_9fa48("6159");
          try {
            if (stryMutAct_9fa48("6160")) {
              {}
            } else {
              stryCov_9fa48("6160");
              const exists = await this.es.indices.exists(stryMutAct_9fa48("6161") ? {} : (stryCov_9fa48("6161"), {
                index
              }));
              if (stryMutAct_9fa48("6164") ? false : stryMutAct_9fa48("6163") ? true : stryMutAct_9fa48("6162") ? exists : (stryCov_9fa48("6162", "6163", "6164"), !exists)) {
                if (stryMutAct_9fa48("6165")) {
                  {}
                } else {
                  stryCov_9fa48("6165");
                  await this.es.indices.create(stryMutAct_9fa48("6166") ? {} : (stryCov_9fa48("6166"), {
                    index,
                    ...body
                  }));
                  this.logger.log(stryMutAct_9fa48("6167") ? `` : (stryCov_9fa48("6167"), `Created ES index: ${index}`));
                }
              }
            }
          } catch (err) {
            if (stryMutAct_9fa48("6168")) {
              {}
            } else {
              stryCov_9fa48("6168");
              this.logger.warn(stryMutAct_9fa48("6169") ? `` : (stryCov_9fa48("6169"), `Failed to ensure index ${index}: ${err}`));
            }
          }
        }
      }
    }
  }

  // ─── Indexing ──────────────────────────────────────────────────────────────

  async indexCourse(course: Course) {
    if (stryMutAct_9fa48("6170")) {
      {}
    } else {
      stryCov_9fa48("6170");
      await this.es.index(stryMutAct_9fa48("6171") ? {} : (stryCov_9fa48("6171"), {
        index: stryMutAct_9fa48("6172") ? "" : (stryCov_9fa48("6172"), 'courses'),
        id: course.id,
        document: stryMutAct_9fa48("6173") ? {} : (stryCov_9fa48("6173"), {
          title: course.title,
          description: course.description,
          level: course.level,
          language: course.language,
          durationHours: course.durationHours,
          isPublished: course.isPublished,
          suggest: stryMutAct_9fa48("6174") ? {} : (stryCov_9fa48("6174"), {
            input: stryMutAct_9fa48("6175") ? [] : (stryCov_9fa48("6175"), [course.title])
          })
        })
      }));
    }
  }
  async indexLesson(lesson: Lesson) {
    if (stryMutAct_9fa48("6176")) {
      {}
    } else {
      stryCov_9fa48("6176");
      await this.es.index(stryMutAct_9fa48("6177") ? {} : (stryCov_9fa48("6177"), {
        index: stryMutAct_9fa48("6178") ? "" : (stryCov_9fa48("6178"), 'lessons'),
        id: lesson.id,
        document: stryMutAct_9fa48("6179") ? {} : (stryCov_9fa48("6179"), {
          title: lesson.title,
          content: lesson.content,
          moduleId: lesson.moduleId,
          durationMinutes: lesson.durationMinutes,
          suggest: stryMutAct_9fa48("6180") ? {} : (stryCov_9fa48("6180"), {
            input: stryMutAct_9fa48("6181") ? [] : (stryCov_9fa48("6181"), [lesson.title])
          })
        })
      }));
    }
  }
  async indexPost(post: Post) {
    if (stryMutAct_9fa48("6182")) {
      {}
    } else {
      stryCov_9fa48("6182");
      await this.es.index(stryMutAct_9fa48("6183") ? {} : (stryCov_9fa48("6183"), {
        index: stryMutAct_9fa48("6184") ? "" : (stryCov_9fa48("6184"), 'posts'),
        id: post.id,
        document: stryMutAct_9fa48("6185") ? {} : (stryCov_9fa48("6185"), {
          title: post.title,
          content: post.content,
          courseId: post.courseId,
          userId: post.userId,
          suggest: stryMutAct_9fa48("6186") ? {} : (stryCov_9fa48("6186"), {
            input: stryMutAct_9fa48("6187") ? [] : (stryCov_9fa48("6187"), [post.title])
          })
        })
      }));
    }
  }
  async deleteFromIndex(index: IndexName, id: string) {
    if (stryMutAct_9fa48("6188")) {
      {}
    } else {
      stryCov_9fa48("6188");
      try {
        if (stryMutAct_9fa48("6189")) {
          {}
        } else {
          stryCov_9fa48("6189");
          await this.es.delete(stryMutAct_9fa48("6190") ? {} : (stryCov_9fa48("6190"), {
            index,
            id
          }));
        }
      } catch {
        // ignore 404 — document may not have been indexed
      }
    }
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  async search(query: string, indices: IndexName[] = stryMutAct_9fa48("6191") ? [] : (stryCov_9fa48("6191"), [stryMutAct_9fa48("6192") ? "" : (stryCov_9fa48("6192"), 'courses'), stryMutAct_9fa48("6193") ? "" : (stryCov_9fa48("6193"), 'lessons'), stryMutAct_9fa48("6194") ? "" : (stryCov_9fa48("6194"), 'posts')]), userId?: string) {
    if (stryMutAct_9fa48("6195")) {
      {}
    } else {
      stryCov_9fa48("6195");
      const response = await this.es.search(stryMutAct_9fa48("6196") ? {} : (stryCov_9fa48("6196"), {
        index: indices.join(stryMutAct_9fa48("6197") ? "" : (stryCov_9fa48("6197"), ',')),
        query: stryMutAct_9fa48("6198") ? {} : (stryCov_9fa48("6198"), {
          multi_match: stryMutAct_9fa48("6199") ? {} : (stryCov_9fa48("6199"), {
            query,
            fields: stryMutAct_9fa48("6200") ? [] : (stryCov_9fa48("6200"), [stryMutAct_9fa48("6201") ? "" : (stryCov_9fa48("6201"), 'title^3'), stryMutAct_9fa48("6202") ? "" : (stryCov_9fa48("6202"), 'description^2'), stryMutAct_9fa48("6203") ? "" : (stryCov_9fa48("6203"), 'content')]),
            fuzziness: stryMutAct_9fa48("6204") ? "" : (stryCov_9fa48("6204"), 'AUTO'),
            prefix_length: 1
          })
        }),
        highlight: stryMutAct_9fa48("6205") ? {} : (stryCov_9fa48("6205"), {
          fields: stryMutAct_9fa48("6206") ? {} : (stryCov_9fa48("6206"), {
            title: {},
            description: {},
            content: {}
          })
        }),
        size: 20
      }));
      const hits = response.hits.hits.map(stryMutAct_9fa48("6207") ? () => undefined : (stryCov_9fa48("6207"), hit => stryMutAct_9fa48("6208") ? {} : (stryCov_9fa48("6208"), {
        id: hit._id,
        type: hit._index,
        score: hit._score,
        ...(hit._source as object),
        highlight: hit.highlight
      })));
      await this.trackAnalytic(query, hits.length, userId);
      return stryMutAct_9fa48("6209") ? {} : (stryCov_9fa48("6209"), {
        total: response.hits.total,
        hits
      });
    }
  }

  // ─── Autocomplete ──────────────────────────────────────────────────────────

  async autocomplete(prefix: string, indices: IndexName[] = stryMutAct_9fa48("6210") ? [] : (stryCov_9fa48("6210"), [stryMutAct_9fa48("6211") ? "" : (stryCov_9fa48("6211"), 'courses'), stryMutAct_9fa48("6212") ? "" : (stryCov_9fa48("6212"), 'lessons'), stryMutAct_9fa48("6213") ? "" : (stryCov_9fa48("6213"), 'posts')])) {
    if (stryMutAct_9fa48("6214")) {
      {}
    } else {
      stryCov_9fa48("6214");
      const response = await this.es.search(stryMutAct_9fa48("6215") ? {} : (stryCov_9fa48("6215"), {
        index: indices.join(stryMutAct_9fa48("6216") ? "" : (stryCov_9fa48("6216"), ',')),
        suggest: stryMutAct_9fa48("6217") ? {} : (stryCov_9fa48("6217"), {
          suggestions: stryMutAct_9fa48("6218") ? {} : (stryCov_9fa48("6218"), {
            prefix,
            completion: stryMutAct_9fa48("6219") ? {} : (stryCov_9fa48("6219"), {
              field: stryMutAct_9fa48("6220") ? "" : (stryCov_9fa48("6220"), 'suggest'),
              size: 5,
              skip_duplicates: stryMutAct_9fa48("6221") ? false : (stryCov_9fa48("6221"), true),
              fuzzy: stryMutAct_9fa48("6222") ? {} : (stryCov_9fa48("6222"), {
                fuzziness: 1
              })
            })
          })
        }),
        _source: stryMutAct_9fa48("6223") ? [] : (stryCov_9fa48("6223"), [stryMutAct_9fa48("6224") ? "" : (stryCov_9fa48("6224"), 'title')]),
        size: 0
      }));
      const suggestions = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stryMutAct_9fa48("6225") ?
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response.suggest?.['suggestions'] as any[])?.flatMap((s: any) => (s.options ?? []).map((o: any) => ({
        text: o.text,
        index: o._index,
        id: o._id
      }))) && [] : (stryCov_9fa48("6225"), (stryMutAct_9fa48("6226") ? (response.suggest?.['suggestions'] as any[]).flatMap((s: any) => (s.options ?? []).map((o: any) => ({
        text: o.text,
        index: o._index,
        id: o._id
      }))) : (stryCov_9fa48("6226"), (response.suggest?.['suggestions'] as any[])?.flatMap(stryMutAct_9fa48("6227") ? () => undefined : (stryCov_9fa48("6227"), (s: any) => (stryMutAct_9fa48("6228") ? s.options && [] : (stryCov_9fa48("6228"), s.options ?? (stryMutAct_9fa48("6229") ? ["Stryker was here"] : (stryCov_9fa48("6229"), [])))).map(stryMutAct_9fa48("6230") ? () => undefined : (stryCov_9fa48("6230"), (o: any) => stryMutAct_9fa48("6231") ? {} : (stryCov_9fa48("6231"), {
        text: o.text,
        index: o._index,
        id: o._id
      }))))))) ?? (stryMutAct_9fa48("6232") ? ["Stryker was here"] : (stryCov_9fa48("6232"), [])));
      return suggestions;
    }
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  private async trackAnalytic(query: string, resultsCount: number, userId?: string) {
    if (stryMutAct_9fa48("6233")) {
      {}
    } else {
      stryCov_9fa48("6233");
      try {
        if (stryMutAct_9fa48("6234")) {
          {}
        } else {
          stryCov_9fa48("6234");
          await this.analyticsRepo.save(this.analyticsRepo.create(stryMutAct_9fa48("6235") ? {} : (stryCov_9fa48("6235"), {
            query,
            resultsCount,
            userId: stryMutAct_9fa48("6236") ? userId && null : (stryCov_9fa48("6236"), userId ?? null)
          })));
        }
      } catch {
        // non-critical
      }
    }
  }
  async trackClick(query: string, resultId: string, resultType: string, userId?: string) {
    if (stryMutAct_9fa48("6237")) {
      {}
    } else {
      stryCov_9fa48("6237");
      await this.analyticsRepo.save(this.analyticsRepo.create(stryMutAct_9fa48("6238") ? {} : (stryCov_9fa48("6238"), {
        query,
        resultsCount: 0,
        clickedResultId: resultId,
        clickedResultType: resultType,
        userId: stryMutAct_9fa48("6239") ? userId && null : (stryCov_9fa48("6239"), userId ?? null)
      })));
    }
  }
  async getTopQueries(limit = 10) {
    if (stryMutAct_9fa48("6240")) {
      {}
    } else {
      stryCov_9fa48("6240");
      return this.analyticsRepo.createQueryBuilder(stryMutAct_9fa48("6241") ? "" : (stryCov_9fa48("6241"), 'a')).select(stryMutAct_9fa48("6242") ? "" : (stryCov_9fa48("6242"), 'a.query'), stryMutAct_9fa48("6243") ? "" : (stryCov_9fa48("6243"), 'query')).addSelect(stryMutAct_9fa48("6244") ? "" : (stryCov_9fa48("6244"), 'COUNT(*)'), stryMutAct_9fa48("6245") ? "" : (stryCov_9fa48("6245"), 'count')).groupBy(stryMutAct_9fa48("6246") ? "" : (stryCov_9fa48("6246"), 'a.query')).orderBy(stryMutAct_9fa48("6247") ? "" : (stryCov_9fa48("6247"), 'count'), stryMutAct_9fa48("6248") ? "" : (stryCov_9fa48("6248"), 'DESC')).limit(limit).getRawMany();
    }
  }
}