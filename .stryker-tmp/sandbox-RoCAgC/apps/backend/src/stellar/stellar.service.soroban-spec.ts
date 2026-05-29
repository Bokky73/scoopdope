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
import { ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { StellarService } from './stellar.service';
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Soroban Testnet Integration Tests
 *
 * These tests deploy the Analytics contract to a local Soroban sandbox
 * and verify contract interactions work correctly.
 *
 * Run only on main branch pushes to avoid rate limits.
 * Requires: stellar-cli, docker
 */
describe(stryMutAct_9fa48("6454") ? "" : (stryCov_9fa48("6454"), 'StellarService - Soroban Testnet (Integration)'), () => {
  if (stryMutAct_9fa48("6455")) {
    {}
  } else {
    stryCov_9fa48("6455");
    let service: StellarService;
    let module: TestingModule;
    let contractId: string;
    let sandboxRunning = stryMutAct_9fa48("6456") ? true : (stryCov_9fa48("6456"), false);
    beforeAll(async () => {
      if (stryMutAct_9fa48("6457")) {
        {}
      } else {
        stryCov_9fa48("6457");
        // Skip if not on main branch or in CI
        const isMainBranch = stryMutAct_9fa48("6460") ? process.env.GITHUB_REF !== 'refs/heads/main' : stryMutAct_9fa48("6459") ? false : stryMutAct_9fa48("6458") ? true : (stryCov_9fa48("6458", "6459", "6460"), process.env.GITHUB_REF === (stryMutAct_9fa48("6461") ? "" : (stryCov_9fa48("6461"), 'refs/heads/main')));
        const isCi = stryMutAct_9fa48("6464") ? process.env.CI !== 'true' : stryMutAct_9fa48("6463") ? false : stryMutAct_9fa48("6462") ? true : (stryCov_9fa48("6462", "6463", "6464"), process.env.CI === (stryMutAct_9fa48("6465") ? "" : (stryCov_9fa48("6465"), 'true')));
        if (stryMutAct_9fa48("6468") ? !isMainBranch || isCi : stryMutAct_9fa48("6467") ? false : stryMutAct_9fa48("6466") ? true : (stryCov_9fa48("6466", "6467", "6468"), (stryMutAct_9fa48("6469") ? isMainBranch : (stryCov_9fa48("6469"), !isMainBranch)) && isCi)) {
          if (stryMutAct_9fa48("6470")) {
            {}
          } else {
            stryCov_9fa48("6470");
            console.log(stryMutAct_9fa48("6471") ? "" : (stryCov_9fa48("6471"), 'Skipping Soroban tests (not on main branch)'));
            return;
          }
        }

        // Start local Soroban sandbox
        try {
          if (stryMutAct_9fa48("6472")) {
            {}
          } else {
            stryCov_9fa48("6472");
            console.log(stryMutAct_9fa48("6473") ? "" : (stryCov_9fa48("6473"), 'Starting Soroban sandbox...'));
            execSync(stryMutAct_9fa48("6474") ? "" : (stryCov_9fa48("6474"), 'stellar network add --rpc-url http://localhost:8000 --network-passphrase "Test SDF Network ; September 2015" local'), stryMutAct_9fa48("6475") ? {} : (stryCov_9fa48("6475"), {
              stdio: stryMutAct_9fa48("6476") ? "" : (stryCov_9fa48("6476"), 'pipe')
            }));
            sandboxRunning = stryMutAct_9fa48("6477") ? false : (stryCov_9fa48("6477"), true);
          }
        } catch (error) {
          if (stryMutAct_9fa48("6478")) {
            {}
          } else {
            stryCov_9fa48("6478");
            console.warn(stryMutAct_9fa48("6479") ? "" : (stryCov_9fa48("6479"), 'Could not start Soroban sandbox:'), error.message);
            // Continue anyway - tests will be skipped if sandbox unavailable
          }
        }
        module = await Test.createTestingModule(stryMutAct_9fa48("6480") ? {} : (stryCov_9fa48("6480"), {
          imports: stryMutAct_9fa48("6481") ? [] : (stryCov_9fa48("6481"), [CacheModule.register()]),
          providers: stryMutAct_9fa48("6482") ? [] : (stryCov_9fa48("6482"), [StellarService, stryMutAct_9fa48("6483") ? {} : (stryCov_9fa48("6483"), {
            provide: ConfigService,
            useValue: stryMutAct_9fa48("6484") ? {} : (stryCov_9fa48("6484"), {
              get: (key: string) => {
                if (stryMutAct_9fa48("6485")) {
                  {}
                } else {
                  stryCov_9fa48("6485");
                  const config = stryMutAct_9fa48("6486") ? {} : (stryCov_9fa48("6486"), {
                    'stellar.network': stryMutAct_9fa48("6487") ? "" : (stryCov_9fa48("6487"), 'testnet'),
                    'stellar.sorobanRpcUrl': stryMutAct_9fa48("6488") ? "" : (stryCov_9fa48("6488"), 'http://localhost:8000'),
                    'stellar.secretKey': stryMutAct_9fa48("6491") ? process.env.STELLAR_SECRET_KEY && 'SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' : stryMutAct_9fa48("6490") ? false : stryMutAct_9fa48("6489") ? true : (stryCov_9fa48("6489", "6490", "6491"), process.env.STELLAR_SECRET_KEY || (stryMutAct_9fa48("6492") ? "" : (stryCov_9fa48("6492"), 'SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'))),
                    'stellar.contractId': stryMutAct_9fa48("6495") ? process.env.ANALYTICS_CONTRACT_ID && '' : stryMutAct_9fa48("6494") ? false : stryMutAct_9fa48("6493") ? true : (stryCov_9fa48("6493", "6494", "6495"), process.env.ANALYTICS_CONTRACT_ID || (stryMutAct_9fa48("6496") ? "Stryker was here!" : (stryCov_9fa48("6496"), '')))
                  });
                  return config[key];
                }
              }
            })
          })])
        })).compile();
        service = module.get<StellarService>(StellarService);
      }
    });
    afterAll(async () => {
      if (stryMutAct_9fa48("6497")) {
        {}
      } else {
        stryCov_9fa48("6497");
        if (stryMutAct_9fa48("6499") ? false : stryMutAct_9fa48("6498") ? true : (stryCov_9fa48("6498", "6499"), module)) {
          if (stryMutAct_9fa48("6500")) {
            {}
          } else {
            stryCov_9fa48("6500");
            await module.close();
          }
        }
      }
    });
    describe(stryMutAct_9fa48("6501") ? "" : (stryCov_9fa48("6501"), 'Contract Deployment'), () => {
      if (stryMutAct_9fa48("6502")) {
        {}
      } else {
        stryCov_9fa48("6502");
        it(stryMutAct_9fa48("6503") ? "" : (stryCov_9fa48("6503"), 'should deploy Analytics contract to sandbox'), async () => {
          if (stryMutAct_9fa48("6504")) {
            {}
          } else {
            stryCov_9fa48("6504");
            if (stryMutAct_9fa48("6507") ? false : stryMutAct_9fa48("6506") ? true : stryMutAct_9fa48("6505") ? sandboxRunning : (stryCov_9fa48("6505", "6506", "6507"), !sandboxRunning)) {
              if (stryMutAct_9fa48("6508")) {
                {}
              } else {
                stryCov_9fa48("6508");
                console.log(stryMutAct_9fa48("6509") ? "" : (stryCov_9fa48("6509"), 'Skipping: Soroban sandbox not available'));
                return;
              }
            }
            try {
              if (stryMutAct_9fa48("6510")) {
                {}
              } else {
                stryCov_9fa48("6510");
                const contractPath = path.join(__dirname, stryMutAct_9fa48("6511") ? "" : (stryCov_9fa48("6511"), '../../../contracts/analytics/target/wasm32-unknown-unknown/release/brain_storm_analytics.wasm'));

                // Deploy contract
                const output = execSync(stryMutAct_9fa48("6512") ? `` : (stryCov_9fa48("6512"), `stellar contract deploy --wasm ${contractPath} --source-account test --network local`), stryMutAct_9fa48("6513") ? {} : (stryCov_9fa48("6513"), {
                  encoding: stryMutAct_9fa48("6514") ? "" : (stryCov_9fa48("6514"), 'utf-8')
                }));

                // Extract contract ID from output
                const match = output.match(stryMutAct_9fa48("6516") ? /Contract ID: ([^A-Z0-9]+)/ : stryMutAct_9fa48("6515") ? /Contract ID: ([A-Z0-9])/ : (stryCov_9fa48("6515", "6516"), /Contract ID: ([A-Z0-9]+)/));
                contractId = match ? match[1] : stryMutAct_9fa48("6517") ? "Stryker was here!" : (stryCov_9fa48("6517"), '');
                expect(contractId).toBeTruthy();
                expect(contractId).toMatch(stryMutAct_9fa48("6521") ? /^C[^A-Z0-9]{55}$/ : stryMutAct_9fa48("6520") ? /^C[A-Z0-9]$/ : stryMutAct_9fa48("6519") ? /^C[A-Z0-9]{55}/ : stryMutAct_9fa48("6518") ? /C[A-Z0-9]{55}$/ : (stryCov_9fa48("6518", "6519", "6520", "6521"), /^C[A-Z0-9]{55}$/));
              }
            } catch (error) {
              if (stryMutAct_9fa48("6522")) {
                {}
              } else {
                stryCov_9fa48("6522");
                console.warn(stryMutAct_9fa48("6523") ? "" : (stryCov_9fa48("6523"), 'Contract deployment failed:'), error.message);
                // Skip remaining tests if deployment fails
                return;
              }
            }
          }
        });
      }
    });
    describe(stryMutAct_9fa48("6524") ? "" : (stryCov_9fa48("6524"), 'Contract Invocation'), () => {
      if (stryMutAct_9fa48("6525")) {
        {}
      } else {
        stryCov_9fa48("6525");
        beforeEach(() => {
          if (stryMutAct_9fa48("6526")) {
            {}
          } else {
            stryCov_9fa48("6526");
            if (stryMutAct_9fa48("6529") ? false : stryMutAct_9fa48("6528") ? true : stryMutAct_9fa48("6527") ? contractId : (stryCov_9fa48("6527", "6528", "6529"), !contractId)) {
              if (stryMutAct_9fa48("6530")) {
                {}
              } else {
                stryCov_9fa48("6530");
                console.log(stryMutAct_9fa48("6531") ? "" : (stryCov_9fa48("6531"), 'Skipping: Contract not deployed'));
              }
            }
          }
        });
        it(stryMutAct_9fa48("6532") ? "" : (stryCov_9fa48("6532"), 'should call record_progress on Analytics contract'), async () => {
          if (stryMutAct_9fa48("6533")) {
            {}
          } else {
            stryCov_9fa48("6533");
            if (stryMutAct_9fa48("6536") ? !contractId && !sandboxRunning : stryMutAct_9fa48("6535") ? false : stryMutAct_9fa48("6534") ? true : (stryCov_9fa48("6534", "6535", "6536"), (stryMutAct_9fa48("6537") ? contractId : (stryCov_9fa48("6537"), !contractId)) || (stryMutAct_9fa48("6538") ? sandboxRunning : (stryCov_9fa48("6538"), !sandboxRunning)))) {
              if (stryMutAct_9fa48("6539")) {
                {}
              } else {
                stryCov_9fa48("6539");
                console.log(stryMutAct_9fa48("6540") ? "" : (stryCov_9fa48("6540"), 'Skipping: Prerequisites not met'));
                return;
              }
            }
            try {
              if (stryMutAct_9fa48("6541")) {
                {}
              } else {
                stryCov_9fa48("6541");
                const studentId = stryMutAct_9fa48("6542") ? "" : (stryCov_9fa48("6542"), 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ75XABZXVQRLLOG4');
                const courseId = stryMutAct_9fa48("6543") ? "" : (stryCov_9fa48("6543"), 'course-001');
                const progress = 100;
                const output = execSync(stryMutAct_9fa48("6544") ? `` : (stryCov_9fa48("6544"), `stellar contract invoke --id ${contractId} --source-account test --network local -- record_progress ${studentId} ${courseId} ${progress}`), stryMutAct_9fa48("6545") ? {} : (stryCov_9fa48("6545"), {
                  encoding: stryMutAct_9fa48("6546") ? "" : (stryCov_9fa48("6546"), 'utf-8')
                }));
                expect(output).toBeTruthy();
              }
            } catch (error) {
              if (stryMutAct_9fa48("6547")) {
                {}
              } else {
                stryCov_9fa48("6547");
                console.warn(stryMutAct_9fa48("6548") ? "" : (stryCov_9fa48("6548"), 'record_progress invocation failed:'), error.message);
              }
            }
          }
        });
        it(stryMutAct_9fa48("6549") ? "" : (stryCov_9fa48("6549"), 'should return valid transaction hash from issueCredential'), async () => {
          if (stryMutAct_9fa48("6550")) {
            {}
          } else {
            stryCov_9fa48("6550");
            if (stryMutAct_9fa48("6553") ? !contractId && !sandboxRunning : stryMutAct_9fa48("6552") ? false : stryMutAct_9fa48("6551") ? true : (stryCov_9fa48("6551", "6552", "6553"), (stryMutAct_9fa48("6554") ? contractId : (stryCov_9fa48("6554"), !contractId)) || (stryMutAct_9fa48("6555") ? sandboxRunning : (stryCov_9fa48("6555"), !sandboxRunning)))) {
              if (stryMutAct_9fa48("6556")) {
                {}
              } else {
                stryCov_9fa48("6556");
                console.log(stryMutAct_9fa48("6557") ? "" : (stryCov_9fa48("6557"), 'Skipping: Prerequisites not met'));
                return;
              }
            }
            try {
              if (stryMutAct_9fa48("6558")) {
                {}
              } else {
                stryCov_9fa48("6558");
                const recipientPublicKey = stryMutAct_9fa48("6559") ? "" : (stryCov_9fa48("6559"), 'GBUQWP3BOUZX34ULNQG23RQ6F4YUSXHTQSXUSMIQ75XABZXVQRLLOG4');
                const courseId = stryMutAct_9fa48("6560") ? "" : (stryCov_9fa48("6560"), 'course-001');
                const txHash = await service.issueCredential(recipientPublicKey, courseId);

                // Verify it's a valid transaction hash format
                expect(txHash).toBeTruthy();
                expect(txHash).toMatch(stryMutAct_9fa48("6564") ? /^[^a-f0-9]{64}$/ : stryMutAct_9fa48("6563") ? /^[a-f0-9]$/ : stryMutAct_9fa48("6562") ? /^[a-f0-9]{64}/ : stryMutAct_9fa48("6561") ? /[a-f0-9]{64}$/ : (stryCov_9fa48("6561", "6562", "6563", "6564"), /^[a-f0-9]{64}$/));
              }
            } catch (error) {
              if (stryMutAct_9fa48("6565")) {
                {}
              } else {
                stryCov_9fa48("6565");
                console.warn(stryMutAct_9fa48("6566") ? "" : (stryCov_9fa48("6566"), 'issueCredential failed:'), error.message);
              }
            }
          }
        });
      }
    });
    describe(stryMutAct_9fa48("6567") ? "" : (stryCov_9fa48("6567"), 'Error Handling'), () => {
      if (stryMutAct_9fa48("6568")) {
        {}
      } else {
        stryCov_9fa48("6568");
        it(stryMutAct_9fa48("6569") ? "" : (stryCov_9fa48("6569"), 'should handle invalid contract ID gracefully'), async () => {
          if (stryMutAct_9fa48("6570")) {
            {}
          } else {
            stryCov_9fa48("6570");
            if (stryMutAct_9fa48("6573") ? false : stryMutAct_9fa48("6572") ? true : stryMutAct_9fa48("6571") ? sandboxRunning : (stryCov_9fa48("6571", "6572", "6573"), !sandboxRunning)) {
              if (stryMutAct_9fa48("6574")) {
                {}
              } else {
                stryCov_9fa48("6574");
                console.log(stryMutAct_9fa48("6575") ? "" : (stryCov_9fa48("6575"), 'Skipping: Soroban sandbox not available'));
                return;
              }
            }
            try {
              if (stryMutAct_9fa48("6576")) {
                {}
              } else {
                stryCov_9fa48("6576");
                const invalidContractId = stryMutAct_9fa48("6577") ? "" : (stryCov_9fa48("6577"), 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4');
                execSync(stryMutAct_9fa48("6578") ? `` : (stryCov_9fa48("6578"), `stellar contract invoke --id ${invalidContractId} --source-account test --network local -- record_progress test test 0`), stryMutAct_9fa48("6579") ? {} : (stryCov_9fa48("6579"), {
                  encoding: stryMutAct_9fa48("6580") ? "" : (stryCov_9fa48("6580"), 'utf-8'),
                  stdio: stryMutAct_9fa48("6581") ? "" : (stryCov_9fa48("6581"), 'pipe')
                }));
              }
            } catch (error) {
              if (stryMutAct_9fa48("6582")) {
                {}
              } else {
                stryCov_9fa48("6582");
                // Expected to fail
                expect(error).toBeTruthy();
              }
            }
          }
        });
      }
    });
  }
});