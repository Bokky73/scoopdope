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
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { DataSource } from 'typeorm';
import { CoursesService } from './courses.service';
import { Course } from './course.entity';
import { setupTestDatabase, teardownTestDatabase } from '../test/integration-test.setup';
describe(stryMutAct_9fa48("2450") ? "" : (stryCov_9fa48("2450"), 'CoursesService (Integration)'), () => {
  if (stryMutAct_9fa48("2451")) {
    {}
  } else {
    stryCov_9fa48("2451");
    let service: CoursesService;
    let module: TestingModule;
    let dataSource: DataSource;
    beforeAll(async () => {
      if (stryMutAct_9fa48("2452")) {
        {}
      } else {
        stryCov_9fa48("2452");
        dataSource = await setupTestDatabase();
        module = await Test.createTestingModule(stryMutAct_9fa48("2453") ? {} : (stryCov_9fa48("2453"), {
          imports: stryMutAct_9fa48("2454") ? [] : (stryCov_9fa48("2454"), [TypeOrmModule.forFeature(stryMutAct_9fa48("2455") ? [] : (stryCov_9fa48("2455"), [Course])), CacheModule.register()]),
          providers: stryMutAct_9fa48("2456") ? [] : (stryCov_9fa48("2456"), [CoursesService])
        })).overrideProvider(stryMutAct_9fa48("2457") ? "" : (stryCov_9fa48("2457"), 'DataSource')).useValue(dataSource).compile();
        service = module.get<CoursesService>(CoursesService);
      }
    });
    afterAll(async () => {
      if (stryMutAct_9fa48("2458")) {
        {}
      } else {
        stryCov_9fa48("2458");
        await module.close();
        await teardownTestDatabase();
      }
    });
    beforeEach(async () => {
      if (stryMutAct_9fa48("2459")) {
        {}
      } else {
        stryCov_9fa48("2459");
        const repo = dataSource.getRepository(Course);
        await repo.clear();
      }
    });
    describe(stryMutAct_9fa48("2460") ? "" : (stryCov_9fa48("2460"), 'create'), () => {
      if (stryMutAct_9fa48("2461")) {
        {}
      } else {
        stryCov_9fa48("2461");
        it(stryMutAct_9fa48("2462") ? "" : (stryCov_9fa48("2462"), 'should create a course'), async () => {
          if (stryMutAct_9fa48("2463")) {
            {}
          } else {
            stryCov_9fa48("2463");
            const courseData = stryMutAct_9fa48("2464") ? {} : (stryCov_9fa48("2464"), {
              title: stryMutAct_9fa48("2465") ? "" : (stryCov_9fa48("2465"), 'Blockchain Basics'),
              description: stryMutAct_9fa48("2466") ? "" : (stryCov_9fa48("2466"), 'Learn blockchain fundamentals'),
              level: stryMutAct_9fa48("2467") ? "" : (stryCov_9fa48("2467"), 'beginner'),
              isPublished: stryMutAct_9fa48("2468") ? false : (stryCov_9fa48("2468"), true)
            });
            const course = await service.create(courseData);
            expect(course).toBeDefined();
            expect(course.title).toBe(courseData.title);
            expect(course.description).toBe(courseData.description);
          }
        });
      }
    });
    describe(stryMutAct_9fa48("2469") ? "" : (stryCov_9fa48("2469"), 'findAll'), () => {
      if (stryMutAct_9fa48("2470")) {
        {}
      } else {
        stryCov_9fa48("2470");
        it(stryMutAct_9fa48("2471") ? "" : (stryCov_9fa48("2471"), 'should return published courses'), async () => {
          if (stryMutAct_9fa48("2472")) {
            {}
          } else {
            stryCov_9fa48("2472");
            await service.create(stryMutAct_9fa48("2473") ? {} : (stryCov_9fa48("2473"), {
              title: stryMutAct_9fa48("2474") ? "" : (stryCov_9fa48("2474"), 'Course 1'),
              description: stryMutAct_9fa48("2475") ? "" : (stryCov_9fa48("2475"), 'Desc 1'),
              level: stryMutAct_9fa48("2476") ? "" : (stryCov_9fa48("2476"), 'beginner'),
              isPublished: stryMutAct_9fa48("2477") ? false : (stryCov_9fa48("2477"), true)
            }));
            await service.create(stryMutAct_9fa48("2478") ? {} : (stryCov_9fa48("2478"), {
              title: stryMutAct_9fa48("2479") ? "" : (stryCov_9fa48("2479"), 'Course 2'),
              description: stryMutAct_9fa48("2480") ? "" : (stryCov_9fa48("2480"), 'Desc 2'),
              level: stryMutAct_9fa48("2481") ? "" : (stryCov_9fa48("2481"), 'intermediate'),
              isPublished: stryMutAct_9fa48("2482") ? true : (stryCov_9fa48("2482"), false)
            }));
            const result = await service.findAll();
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toBe(stryMutAct_9fa48("2483") ? "" : (stryCov_9fa48("2483"), 'Course 1'));
            expect(result.total).toBe(1);
          }
        });
        it(stryMutAct_9fa48("2484") ? "" : (stryCov_9fa48("2484"), 'should filter by search term'), async () => {
          if (stryMutAct_9fa48("2485")) {
            {}
          } else {
            stryCov_9fa48("2485");
            await service.create(stryMutAct_9fa48("2486") ? {} : (stryCov_9fa48("2486"), {
              title: stryMutAct_9fa48("2487") ? "" : (stryCov_9fa48("2487"), 'Stellar Blockchain'),
              description: stryMutAct_9fa48("2488") ? "" : (stryCov_9fa48("2488"), 'Learn Stellar'),
              level: stryMutAct_9fa48("2489") ? "" : (stryCov_9fa48("2489"), 'beginner'),
              isPublished: stryMutAct_9fa48("2490") ? false : (stryCov_9fa48("2490"), true)
            }));
            await service.create(stryMutAct_9fa48("2491") ? {} : (stryCov_9fa48("2491"), {
              title: stryMutAct_9fa48("2492") ? "" : (stryCov_9fa48("2492"), 'Solana Blockchain'),
              description: stryMutAct_9fa48("2493") ? "" : (stryCov_9fa48("2493"), 'Learn Solana'),
              level: stryMutAct_9fa48("2494") ? "" : (stryCov_9fa48("2494"), 'beginner'),
              isPublished: stryMutAct_9fa48("2495") ? false : (stryCov_9fa48("2495"), true)
            }));
            const result = await service.findAll(stryMutAct_9fa48("2496") ? {} : (stryCov_9fa48("2496"), {
              search: stryMutAct_9fa48("2497") ? "" : (stryCov_9fa48("2497"), 'Stellar')
            }));
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toContain(stryMutAct_9fa48("2498") ? "" : (stryCov_9fa48("2498"), 'Stellar'));
          }
        });
        it(stryMutAct_9fa48("2499") ? "" : (stryCov_9fa48("2499"), 'should filter by level'), async () => {
          if (stryMutAct_9fa48("2500")) {
            {}
          } else {
            stryCov_9fa48("2500");
            await service.create(stryMutAct_9fa48("2501") ? {} : (stryCov_9fa48("2501"), {
              title: stryMutAct_9fa48("2502") ? "" : (stryCov_9fa48("2502"), 'Beginner Course'),
              description: stryMutAct_9fa48("2503") ? "" : (stryCov_9fa48("2503"), 'Desc'),
              level: stryMutAct_9fa48("2504") ? "" : (stryCov_9fa48("2504"), 'beginner'),
              isPublished: stryMutAct_9fa48("2505") ? false : (stryCov_9fa48("2505"), true)
            }));
            await service.create(stryMutAct_9fa48("2506") ? {} : (stryCov_9fa48("2506"), {
              title: stryMutAct_9fa48("2507") ? "" : (stryCov_9fa48("2507"), 'Advanced Course'),
              description: stryMutAct_9fa48("2508") ? "" : (stryCov_9fa48("2508"), 'Desc'),
              level: stryMutAct_9fa48("2509") ? "" : (stryCov_9fa48("2509"), 'advanced'),
              isPublished: stryMutAct_9fa48("2510") ? false : (stryCov_9fa48("2510"), true)
            }));
            const result = await service.findAll(stryMutAct_9fa48("2511") ? {} : (stryCov_9fa48("2511"), {
              level: stryMutAct_9fa48("2512") ? "" : (stryCov_9fa48("2512"), 'beginner')
            }));
            expect(result.data).toHaveLength(1);
            expect(result.data[0].level).toBe(stryMutAct_9fa48("2513") ? "" : (stryCov_9fa48("2513"), 'beginner'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("2514") ? "" : (stryCov_9fa48("2514"), 'findOne'), () => {
      if (stryMutAct_9fa48("2515")) {
        {}
      } else {
        stryCov_9fa48("2515");
        it(stryMutAct_9fa48("2516") ? "" : (stryCov_9fa48("2516"), 'should return a course by id'), async () => {
          if (stryMutAct_9fa48("2517")) {
            {}
          } else {
            stryCov_9fa48("2517");
            const created = await service.create(stryMutAct_9fa48("2518") ? {} : (stryCov_9fa48("2518"), {
              title: stryMutAct_9fa48("2519") ? "" : (stryCov_9fa48("2519"), 'Test Course'),
              description: stryMutAct_9fa48("2520") ? "" : (stryCov_9fa48("2520"), 'Test'),
              level: stryMutAct_9fa48("2521") ? "" : (stryCov_9fa48("2521"), 'beginner'),
              isPublished: stryMutAct_9fa48("2522") ? false : (stryCov_9fa48("2522"), true)
            }));
            const found = await service.findOne(created.id);
            expect(found).toBeDefined();
            expect(found.id).toBe(created.id);
            expect(found.title).toBe(stryMutAct_9fa48("2523") ? "" : (stryCov_9fa48("2523"), 'Test Course'));
          }
        });
        it(stryMutAct_9fa48("2524") ? "" : (stryCov_9fa48("2524"), 'should throw NotFoundException for non-existent course'), async () => {
          if (stryMutAct_9fa48("2525")) {
            {}
          } else {
            stryCov_9fa48("2525");
            await expect(service.findOne(stryMutAct_9fa48("2526") ? "" : (stryCov_9fa48("2526"), 'non-existent-id'))).rejects.toThrow(stryMutAct_9fa48("2527") ? "" : (stryCov_9fa48("2527"), 'Course not found'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("2528") ? "" : (stryCov_9fa48("2528"), 'update'), () => {
      if (stryMutAct_9fa48("2529")) {
        {}
      } else {
        stryCov_9fa48("2529");
        it(stryMutAct_9fa48("2530") ? "" : (stryCov_9fa48("2530"), 'should update a course'), async () => {
          if (stryMutAct_9fa48("2531")) {
            {}
          } else {
            stryCov_9fa48("2531");
            const created = await service.create(stryMutAct_9fa48("2532") ? {} : (stryCov_9fa48("2532"), {
              title: stryMutAct_9fa48("2533") ? "" : (stryCov_9fa48("2533"), 'Original Title'),
              description: stryMutAct_9fa48("2534") ? "" : (stryCov_9fa48("2534"), 'Original Desc'),
              level: stryMutAct_9fa48("2535") ? "" : (stryCov_9fa48("2535"), 'beginner'),
              isPublished: stryMutAct_9fa48("2536") ? false : (stryCov_9fa48("2536"), true)
            }));
            const updated = await service.update(created.id, stryMutAct_9fa48("2537") ? {} : (stryCov_9fa48("2537"), {
              title: stryMutAct_9fa48("2538") ? "" : (stryCov_9fa48("2538"), 'Updated Title')
            }));
            expect(updated.title).toBe(stryMutAct_9fa48("2539") ? "" : (stryCov_9fa48("2539"), 'Updated Title'));
            expect(updated.description).toBe(stryMutAct_9fa48("2540") ? "" : (stryCov_9fa48("2540"), 'Original Desc'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("2541") ? "" : (stryCov_9fa48("2541"), 'delete'), () => {
      if (stryMutAct_9fa48("2542")) {
        {}
      } else {
        stryCov_9fa48("2542");
        it(stryMutAct_9fa48("2543") ? "" : (stryCov_9fa48("2543"), 'should delete a course'), async () => {
          if (stryMutAct_9fa48("2544")) {
            {}
          } else {
            stryCov_9fa48("2544");
            const created = await service.create(stryMutAct_9fa48("2545") ? {} : (stryCov_9fa48("2545"), {
              title: stryMutAct_9fa48("2546") ? "" : (stryCov_9fa48("2546"), 'To Delete'),
              description: stryMutAct_9fa48("2547") ? "" : (stryCov_9fa48("2547"), 'Desc'),
              level: stryMutAct_9fa48("2548") ? "" : (stryCov_9fa48("2548"), 'beginner'),
              isPublished: stryMutAct_9fa48("2549") ? false : (stryCov_9fa48("2549"), true)
            }));
            await service.delete(created.id);
            await expect(service.findOne(created.id)).rejects.toThrow(stryMutAct_9fa48("2550") ? "" : (stryCov_9fa48("2550"), 'Course not found'));
          }
        });
      }
    });
  }
});