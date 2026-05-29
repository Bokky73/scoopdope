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
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { setupTestDatabase, teardownTestDatabase } from '../test/integration-test.setup';
describe(stryMutAct_9fa48("744") ? "" : (stryCov_9fa48("744"), 'AuthService (Integration)'), () => {
  if (stryMutAct_9fa48("745")) {
    {}
  } else {
    stryCov_9fa48("745");
    let service: AuthService;
    let usersService: UsersService;
    let module: TestingModule;
    let dataSource: DataSource;
    beforeAll(async () => {
      if (stryMutAct_9fa48("746")) {
        {}
      } else {
        stryCov_9fa48("746");
        dataSource = await setupTestDatabase();
        module = await Test.createTestingModule(stryMutAct_9fa48("747") ? {} : (stryCov_9fa48("747"), {
          imports: stryMutAct_9fa48("748") ? [] : (stryCov_9fa48("748"), [TypeOrmModule.forFeature(stryMutAct_9fa48("749") ? [] : (stryCov_9fa48("749"), [User, PasswordResetToken, RefreshToken])), JwtModule.register(stryMutAct_9fa48("750") ? {} : (stryCov_9fa48("750"), {
            secret: stryMutAct_9fa48("751") ? "" : (stryCov_9fa48("751"), 'test-secret'),
            signOptions: stryMutAct_9fa48("752") ? {} : (stryCov_9fa48("752"), {
              expiresIn: stryMutAct_9fa48("753") ? "" : (stryCov_9fa48("753"), '15m')
            })
          }))]),
          providers: stryMutAct_9fa48("754") ? [] : (stryCov_9fa48("754"), [AuthService, UsersService, stryMutAct_9fa48("755") ? {} : (stryCov_9fa48("755"), {
            provide: MailService,
            useValue: stryMutAct_9fa48("756") ? {} : (stryCov_9fa48("756"), {
              sendVerificationEmail: jest.fn(),
              sendPasswordResetEmail: jest.fn()
            })
          })])
        })).overrideProvider(stryMutAct_9fa48("757") ? "" : (stryCov_9fa48("757"), 'DataSource')).useValue(dataSource).compile();
        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
      }
    });
    afterAll(async () => {
      if (stryMutAct_9fa48("758")) {
        {}
      } else {
        stryCov_9fa48("758");
        await module.close();
        await teardownTestDatabase();
      }
    });
    beforeEach(async () => {
      if (stryMutAct_9fa48("759")) {
        {}
      } else {
        stryCov_9fa48("759");
        const userRepo = dataSource.getRepository(User);
        const resetTokenRepo = dataSource.getRepository(PasswordResetToken);
        const refreshTokenRepo = dataSource.getRepository(RefreshToken);
        await userRepo.clear();
        await resetTokenRepo.clear();
        await refreshTokenRepo.clear();
      }
    });
    describe(stryMutAct_9fa48("760") ? "" : (stryCov_9fa48("760"), 'register'), () => {
      if (stryMutAct_9fa48("761")) {
        {}
      } else {
        stryCov_9fa48("761");
        it(stryMutAct_9fa48("762") ? "" : (stryCov_9fa48("762"), 'should register a new user'), async () => {
          if (stryMutAct_9fa48("763")) {
            {}
          } else {
            stryCov_9fa48("763");
            const result = await service.register(stryMutAct_9fa48("764") ? "" : (stryCov_9fa48("764"), 'newuser@example.com'), stryMutAct_9fa48("765") ? "" : (stryCov_9fa48("765"), 'password123'));
            expect(result.message).toContain(stryMutAct_9fa48("766") ? "" : (stryCov_9fa48("766"), 'Registration successful'));
            const user = await usersService.findByEmail(stryMutAct_9fa48("767") ? "" : (stryCov_9fa48("767"), 'newuser@example.com'));
            expect(user).toBeDefined();
            expect(user.isVerified).toBe(stryMutAct_9fa48("768") ? true : (stryCov_9fa48("768"), false));
          }
        });
        it(stryMutAct_9fa48("769") ? "" : (stryCov_9fa48("769"), 'should reject duplicate email'), async () => {
          if (stryMutAct_9fa48("770")) {
            {}
          } else {
            stryCov_9fa48("770");
            await service.register(stryMutAct_9fa48("771") ? "" : (stryCov_9fa48("771"), 'duplicate@example.com'), stryMutAct_9fa48("772") ? "" : (stryCov_9fa48("772"), 'password123'));
            await expect(service.register(stryMutAct_9fa48("773") ? "" : (stryCov_9fa48("773"), 'duplicate@example.com'), stryMutAct_9fa48("774") ? "" : (stryCov_9fa48("774"), 'password123'))).rejects.toThrow(stryMutAct_9fa48("775") ? "" : (stryCov_9fa48("775"), 'Email already in use'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("776") ? "" : (stryCov_9fa48("776"), 'login'), () => {
      if (stryMutAct_9fa48("777")) {
        {}
      } else {
        stryCov_9fa48("777");
        beforeEach(async () => {
          if (stryMutAct_9fa48("778")) {
            {}
          } else {
            stryCov_9fa48("778");
            await usersService.create(stryMutAct_9fa48("779") ? {} : (stryCov_9fa48("779"), {
              email: stryMutAct_9fa48("780") ? "" : (stryCov_9fa48("780"), 'login@example.com'),
              passwordHash: stryMutAct_9fa48("781") ? "" : (stryCov_9fa48("781"), '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm'),
              // 'password'
              isVerified: stryMutAct_9fa48("782") ? false : (stryCov_9fa48("782"), true),
              isBanned: stryMutAct_9fa48("783") ? true : (stryCov_9fa48("783"), false)
            }));
          }
        });
        it(stryMutAct_9fa48("784") ? "" : (stryCov_9fa48("784"), 'should login with valid credentials'), async () => {
          if (stryMutAct_9fa48("785")) {
            {}
          } else {
            stryCov_9fa48("785");
            const result = await service.login(stryMutAct_9fa48("786") ? "" : (stryCov_9fa48("786"), 'login@example.com'), stryMutAct_9fa48("787") ? "" : (stryCov_9fa48("787"), 'password'));
            expect(result).toHaveProperty(stryMutAct_9fa48("788") ? "" : (stryCov_9fa48("788"), 'access_token'));
            expect(result).toHaveProperty(stryMutAct_9fa48("789") ? "" : (stryCov_9fa48("789"), 'refresh_token'));
          }
        });
        it(stryMutAct_9fa48("790") ? "" : (stryCov_9fa48("790"), 'should reject invalid password'), async () => {
          if (stryMutAct_9fa48("791")) {
            {}
          } else {
            stryCov_9fa48("791");
            await expect(service.login(stryMutAct_9fa48("792") ? "" : (stryCov_9fa48("792"), 'login@example.com'), stryMutAct_9fa48("793") ? "" : (stryCov_9fa48("793"), 'wrongpassword'))).rejects.toThrow(stryMutAct_9fa48("794") ? "" : (stryCov_9fa48("794"), 'Invalid credentials'));
          }
        });
        it(stryMutAct_9fa48("795") ? "" : (stryCov_9fa48("795"), 'should reject unverified user'), async () => {
          if (stryMutAct_9fa48("796")) {
            {}
          } else {
            stryCov_9fa48("796");
            await usersService.create(stryMutAct_9fa48("797") ? {} : (stryCov_9fa48("797"), {
              email: stryMutAct_9fa48("798") ? "" : (stryCov_9fa48("798"), 'unverified@example.com'),
              passwordHash: stryMutAct_9fa48("799") ? "" : (stryCov_9fa48("799"), '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm'),
              isVerified: stryMutAct_9fa48("800") ? true : (stryCov_9fa48("800"), false)
            }));
            await expect(service.login(stryMutAct_9fa48("801") ? "" : (stryCov_9fa48("801"), 'unverified@example.com'), stryMutAct_9fa48("802") ? "" : (stryCov_9fa48("802"), 'password'))).rejects.toThrow(stryMutAct_9fa48("803") ? "" : (stryCov_9fa48("803"), 'Please verify your email'));
          }
        });
        it(stryMutAct_9fa48("804") ? "" : (stryCov_9fa48("804"), 'should reject banned user'), async () => {
          if (stryMutAct_9fa48("805")) {
            {}
          } else {
            stryCov_9fa48("805");
            await usersService.create(stryMutAct_9fa48("806") ? {} : (stryCov_9fa48("806"), {
              email: stryMutAct_9fa48("807") ? "" : (stryCov_9fa48("807"), 'banned@example.com'),
              passwordHash: stryMutAct_9fa48("808") ? "" : (stryCov_9fa48("808"), '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm'),
              isVerified: stryMutAct_9fa48("809") ? false : (stryCov_9fa48("809"), true),
              isBanned: stryMutAct_9fa48("810") ? false : (stryCov_9fa48("810"), true)
            }));
            await expect(service.login(stryMutAct_9fa48("811") ? "" : (stryCov_9fa48("811"), 'banned@example.com'), stryMutAct_9fa48("812") ? "" : (stryCov_9fa48("812"), 'password'))).rejects.toThrow(stryMutAct_9fa48("813") ? "" : (stryCov_9fa48("813"), 'Account is banned'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("814") ? "" : (stryCov_9fa48("814"), 'verifyEmail'), () => {
      if (stryMutAct_9fa48("815")) {
        {}
      } else {
        stryCov_9fa48("815");
        it(stryMutAct_9fa48("816") ? "" : (stryCov_9fa48("816"), 'should verify email with valid token'), async () => {
          if (stryMutAct_9fa48("817")) {
            {}
          } else {
            stryCov_9fa48("817");
            await usersService.create(stryMutAct_9fa48("818") ? {} : (stryCov_9fa48("818"), {
              email: stryMutAct_9fa48("819") ? "" : (stryCov_9fa48("819"), 'verify@example.com'),
              passwordHash: stryMutAct_9fa48("820") ? "" : (stryCov_9fa48("820"), 'hash'),
              isVerified: stryMutAct_9fa48("821") ? true : (stryCov_9fa48("821"), false),
              verificationToken: stryMutAct_9fa48("822") ? "" : (stryCov_9fa48("822"), 'test-token-hash'),
              verificationTokenExpiresAt: new Date(stryMutAct_9fa48("823") ? Date.now() - 24 * 60 * 60 * 1000 : (stryCov_9fa48("823"), Date.now() + (stryMutAct_9fa48("824") ? 24 * 60 * 60 / 1000 : (stryCov_9fa48("824"), (stryMutAct_9fa48("825") ? 24 * 60 / 60 : (stryCov_9fa48("825"), (stryMutAct_9fa48("826") ? 24 / 60 : (stryCov_9fa48("826"), 24 * 60)) * 60)) * 1000))))
            }));

            // Note: In real scenario, token would be hashed
            const result = await service.verifyEmail(stryMutAct_9fa48("827") ? "" : (stryCov_9fa48("827"), 'test-token'));
            expect(result.message).toContain(stryMutAct_9fa48("828") ? "" : (stryCov_9fa48("828"), 'Email verified successfully'));
          }
        });
      }
    });
    describe(stryMutAct_9fa48("829") ? "" : (stryCov_9fa48("829"), 'forgotPassword'), () => {
      if (stryMutAct_9fa48("830")) {
        {}
      } else {
        stryCov_9fa48("830");
        it(stryMutAct_9fa48("831") ? "" : (stryCov_9fa48("831"), 'should initiate password reset'), async () => {
          if (stryMutAct_9fa48("832")) {
            {}
          } else {
            stryCov_9fa48("832");
            await usersService.create(stryMutAct_9fa48("833") ? {} : (stryCov_9fa48("833"), {
              email: stryMutAct_9fa48("834") ? "" : (stryCov_9fa48("834"), 'forgot@example.com'),
              passwordHash: stryMutAct_9fa48("835") ? "" : (stryCov_9fa48("835"), 'hash'),
              isVerified: stryMutAct_9fa48("836") ? false : (stryCov_9fa48("836"), true)
            }));
            const result = await service.forgotPassword(stryMutAct_9fa48("837") ? "" : (stryCov_9fa48("837"), 'forgot@example.com'));
            expect(result.message).toContain(stryMutAct_9fa48("838") ? "" : (stryCov_9fa48("838"), 'reset link has been sent'));
          }
        });
        it(stryMutAct_9fa48("839") ? "" : (stryCov_9fa48("839"), 'should return generic message for non-existent email'), async () => {
          if (stryMutAct_9fa48("840")) {
            {}
          } else {
            stryCov_9fa48("840");
            const result = await service.forgotPassword(stryMutAct_9fa48("841") ? "" : (stryCov_9fa48("841"), 'nonexistent@example.com'));
            expect(result.message).toContain(stryMutAct_9fa48("842") ? "" : (stryCov_9fa48("842"), 'reset link has been sent'));
          }
        });
      }
    });
  }
});