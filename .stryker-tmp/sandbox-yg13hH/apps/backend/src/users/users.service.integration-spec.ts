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
import { DataSource } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { setupTestDatabase, teardownTestDatabase } from '../test/integration-test.setup';
describe(stryMutAct_9fa48("7119") ? "" : (stryCov_9fa48("7119"), 'UsersService (Integration)'), () => {
  if (stryMutAct_9fa48("7120")) {
    {}
  } else {
    stryCov_9fa48("7120");
    let service: UsersService;
    let module: TestingModule;
    let dataSource: DataSource;
    beforeAll(async () => {
      if (stryMutAct_9fa48("7121")) {
        {}
      } else {
        stryCov_9fa48("7121");
        dataSource = await setupTestDatabase();
        module = await Test.createTestingModule(stryMutAct_9fa48("7122") ? {} : (stryCov_9fa48("7122"), {
          imports: stryMutAct_9fa48("7123") ? [] : (stryCov_9fa48("7123"), [TypeOrmModule.forFeature(stryMutAct_9fa48("7124") ? [] : (stryCov_9fa48("7124"), [User]))]),
          providers: stryMutAct_9fa48("7125") ? [] : (stryCov_9fa48("7125"), [UsersService])
        })).overrideProvider(stryMutAct_9fa48("7126") ? "" : (stryCov_9fa48("7126"), 'DataSource')).useValue(dataSource).compile();
        service = module.get<UsersService>(UsersService);
      }
    });
    afterAll(async () => {
      if (stryMutAct_9fa48("7127")) {
        {}
      } else {
        stryCov_9fa48("7127");
        await module.close();
        await teardownTestDatabase();
      }
    });
    beforeEach(async () => {
      if (stryMutAct_9fa48("7128")) {
        {}
      } else {
        stryCov_9fa48("7128");
        const repo = dataSource.getRepository(User);
        await repo.clear();
      }
    });
    describe(stryMutAct_9fa48("7129") ? "" : (stryCov_9fa48("7129"), 'create'), () => {
      if (stryMutAct_9fa48("7130")) {
        {}
      } else {
        stryCov_9fa48("7130");
        it(stryMutAct_9fa48("7131") ? "" : (stryCov_9fa48("7131"), 'should create a user'), async () => {
          if (stryMutAct_9fa48("7132")) {
            {}
          } else {
            stryCov_9fa48("7132");
            const userData = stryMutAct_9fa48("7133") ? {} : (stryCov_9fa48("7133"), {
              email: stryMutAct_9fa48("7134") ? "" : (stryCov_9fa48("7134"), 'test@example.com'),
              password: stryMutAct_9fa48("7135") ? "" : (stryCov_9fa48("7135"), 'hashed-password'),
              firstName: stryMutAct_9fa48("7136") ? "" : (stryCov_9fa48("7136"), 'John'),
              lastName: stryMutAct_9fa48("7137") ? "" : (stryCov_9fa48("7137"), 'Doe'),
              role: stryMutAct_9fa48("7138") ? "" : (stryCov_9fa48("7138"), 'student')
            });
            const user = await service.create(userData);
            expect(user).toBeDefined();
            expect(user.email).toBe(userData.email);
            expect(user.firstName).toBe(stryMutAct_9fa48("7139") ? "" : (stryCov_9fa48("7139"), 'John'));
          }
        });
        it(stryMutAct_9fa48("7140") ? "" : (stryCov_9fa48("7140"), 'should not allow duplicate emails'), async () => {
          if (stryMutAct_9fa48("7141")) {
            {}
          } else {
            stryCov_9fa48("7141");
            const userData = stryMutAct_9fa48("7142") ? {} : (stryCov_9fa48("7142"), {
              email: stryMutAct_9fa48("7143") ? "" : (stryCov_9fa48("7143"), 'duplicate@example.com'),
              password: stryMutAct_9fa48("7144") ? "" : (stryCov_9fa48("7144"), 'hashed-password'),
              firstName: stryMutAct_9fa48("7145") ? "" : (stryCov_9fa48("7145"), 'John'),
              lastName: stryMutAct_9fa48("7146") ? "" : (stryCov_9fa48("7146"), 'Doe')
            });
            await service.create(userData);
            await expect(service.create(userData)).rejects.toThrow();
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7147") ? "" : (stryCov_9fa48("7147"), 'findByEmail'), () => {
      if (stryMutAct_9fa48("7148")) {
        {}
      } else {
        stryCov_9fa48("7148");
        it(stryMutAct_9fa48("7149") ? "" : (stryCov_9fa48("7149"), 'should find user by email'), async () => {
          if (stryMutAct_9fa48("7150")) {
            {}
          } else {
            stryCov_9fa48("7150");
            const userData = stryMutAct_9fa48("7151") ? {} : (stryCov_9fa48("7151"), {
              email: stryMutAct_9fa48("7152") ? "" : (stryCov_9fa48("7152"), 'find@example.com'),
              password: stryMutAct_9fa48("7153") ? "" : (stryCov_9fa48("7153"), 'hashed-password'),
              firstName: stryMutAct_9fa48("7154") ? "" : (stryCov_9fa48("7154"), 'Jane'),
              lastName: stryMutAct_9fa48("7155") ? "" : (stryCov_9fa48("7155"), 'Smith')
            });
            await service.create(userData);
            const found = await service.findByEmail(userData.email);
            expect(found).toBeDefined();
            expect(found.email).toBe(userData.email);
          }
        });
        it(stryMutAct_9fa48("7156") ? "" : (stryCov_9fa48("7156"), 'should return null for non-existent email'), async () => {
          if (stryMutAct_9fa48("7157")) {
            {}
          } else {
            stryCov_9fa48("7157");
            const found = await service.findByEmail(stryMutAct_9fa48("7158") ? "" : (stryCov_9fa48("7158"), 'nonexistent@example.com'));
            expect(found).toBeNull();
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7159") ? "" : (stryCov_9fa48("7159"), 'findById'), () => {
      if (stryMutAct_9fa48("7160")) {
        {}
      } else {
        stryCov_9fa48("7160");
        it(stryMutAct_9fa48("7161") ? "" : (stryCov_9fa48("7161"), 'should find user by id'), async () => {
          if (stryMutAct_9fa48("7162")) {
            {}
          } else {
            stryCov_9fa48("7162");
            const created = await service.create(stryMutAct_9fa48("7163") ? {} : (stryCov_9fa48("7163"), {
              email: stryMutAct_9fa48("7164") ? "" : (stryCov_9fa48("7164"), 'byid@example.com'),
              password: stryMutAct_9fa48("7165") ? "" : (stryCov_9fa48("7165"), 'hashed-password'),
              firstName: stryMutAct_9fa48("7166") ? "" : (stryCov_9fa48("7166"), 'Test'),
              lastName: stryMutAct_9fa48("7167") ? "" : (stryCov_9fa48("7167"), 'User')
            }));
            const found = await service.findById(created.id);
            expect(found).toBeDefined();
            expect(found.id).toBe(created.id);
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7168") ? "" : (stryCov_9fa48("7168"), 'findAll'), () => {
      if (stryMutAct_9fa48("7169")) {
        {}
      } else {
        stryCov_9fa48("7169");
        it(stryMutAct_9fa48("7170") ? "" : (stryCov_9fa48("7170"), 'should return all users with pagination'), async () => {
          if (stryMutAct_9fa48("7171")) {
            {}
          } else {
            stryCov_9fa48("7171");
            await service.create(stryMutAct_9fa48("7172") ? {} : (stryCov_9fa48("7172"), {
              email: stryMutAct_9fa48("7173") ? "" : (stryCov_9fa48("7173"), 'user1@example.com'),
              password: stryMutAct_9fa48("7174") ? "" : (stryCov_9fa48("7174"), 'pass'),
              firstName: stryMutAct_9fa48("7175") ? "" : (stryCov_9fa48("7175"), 'User'),
              lastName: stryMutAct_9fa48("7176") ? "" : (stryCov_9fa48("7176"), 'One'),
              role: stryMutAct_9fa48("7177") ? "" : (stryCov_9fa48("7177"), 'student')
            }));
            await service.create(stryMutAct_9fa48("7178") ? {} : (stryCov_9fa48("7178"), {
              email: stryMutAct_9fa48("7179") ? "" : (stryCov_9fa48("7179"), 'user2@example.com'),
              password: stryMutAct_9fa48("7180") ? "" : (stryCov_9fa48("7180"), 'pass'),
              firstName: stryMutAct_9fa48("7181") ? "" : (stryCov_9fa48("7181"), 'User'),
              lastName: stryMutAct_9fa48("7182") ? "" : (stryCov_9fa48("7182"), 'Two'),
              role: stryMutAct_9fa48("7183") ? "" : (stryCov_9fa48("7183"), 'instructor')
            }));
            const result = await service.findAll(stryMutAct_9fa48("7184") ? {} : (stryCov_9fa48("7184"), {
              page: 1,
              limit: 10
            }));
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
          }
        });
        it(stryMutAct_9fa48("7185") ? "" : (stryCov_9fa48("7185"), 'should filter by role'), async () => {
          if (stryMutAct_9fa48("7186")) {
            {}
          } else {
            stryCov_9fa48("7186");
            await service.create(stryMutAct_9fa48("7187") ? {} : (stryCov_9fa48("7187"), {
              email: stryMutAct_9fa48("7188") ? "" : (stryCov_9fa48("7188"), 'student@example.com'),
              password: stryMutAct_9fa48("7189") ? "" : (stryCov_9fa48("7189"), 'pass'),
              firstName: stryMutAct_9fa48("7190") ? "" : (stryCov_9fa48("7190"), 'Student'),
              lastName: stryMutAct_9fa48("7191") ? "" : (stryCov_9fa48("7191"), 'User'),
              role: stryMutAct_9fa48("7192") ? "" : (stryCov_9fa48("7192"), 'student')
            }));
            await service.create(stryMutAct_9fa48("7193") ? {} : (stryCov_9fa48("7193"), {
              email: stryMutAct_9fa48("7194") ? "" : (stryCov_9fa48("7194"), 'instructor@example.com'),
              password: stryMutAct_9fa48("7195") ? "" : (stryCov_9fa48("7195"), 'pass'),
              firstName: stryMutAct_9fa48("7196") ? "" : (stryCov_9fa48("7196"), 'Instructor'),
              lastName: stryMutAct_9fa48("7197") ? "" : (stryCov_9fa48("7197"), 'User'),
              role: stryMutAct_9fa48("7198") ? "" : (stryCov_9fa48("7198"), 'instructor')
            }));
            const result = await service.findAll(stryMutAct_9fa48("7199") ? {} : (stryCov_9fa48("7199"), {
              role: stryMutAct_9fa48("7200") ? "" : (stryCov_9fa48("7200"), 'student')
            }));
            expect(result.data).toHaveLength(1);
            expect(result.data[0].role).toBe(stryMutAct_9fa48("7201") ? "" : (stryCov_9fa48("7201"), 'student'));
          }
        });
        it(stryMutAct_9fa48("7202") ? "" : (stryCov_9fa48("7202"), 'should filter by verification status'), async () => {
          if (stryMutAct_9fa48("7203")) {
            {}
          } else {
            stryCov_9fa48("7203");
            await service.create(stryMutAct_9fa48("7204") ? {} : (stryCov_9fa48("7204"), {
              email: stryMutAct_9fa48("7205") ? "" : (stryCov_9fa48("7205"), 'verified@example.com'),
              password: stryMutAct_9fa48("7206") ? "" : (stryCov_9fa48("7206"), 'pass'),
              firstName: stryMutAct_9fa48("7207") ? "" : (stryCov_9fa48("7207"), 'Verified'),
              lastName: stryMutAct_9fa48("7208") ? "" : (stryCov_9fa48("7208"), 'User'),
              isVerified: stryMutAct_9fa48("7209") ? false : (stryCov_9fa48("7209"), true)
            }));
            await service.create(stryMutAct_9fa48("7210") ? {} : (stryCov_9fa48("7210"), {
              email: stryMutAct_9fa48("7211") ? "" : (stryCov_9fa48("7211"), 'unverified@example.com'),
              password: stryMutAct_9fa48("7212") ? "" : (stryCov_9fa48("7212"), 'pass'),
              firstName: stryMutAct_9fa48("7213") ? "" : (stryCov_9fa48("7213"), 'Unverified'),
              lastName: stryMutAct_9fa48("7214") ? "" : (stryCov_9fa48("7214"), 'User'),
              isVerified: stryMutAct_9fa48("7215") ? true : (stryCov_9fa48("7215"), false)
            }));
            const result = await service.findAll(stryMutAct_9fa48("7216") ? {} : (stryCov_9fa48("7216"), {
              isVerified: stryMutAct_9fa48("7217") ? false : (stryCov_9fa48("7217"), true)
            }));
            expect(result.data).toHaveLength(1);
            expect(result.data[0].isVerified).toBe(stryMutAct_9fa48("7218") ? false : (stryCov_9fa48("7218"), true));
          }
        });
        it(stryMutAct_9fa48("7219") ? "" : (stryCov_9fa48("7219"), 'should search by email'), async () => {
          if (stryMutAct_9fa48("7220")) {
            {}
          } else {
            stryCov_9fa48("7220");
            await service.create(stryMutAct_9fa48("7221") ? {} : (stryCov_9fa48("7221"), {
              email: stryMutAct_9fa48("7222") ? "" : (stryCov_9fa48("7222"), 'search@example.com'),
              password: stryMutAct_9fa48("7223") ? "" : (stryCov_9fa48("7223"), 'pass'),
              firstName: stryMutAct_9fa48("7224") ? "" : (stryCov_9fa48("7224"), 'Search'),
              lastName: stryMutAct_9fa48("7225") ? "" : (stryCov_9fa48("7225"), 'User')
            }));
            const result = await service.findAll(stryMutAct_9fa48("7226") ? {} : (stryCov_9fa48("7226"), {
              search: stryMutAct_9fa48("7227") ? "" : (stryCov_9fa48("7227"), 'search')
            }));
            expect(result.data).toHaveLength(1);
            expect(result.data[0].email).toContain(stryMutAct_9fa48("7228") ? "" : (stryCov_9fa48("7228"), 'search'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7229") ? "" : (stryCov_9fa48("7229"), 'update'), () => {
      if (stryMutAct_9fa48("7230")) {
        {}
      } else {
        stryCov_9fa48("7230");
        it(stryMutAct_9fa48("7231") ? "" : (stryCov_9fa48("7231"), 'should update user'), async () => {
          if (stryMutAct_9fa48("7232")) {
            {}
          } else {
            stryCov_9fa48("7232");
            const created = await service.create(stryMutAct_9fa48("7233") ? {} : (stryCov_9fa48("7233"), {
              email: stryMutAct_9fa48("7234") ? "" : (stryCov_9fa48("7234"), 'update@example.com'),
              password: stryMutAct_9fa48("7235") ? "" : (stryCov_9fa48("7235"), 'pass'),
              firstName: stryMutAct_9fa48("7236") ? "" : (stryCov_9fa48("7236"), 'Original'),
              lastName: stryMutAct_9fa48("7237") ? "" : (stryCov_9fa48("7237"), 'Name')
            }));
            const updated = await service.update(created.id, stryMutAct_9fa48("7238") ? {} : (stryCov_9fa48("7238"), {
              firstName: stryMutAct_9fa48("7239") ? "" : (stryCov_9fa48("7239"), 'Updated')
            }));
            expect(updated.firstName).toBe(stryMutAct_9fa48("7240") ? "" : (stryCov_9fa48("7240"), 'Updated'));
            expect(updated.lastName).toBe(stryMutAct_9fa48("7241") ? "" : (stryCov_9fa48("7241"), 'Name'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7242") ? "" : (stryCov_9fa48("7242"), 'changeRole'), () => {
      if (stryMutAct_9fa48("7243")) {
        {}
      } else {
        stryCov_9fa48("7243");
        it(stryMutAct_9fa48("7244") ? "" : (stryCov_9fa48("7244"), 'should change user role'), async () => {
          if (stryMutAct_9fa48("7245")) {
            {}
          } else {
            stryCov_9fa48("7245");
            const created = await service.create(stryMutAct_9fa48("7246") ? {} : (stryCov_9fa48("7246"), {
              email: stryMutAct_9fa48("7247") ? "" : (stryCov_9fa48("7247"), 'role@example.com'),
              password: stryMutAct_9fa48("7248") ? "" : (stryCov_9fa48("7248"), 'pass'),
              firstName: stryMutAct_9fa48("7249") ? "" : (stryCov_9fa48("7249"), 'Role'),
              lastName: stryMutAct_9fa48("7250") ? "" : (stryCov_9fa48("7250"), 'User'),
              role: stryMutAct_9fa48("7251") ? "" : (stryCov_9fa48("7251"), 'student')
            }));
            const updated = await service.changeRole(created.id, stryMutAct_9fa48("7252") ? "" : (stryCov_9fa48("7252"), 'instructor'));
            expect(updated.role).toBe(stryMutAct_9fa48("7253") ? "" : (stryCov_9fa48("7253"), 'instructor'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7254") ? "" : (stryCov_9fa48("7254"), 'banUser'), () => {
      if (stryMutAct_9fa48("7255")) {
        {}
      } else {
        stryCov_9fa48("7255");
        it(stryMutAct_9fa48("7256") ? "" : (stryCov_9fa48("7256"), 'should ban a user'), async () => {
          if (stryMutAct_9fa48("7257")) {
            {}
          } else {
            stryCov_9fa48("7257");
            const created = await service.create(stryMutAct_9fa48("7258") ? {} : (stryCov_9fa48("7258"), {
              email: stryMutAct_9fa48("7259") ? "" : (stryCov_9fa48("7259"), 'ban@example.com'),
              password: stryMutAct_9fa48("7260") ? "" : (stryCov_9fa48("7260"), 'pass'),
              firstName: stryMutAct_9fa48("7261") ? "" : (stryCov_9fa48("7261"), 'Ban'),
              lastName: stryMutAct_9fa48("7262") ? "" : (stryCov_9fa48("7262"), 'User'),
              isBanned: stryMutAct_9fa48("7263") ? true : (stryCov_9fa48("7263"), false)
            }));
            const banned = await service.banUser(created.id, stryMutAct_9fa48("7264") ? false : (stryCov_9fa48("7264"), true));
            expect(banned.isBanned).toBe(stryMutAct_9fa48("7265") ? false : (stryCov_9fa48("7265"), true));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("7266") ? "" : (stryCov_9fa48("7266"), 'softDelete'), () => {
      if (stryMutAct_9fa48("7267")) {
        {}
      } else {
        stryCov_9fa48("7267");
        it(stryMutAct_9fa48("7268") ? "" : (stryCov_9fa48("7268"), 'should soft delete a user'), async () => {
          if (stryMutAct_9fa48("7269")) {
            {}
          } else {
            stryCov_9fa48("7269");
            const created = await service.create(stryMutAct_9fa48("7270") ? {} : (stryCov_9fa48("7270"), {
              email: stryMutAct_9fa48("7271") ? "" : (stryCov_9fa48("7271"), 'delete@example.com'),
              password: stryMutAct_9fa48("7272") ? "" : (stryCov_9fa48("7272"), 'pass'),
              firstName: stryMutAct_9fa48("7273") ? "" : (stryCov_9fa48("7273"), 'Delete'),
              lastName: stryMutAct_9fa48("7274") ? "" : (stryCov_9fa48("7274"), 'User')
            }));
            const deleted = await service.softDelete(created.id);
            expect(deleted.deletedAt).toBeDefined();
          }
        });
      }
    });
  }
});