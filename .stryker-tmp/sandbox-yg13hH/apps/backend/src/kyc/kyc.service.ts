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
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { KycCustomer, KycStatus } from './kyc-customer.entity';
@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly apiKey: string;
  constructor(@InjectRepository(KycCustomer)
  private repo: Repository<KycCustomer>, private configService: ConfigService) {
    if (stryMutAct_9fa48("4021")) {
      {}
    } else {
      stryCov_9fa48("4021");
      this.apiKey = stryMutAct_9fa48("4022") ? this.configService.get<string>('kyc.providerApiKey') && '' : (stryCov_9fa48("4022"), this.configService.get<string>(stryMutAct_9fa48("4023") ? "" : (stryCov_9fa48("4023"), 'kyc.providerApiKey')) ?? (stryMutAct_9fa48("4024") ? "Stryker was here!" : (stryCov_9fa48("4024"), '')));
    }
  }
  async getStatus(stellarPublicKey: string): Promise<KycCustomer> {
    if (stryMutAct_9fa48("4025")) {
      {}
    } else {
      stryCov_9fa48("4025");
      const customer = await this.repo.findOne(stryMutAct_9fa48("4026") ? {} : (stryCov_9fa48("4026"), {
        where: stryMutAct_9fa48("4027") ? {} : (stryCov_9fa48("4027"), {
          stellarPublicKey
        })
      }));
      if (stryMutAct_9fa48("4030") ? false : stryMutAct_9fa48("4029") ? true : stryMutAct_9fa48("4028") ? customer : (stryCov_9fa48("4028", "4029", "4030"), !customer)) {
        if (stryMutAct_9fa48("4031")) {
          {}
        } else {
          stryCov_9fa48("4031");
          // Return a virtual record — no DB row yet
          return Object.assign(new KycCustomer(), stryMutAct_9fa48("4032") ? {} : (stryCov_9fa48("4032"), {
            stellarPublicKey,
            status: 'none' as KycStatus
          }));
        }
      }
      return customer;
    }
  }
  async upsertCustomer(stellarPublicKey: string, fields: Record<string, string>): Promise<KycCustomer> {
    if (stryMutAct_9fa48("4033")) {
      {}
    } else {
      stryCov_9fa48("4033");
      let customer = await this.repo.findOne(stryMutAct_9fa48("4034") ? {} : (stryCov_9fa48("4034"), {
        where: stryMutAct_9fa48("4035") ? {} : (stryCov_9fa48("4035"), {
          stellarPublicKey
        })
      }));
      if (stryMutAct_9fa48("4038") ? false : stryMutAct_9fa48("4037") ? true : stryMutAct_9fa48("4036") ? customer : (stryCov_9fa48("4036", "4037", "4038"), !customer)) {
        if (stryMutAct_9fa48("4039")) {
          {}
        } else {
          stryCov_9fa48("4039");
          customer = this.repo.create(stryMutAct_9fa48("4040") ? {} : (stryCov_9fa48("4040"), {
            stellarPublicKey,
            status: stryMutAct_9fa48("4041") ? "" : (stryCov_9fa48("4041"), 'pending')
          }));
        }
      } else {
        if (stryMutAct_9fa48("4042")) {
          {}
        } else {
          stryCov_9fa48("4042");
          customer.status = stryMutAct_9fa48("4043") ? "" : (stryCov_9fa48("4043"), 'pending');
        }
      }

      // Submit to KYC provider
      if (stryMutAct_9fa48("4045") ? false : stryMutAct_9fa48("4044") ? true : (stryCov_9fa48("4044", "4045"), this.apiKey)) {
        if (stryMutAct_9fa48("4046")) {
          {}
        } else {
          stryCov_9fa48("4046");
          try {
            if (stryMutAct_9fa48("4047")) {
              {}
            } else {
              stryCov_9fa48("4047");
              const res = await fetch(stryMutAct_9fa48("4048") ? "" : (stryCov_9fa48("4048"), 'https://api.synaps.io/v4/individual/session'), stryMutAct_9fa48("4049") ? {} : (stryCov_9fa48("4049"), {
                method: stryMutAct_9fa48("4050") ? "" : (stryCov_9fa48("4050"), 'POST'),
                headers: stryMutAct_9fa48("4051") ? {} : (stryCov_9fa48("4051"), {
                  'Client-Id': this.apiKey,
                  'Content-Type': stryMutAct_9fa48("4052") ? "" : (stryCov_9fa48("4052"), 'application/json')
                }),
                body: JSON.stringify(stryMutAct_9fa48("4053") ? {} : (stryCov_9fa48("4053"), {
                  alias: stellarPublicKey,
                  ...fields
                }))
              }));
              if (stryMutAct_9fa48("4055") ? false : stryMutAct_9fa48("4054") ? true : (stryCov_9fa48("4054", "4055"), res.ok)) {
                if (stryMutAct_9fa48("4056")) {
                  {}
                } else {
                  stryCov_9fa48("4056");
                  const data = await res.json();
                  customer.providerId = stryMutAct_9fa48("4057") ? (data.session_id ?? data.id) && null : (stryCov_9fa48("4057"), (stryMutAct_9fa48("4058") ? data.session_id && data.id : (stryCov_9fa48("4058"), data.session_id ?? data.id)) ?? null);
                }
              } else {
                if (stryMutAct_9fa48("4059")) {
                  {}
                } else {
                  stryCov_9fa48("4059");
                  this.logger.warn(stryMutAct_9fa48("4060") ? `` : (stryCov_9fa48("4060"), `KYC provider returned ${res.status} for ${stellarPublicKey}`));
                }
              }
            }
          } catch (err) {
            if (stryMutAct_9fa48("4061")) {
              {}
            } else {
              stryCov_9fa48("4061");
              this.logger.error(stryMutAct_9fa48("4062") ? `` : (stryCov_9fa48("4062"), `KYC provider request failed: ${err.message}`));
            }
          }
        }
      }
      return this.repo.save(customer);
    }
  }

  /** Called by the webhook endpoint when the provider sends a status update */
  async handleWebhook(payload: {
    alias?: string;
    session_id?: string;
    status: string;
  }): Promise<void> {
    if (stryMutAct_9fa48("4063")) {
      {}
    } else {
      stryCov_9fa48("4063");
      const where = payload.alias ? stryMutAct_9fa48("4064") ? {} : (stryCov_9fa48("4064"), {
        stellarPublicKey: payload.alias
      }) : stryMutAct_9fa48("4065") ? {} : (stryCov_9fa48("4065"), {
        providerId: payload.session_id
      });
      const customer = await this.repo.findOne(stryMutAct_9fa48("4066") ? {} : (stryCov_9fa48("4066"), {
        where: where as any
      }));
      if (stryMutAct_9fa48("4069") ? false : stryMutAct_9fa48("4068") ? true : stryMutAct_9fa48("4067") ? customer : (stryCov_9fa48("4067", "4068", "4069"), !customer)) {
        if (stryMutAct_9fa48("4070")) {
          {}
        } else {
          stryCov_9fa48("4070");
          this.logger.warn(stryMutAct_9fa48("4071") ? `` : (stryCov_9fa48("4071"), `Webhook received for unknown customer: ${JSON.stringify(where)}`));
          return;
        }
      }
      const statusMap: Record<string, KycStatus> = stryMutAct_9fa48("4072") ? {} : (stryCov_9fa48("4072"), {
        APPROVED: stryMutAct_9fa48("4073") ? "" : (stryCov_9fa48("4073"), 'approved'),
        VERIFIED: stryMutAct_9fa48("4074") ? "" : (stryCov_9fa48("4074"), 'approved'),
        REJECTED: stryMutAct_9fa48("4075") ? "" : (stryCov_9fa48("4075"), 'rejected'),
        DECLINED: stryMutAct_9fa48("4076") ? "" : (stryCov_9fa48("4076"), 'rejected'),
        PENDING: stryMutAct_9fa48("4077") ? "" : (stryCov_9fa48("4077"), 'pending')
      });
      customer.status = stryMutAct_9fa48("4078") ? statusMap[payload.status?.toUpperCase()] && 'pending' : (stryCov_9fa48("4078"), statusMap[stryMutAct_9fa48("4080") ? payload.status.toUpperCase() : stryMutAct_9fa48("4079") ? payload.status?.toLowerCase() : (stryCov_9fa48("4079", "4080"), payload.status?.toUpperCase())] ?? (stryMutAct_9fa48("4081") ? "" : (stryCov_9fa48("4081"), 'pending')));
      await this.repo.save(customer);
      this.logger.log(stryMutAct_9fa48("4082") ? `` : (stryCov_9fa48("4082"), `KYC status updated: ${customer.stellarPublicKey} → ${customer.status}`));
    }
  }
  async isApproved(stellarPublicKey: string): Promise<boolean> {
    if (stryMutAct_9fa48("4083")) {
      {}
    } else {
      stryCov_9fa48("4083");
      const customer = await this.repo.findOne(stryMutAct_9fa48("4084") ? {} : (stryCov_9fa48("4084"), {
        where: stryMutAct_9fa48("4085") ? {} : (stryCov_9fa48("4085"), {
          stellarPublicKey
        })
      }));
      return stryMutAct_9fa48("4088") ? customer?.status !== 'approved' : stryMutAct_9fa48("4087") ? false : stryMutAct_9fa48("4086") ? true : (stryCov_9fa48("4086", "4087", "4088"), (stryMutAct_9fa48("4089") ? customer.status : (stryCov_9fa48("4089"), customer?.status)) === (stryMutAct_9fa48("4090") ? "" : (stryCov_9fa48("4090"), 'approved')));
    }
  }
}