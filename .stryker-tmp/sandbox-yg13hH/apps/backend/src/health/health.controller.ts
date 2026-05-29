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
import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, MemoryHealthIndicator, HttpHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private db: TypeOrmHealthIndicator, private memory: MemoryHealthIndicator, private http: HttpHealthIndicator, @Inject(CACHE_MANAGER)
  private cacheManager: Cache, @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: Logger) {}
  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Returns the health status of the application including database, Redis, and Stellar Horizon connectivity'
  })
  @ApiResponse({
    status: 200,
    description: 'All health checks passed',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok'
        },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            },
            memory_heap: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            },
            memory_rss: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            },
            stellar_horizon: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            }
          }
        },
        error: {
          type: 'object'
        },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            },
            memory_heap: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            },
            memory_rss: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            },
            stellar_horizon: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'up'
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'One or more health checks failed',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'error'
        },
        info: {
          type: 'object'
        },
        error: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'down'
                }
              }
            }
          }
        },
        details: {
          type: 'object'
        }
      }
    }
  })
  @HealthCheck()
  async check() {
    if (stryMutAct_9fa48("3648")) {
      {}
    } else {
      stryCov_9fa48("3648");
      this.logger.debug(stryMutAct_9fa48("3649") ? "" : (stryCov_9fa48("3649"), 'Performing health check'), stryMutAct_9fa48("3650") ? {} : (stryCov_9fa48("3650"), {
        context: stryMutAct_9fa48("3651") ? "" : (stryCov_9fa48("3651"), 'HealthController')
      }));
      const result = await this.health.check(stryMutAct_9fa48("3652") ? [] : (stryCov_9fa48("3652"), [// Database connectivity check
      stryMutAct_9fa48("3653") ? () => undefined : (stryCov_9fa48("3653"), () => this.db.pingCheck(stryMutAct_9fa48("3654") ? "" : (stryCov_9fa48("3654"), 'database'))), // Memory usage checks
      stryMutAct_9fa48("3655") ? () => undefined : (stryCov_9fa48("3655"), () => this.memory.checkHeap(stryMutAct_9fa48("3656") ? "" : (stryCov_9fa48("3656"), 'memory_heap'), stryMutAct_9fa48("3657") ? 150 * 1024 / 1024 : (stryCov_9fa48("3657"), (stryMutAct_9fa48("3658") ? 150 / 1024 : (stryCov_9fa48("3658"), 150 * 1024)) * 1024))), // 150MB heap limit
      stryMutAct_9fa48("3659") ? () => undefined : (stryCov_9fa48("3659"), () => this.memory.checkRSS(stryMutAct_9fa48("3660") ? "" : (stryCov_9fa48("3660"), 'memory_rss'), stryMutAct_9fa48("3661") ? 300 * 1024 / 1024 : (stryCov_9fa48("3661"), (stryMutAct_9fa48("3662") ? 300 / 1024 : (stryCov_9fa48("3662"), 300 * 1024)) * 1024))), // 300MB RSS limit
      // Redis connectivity check
      stryMutAct_9fa48("3663") ? () => undefined : (stryCov_9fa48("3663"), () => this.checkRedis()), // Stellar Horizon connectivity check
      stryMutAct_9fa48("3664") ? () => undefined : (stryCov_9fa48("3664"), () => this.checkStellarHorizon())]));
      this.logger.info(stryMutAct_9fa48("3665") ? "" : (stryCov_9fa48("3665"), 'Health check completed'), stryMutAct_9fa48("3666") ? {} : (stryCov_9fa48("3666"), {
        context: stryMutAct_9fa48("3667") ? "" : (stryCov_9fa48("3667"), 'HealthController'),
        status: result.status,
        checks: Object.keys(stryMutAct_9fa48("3670") ? result.details && {} : stryMutAct_9fa48("3669") ? false : stryMutAct_9fa48("3668") ? true : (stryCov_9fa48("3668", "3669", "3670"), result.details || {})).length
      }));
      return result;
    }
  }

  /**
   * Custom health check for Redis connectivity
   */
  private async checkRedis(): Promise<HealthIndicatorResult> {
    if (stryMutAct_9fa48("3671")) {
      {}
    } else {
      stryCov_9fa48("3671");
      const key = stryMutAct_9fa48("3672") ? "" : (stryCov_9fa48("3672"), 'health-check');
      const testValue = Date.now().toString();
      try {
        if (stryMutAct_9fa48("3673")) {
          {}
        } else {
          stryCov_9fa48("3673");
          // Test Redis connectivity by setting and getting a value
          await this.cacheManager.set(key, testValue, 1000); // 1 second TTL
          const retrievedValue = await this.cacheManager.get(key);
          if (stryMutAct_9fa48("3676") ? retrievedValue !== testValue : stryMutAct_9fa48("3675") ? false : stryMutAct_9fa48("3674") ? true : (stryCov_9fa48("3674", "3675", "3676"), retrievedValue === testValue)) {
            if (stryMutAct_9fa48("3677")) {
              {}
            } else {
              stryCov_9fa48("3677");
              return stryMutAct_9fa48("3678") ? {} : (stryCov_9fa48("3678"), {
                redis: stryMutAct_9fa48("3679") ? {} : (stryCov_9fa48("3679"), {
                  status: stryMutAct_9fa48("3680") ? "" : (stryCov_9fa48("3680"), 'up'),
                  message: stryMutAct_9fa48("3681") ? "" : (stryCov_9fa48("3681"), 'Redis is responsive')
                })
              });
            }
          } else {
            if (stryMutAct_9fa48("3682")) {
              {}
            } else {
              stryCov_9fa48("3682");
              throw new Error(stryMutAct_9fa48("3683") ? "" : (stryCov_9fa48("3683"), 'Redis value mismatch'));
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("3684")) {
          {}
        } else {
          stryCov_9fa48("3684");
          this.logger.warn(stryMutAct_9fa48("3685") ? "" : (stryCov_9fa48("3685"), 'Redis health check failed'), stryMutAct_9fa48("3686") ? {} : (stryCov_9fa48("3686"), {
            context: stryMutAct_9fa48("3687") ? "" : (stryCov_9fa48("3687"), 'HealthController'),
            error: error.message
          }));
          throw new Error(stryMutAct_9fa48("3688") ? `` : (stryCov_9fa48("3688"), `Redis health check failed: ${error.message}`));
        }
      }
    }
  }

  /**
   * Custom health check for Stellar Horizon connectivity
   */
  private async checkStellarHorizon() {
    if (stryMutAct_9fa48("3689")) {
      {}
    } else {
      stryCov_9fa48("3689");
      const horizonUrl = stryMutAct_9fa48("3692") ? process.env.STELLAR_HORIZON_URL && 'https://horizon-testnet.stellar.org' : stryMutAct_9fa48("3691") ? false : stryMutAct_9fa48("3690") ? true : (stryCov_9fa48("3690", "3691", "3692"), process.env.STELLAR_HORIZON_URL || (stryMutAct_9fa48("3693") ? "" : (stryCov_9fa48("3693"), 'https://horizon-testnet.stellar.org')));
      try {
        if (stryMutAct_9fa48("3694")) {
          {}
        } else {
          stryCov_9fa48("3694");
          // Check Horizon health endpoint
          return await this.http.pingCheck(stryMutAct_9fa48("3695") ? "" : (stryCov_9fa48("3695"), 'stellar_horizon'), stryMutAct_9fa48("3696") ? `` : (stryCov_9fa48("3696"), `${horizonUrl}/health`));
        }
      } catch (error) {
        if (stryMutAct_9fa48("3697")) {
          {}
        } else {
          stryCov_9fa48("3697");
          this.logger.warn(stryMutAct_9fa48("3698") ? "" : (stryCov_9fa48("3698"), 'Stellar Horizon health check failed'), stryMutAct_9fa48("3699") ? {} : (stryCov_9fa48("3699"), {
            context: stryMutAct_9fa48("3700") ? "" : (stryCov_9fa48("3700"), 'HealthController'),
            url: horizonUrl,
            error: error.message
          }));
          throw error;
        }
      }
    }
  }
}