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
import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import * as crypto from 'crypto';
import * as https from 'https';
import * as http from 'http';
import { Webhook } from './webhook.entity';
import { WebhookDelivery, DeliveryStatus } from './webhook-delivery.entity';
const MAX_ATTEMPTS = 5;
const RETRY_DELAYS = stryMutAct_9fa48("7526") ? [] : (stryCov_9fa48("7526"), [30, 60, 300, 1800, 7200]); // seconds

@Injectable()
export class WebhooksService implements OnModuleInit {
  private readonly logger = new Logger(WebhooksService.name);
  constructor(@InjectRepository(Webhook)
  private webhookRepo: Repository<Webhook>, @InjectRepository(WebhookDelivery)
  private deliveryRepo: Repository<WebhookDelivery>) {}
  onModuleInit() {
    if (stryMutAct_9fa48("7527")) {
      {}
    } else {
      stryCov_9fa48("7527");
      setInterval(stryMutAct_9fa48("7528") ? () => undefined : (stryCov_9fa48("7528"), () => this.retryPending()), 60_000);
    }
  }

  // --- Registration ---

  async register(userId: string, url: string, events: string[]): Promise<Webhook> {
    if (stryMutAct_9fa48("7529")) {
      {}
    } else {
      stryCov_9fa48("7529");
      const secret = crypto.randomBytes(32).toString(stryMutAct_9fa48("7530") ? "" : (stryCov_9fa48("7530"), 'hex'));
      return this.webhookRepo.save(this.webhookRepo.create(stryMutAct_9fa48("7531") ? {} : (stryCov_9fa48("7531"), {
        userId,
        url,
        events: events.join(stryMutAct_9fa48("7532") ? "" : (stryCov_9fa48("7532"), ',')),
        secret
      })));
    }
  }
  async list(userId: string): Promise<Webhook[]> {
    if (stryMutAct_9fa48("7533")) {
      {}
    } else {
      stryCov_9fa48("7533");
      return this.webhookRepo.find(stryMutAct_9fa48("7534") ? {} : (stryCov_9fa48("7534"), {
        where: stryMutAct_9fa48("7535") ? {} : (stryCov_9fa48("7535"), {
          userId
        })
      }));
    }
  }
  async getWebhookForUser(id: string, userId: string): Promise<Webhook> {
    if (stryMutAct_9fa48("7536")) {
      {}
    } else {
      stryCov_9fa48("7536");
      const wh = await this.webhookRepo.findOne(stryMutAct_9fa48("7537") ? {} : (stryCov_9fa48("7537"), {
        where: stryMutAct_9fa48("7538") ? {} : (stryCov_9fa48("7538"), {
          id,
          userId
        })
      }));
      if (stryMutAct_9fa48("7541") ? false : stryMutAct_9fa48("7540") ? true : stryMutAct_9fa48("7539") ? wh : (stryCov_9fa48("7539", "7540", "7541"), !wh)) throw new NotFoundException(stryMutAct_9fa48("7542") ? "" : (stryCov_9fa48("7542"), 'Webhook not found'));
      return wh;
    }
  }
  async delete(userId: string, id: string): Promise<void> {
    if (stryMutAct_9fa48("7543")) {
      {}
    } else {
      stryCov_9fa48("7543");
      const wh = await this.webhookRepo.findOne(stryMutAct_9fa48("7544") ? {} : (stryCov_9fa48("7544"), {
        where: stryMutAct_9fa48("7545") ? {} : (stryCov_9fa48("7545"), {
          id,
          userId
        })
      }));
      if (stryMutAct_9fa48("7548") ? false : stryMutAct_9fa48("7547") ? true : stryMutAct_9fa48("7546") ? wh : (stryCov_9fa48("7546", "7547", "7548"), !wh)) throw new NotFoundException(stryMutAct_9fa48("7549") ? "" : (stryCov_9fa48("7549"), 'Webhook not found'));
      await this.webhookRepo.remove(wh);
    }
  }
  async update(userId: string, id: string, data: Partial<Pick<Webhook, 'url' | 'events' | 'isActive'>>) {
    if (stryMutAct_9fa48("7550")) {
      {}
    } else {
      stryCov_9fa48("7550");
      const wh = await this.webhookRepo.findOne(stryMutAct_9fa48("7551") ? {} : (stryCov_9fa48("7551"), {
        where: stryMutAct_9fa48("7552") ? {} : (stryCov_9fa48("7552"), {
          id,
          userId
        })
      }));
      if (stryMutAct_9fa48("7555") ? false : stryMutAct_9fa48("7554") ? true : stryMutAct_9fa48("7553") ? wh : (stryCov_9fa48("7553", "7554", "7555"), !wh)) throw new NotFoundException(stryMutAct_9fa48("7556") ? "" : (stryCov_9fa48("7556"), 'Webhook not found'));
      if (stryMutAct_9fa48("7558") ? false : stryMutAct_9fa48("7557") ? true : (stryCov_9fa48("7557", "7558"), data.url)) wh.url = data.url;
      if (stryMutAct_9fa48("7560") ? false : stryMutAct_9fa48("7559") ? true : (stryCov_9fa48("7559", "7560"), data.events)) wh.events = Array.isArray(data.events) ? (data.events as any).join(stryMutAct_9fa48("7561") ? "" : (stryCov_9fa48("7561"), ',')) : data.events;
      if (stryMutAct_9fa48("7564") ? data.isActive === undefined : stryMutAct_9fa48("7563") ? false : stryMutAct_9fa48("7562") ? true : (stryCov_9fa48("7562", "7563", "7564"), data.isActive !== undefined)) wh.isActive = data.isActive;
      return this.webhookRepo.save(wh);
    }
  }

  // --- Event publishing ---

  async publish(event: string, payload: object): Promise<void> {
    if (stryMutAct_9fa48("7565")) {
      {}
    } else {
      stryCov_9fa48("7565");
      const webhooks = await this.webhookRepo.createQueryBuilder(stryMutAct_9fa48("7566") ? "" : (stryCov_9fa48("7566"), 'w')).where(stryMutAct_9fa48("7567") ? "" : (stryCov_9fa48("7567"), 'w.isActive = true')).andWhere(stryMutAct_9fa48("7568") ? `` : (stryCov_9fa48("7568"), `w.events LIKE :event`), stryMutAct_9fa48("7569") ? {} : (stryCov_9fa48("7569"), {
        event: stryMutAct_9fa48("7570") ? `` : (stryCov_9fa48("7570"), `%${event}%`)
      })).getMany();
      for (const wh of webhooks) {
        if (stryMutAct_9fa48("7571")) {
          {}
        } else {
          stryCov_9fa48("7571");
          const delivery = this.deliveryRepo.create(stryMutAct_9fa48("7572") ? {} : (stryCov_9fa48("7572"), {
            webhookId: wh.id,
            event,
            payload: JSON.stringify(payload)
          }));
          const saved = await this.deliveryRepo.save(delivery);
          setImmediate(stryMutAct_9fa48("7573") ? () => undefined : (stryCov_9fa48("7573"), () => this.deliver(wh, saved)));
        }
      }
    }
  }
  verifySignature(secret: string, body: string, signature: string, timestamp?: string): boolean {
    if (stryMutAct_9fa48("7574")) {
      {}
    } else {
      stryCov_9fa48("7574");
      // Validate timestamp to prevent replay attacks (5 min window)
      if (stryMutAct_9fa48("7576") ? false : stryMutAct_9fa48("7575") ? true : (stryCov_9fa48("7575", "7576"), timestamp)) {
        if (stryMutAct_9fa48("7577")) {
          {}
        } else {
          stryCov_9fa48("7577");
          const ts = parseInt(timestamp, 10);
          if (stryMutAct_9fa48("7579") ? false : stryMutAct_9fa48("7578") ? true : (stryCov_9fa48("7578", "7579"), isNaN(ts))) return stryMutAct_9fa48("7580") ? true : (stryCov_9fa48("7580"), false);
          const now = Math.floor(stryMutAct_9fa48("7581") ? Date.now() * 1000 : (stryCov_9fa48("7581"), Date.now() / 1000));
          if (stryMutAct_9fa48("7585") ? Math.abs(now - ts) <= 300 : stryMutAct_9fa48("7584") ? Math.abs(now - ts) >= 300 : stryMutAct_9fa48("7583") ? false : stryMutAct_9fa48("7582") ? true : (stryCov_9fa48("7582", "7583", "7584", "7585"), Math.abs(stryMutAct_9fa48("7586") ? now + ts : (stryCov_9fa48("7586"), now - ts)) > 300)) return stryMutAct_9fa48("7587") ? true : (stryCov_9fa48("7587"), false); // 5 minutes
        }
      }
      const expected = this.sign(secret, body);
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    }
  }
  private async deliver(wh: Webhook, delivery: WebhookDelivery): Promise<void> {
    if (stryMutAct_9fa48("7588")) {
      {}
    } else {
      stryCov_9fa48("7588");
      stryMutAct_9fa48("7589") ? delivery.attempts -= 1 : (stryCov_9fa48("7589"), delivery.attempts += 1);
      const body = delivery.payload;
      const timestamp = Math.floor(stryMutAct_9fa48("7590") ? Date.now() * 1000 : (stryCov_9fa48("7590"), Date.now() / 1000)).toString();
      const sig = this.sign(wh.secret, body);
      try {
        if (stryMutAct_9fa48("7591")) {
          {}
        } else {
          stryCov_9fa48("7591");
          const {
            status,
            responseBody
          } = await this.httpPost(wh.url, body, sig, timestamp);
          delivery.responseStatus = status;
          delivery.responseBody = stryMutAct_9fa48("7592") ? responseBody : (stryCov_9fa48("7592"), responseBody.slice(0, 500));
          delivery.status = (stryMutAct_9fa48("7595") ? status >= 200 || status < 300 : stryMutAct_9fa48("7594") ? false : stryMutAct_9fa48("7593") ? true : (stryCov_9fa48("7593", "7594", "7595"), (stryMutAct_9fa48("7598") ? status < 200 : stryMutAct_9fa48("7597") ? status > 200 : stryMutAct_9fa48("7596") ? true : (stryCov_9fa48("7596", "7597", "7598"), status >= 200)) && (stryMutAct_9fa48("7601") ? status >= 300 : stryMutAct_9fa48("7600") ? status <= 300 : stryMutAct_9fa48("7599") ? true : (stryCov_9fa48("7599", "7600", "7601"), status < 300)))) ? DeliveryStatus.SUCCESS : DeliveryStatus.FAILED;
          if (stryMutAct_9fa48("7604") ? delivery.status === DeliveryStatus.FAILED || delivery.attempts < MAX_ATTEMPTS : stryMutAct_9fa48("7603") ? false : stryMutAct_9fa48("7602") ? true : (stryCov_9fa48("7602", "7603", "7604"), (stryMutAct_9fa48("7606") ? delivery.status !== DeliveryStatus.FAILED : stryMutAct_9fa48("7605") ? true : (stryCov_9fa48("7605", "7606"), delivery.status === DeliveryStatus.FAILED)) && (stryMutAct_9fa48("7609") ? delivery.attempts >= MAX_ATTEMPTS : stryMutAct_9fa48("7608") ? delivery.attempts <= MAX_ATTEMPTS : stryMutAct_9fa48("7607") ? true : (stryCov_9fa48("7607", "7608", "7609"), delivery.attempts < MAX_ATTEMPTS)))) {
            if (stryMutAct_9fa48("7610")) {
              {}
            } else {
              stryCov_9fa48("7610");
              const delay = stryMutAct_9fa48("7611") ? RETRY_DELAYS[delivery.attempts - 1] && 7200 : (stryCov_9fa48("7611"), RETRY_DELAYS[stryMutAct_9fa48("7612") ? delivery.attempts + 1 : (stryCov_9fa48("7612"), delivery.attempts - 1)] ?? 7200);
              delivery.nextRetryAt = new Date(stryMutAct_9fa48("7613") ? Date.now() - delay * 1000 : (stryCov_9fa48("7613"), Date.now() + (stryMutAct_9fa48("7614") ? delay / 1000 : (stryCov_9fa48("7614"), delay * 1000))));
              delivery.status = DeliveryStatus.PENDING;
            }
          }
        }
      } catch (err: any) {
        if (stryMutAct_9fa48("7615")) {
          {}
        } else {
          stryCov_9fa48("7615");
          delivery.responseBody = err.message;
          delivery.status = DeliveryStatus.FAILED;
          if (stryMutAct_9fa48("7619") ? delivery.attempts >= MAX_ATTEMPTS : stryMutAct_9fa48("7618") ? delivery.attempts <= MAX_ATTEMPTS : stryMutAct_9fa48("7617") ? false : stryMutAct_9fa48("7616") ? true : (stryCov_9fa48("7616", "7617", "7618", "7619"), delivery.attempts < MAX_ATTEMPTS)) {
            if (stryMutAct_9fa48("7620")) {
              {}
            } else {
              stryCov_9fa48("7620");
              const delay = stryMutAct_9fa48("7621") ? RETRY_DELAYS[delivery.attempts - 1] && 7200 : (stryCov_9fa48("7621"), RETRY_DELAYS[stryMutAct_9fa48("7622") ? delivery.attempts + 1 : (stryCov_9fa48("7622"), delivery.attempts - 1)] ?? 7200);
              delivery.nextRetryAt = new Date(stryMutAct_9fa48("7623") ? Date.now() - delay * 1000 : (stryCov_9fa48("7623"), Date.now() + (stryMutAct_9fa48("7624") ? delay / 1000 : (stryCov_9fa48("7624"), delay * 1000))));
              delivery.status = DeliveryStatus.PENDING;
            }
          }
        }
      }
      await this.deliveryRepo.save(delivery);
    }
  }
  private sign(secret: string, body: string): string {
    if (stryMutAct_9fa48("7625")) {
      {}
    } else {
      stryCov_9fa48("7625");
      return (stryMutAct_9fa48("7626") ? "" : (stryCov_9fa48("7626"), 'sha256=')) + crypto.createHmac(stryMutAct_9fa48("7627") ? "" : (stryCov_9fa48("7627"), 'sha256'), secret).update(body).digest(stryMutAct_9fa48("7628") ? "" : (stryCov_9fa48("7628"), 'hex'));
    }
  }
  private httpPost(url: string, body: string, signature: string, timestamp: string): Promise<{
    status: number;
    responseBody: string;
  }> {
    if (stryMutAct_9fa48("7629")) {
      {}
    } else {
      stryCov_9fa48("7629");
      return new Promise((resolve, reject) => {
        if (stryMutAct_9fa48("7630")) {
          {}
        } else {
          stryCov_9fa48("7630");
          const parsed = new URL(url);
          const lib = (stryMutAct_9fa48("7633") ? parsed.protocol !== 'https:' : stryMutAct_9fa48("7632") ? false : stryMutAct_9fa48("7631") ? true : (stryCov_9fa48("7631", "7632", "7633"), parsed.protocol === (stryMutAct_9fa48("7634") ? "" : (stryCov_9fa48("7634"), 'https:')))) ? https : http;
          const req = lib.request(stryMutAct_9fa48("7635") ? {} : (stryCov_9fa48("7635"), {
            hostname: parsed.hostname,
            port: parsed.port,
            path: stryMutAct_9fa48("7636") ? parsed.pathname - parsed.search : (stryCov_9fa48("7636"), parsed.pathname + parsed.search),
            method: stryMutAct_9fa48("7637") ? "" : (stryCov_9fa48("7637"), 'POST'),
            headers: stryMutAct_9fa48("7638") ? {} : (stryCov_9fa48("7638"), {
              'Content-Type': stryMutAct_9fa48("7639") ? "" : (stryCov_9fa48("7639"), 'application/json'),
              'X-Webhook-Signature': signature,
              'X-Webhook-Timestamp': timestamp,
              'Content-Length': Buffer.byteLength(body)
            })
          }), res => {
            if (stryMutAct_9fa48("7640")) {
              {}
            } else {
              stryCov_9fa48("7640");
              let data = stryMutAct_9fa48("7641") ? "Stryker was here!" : (stryCov_9fa48("7641"), '');
              res.on(stryMutAct_9fa48("7642") ? "" : (stryCov_9fa48("7642"), 'data'), stryMutAct_9fa48("7643") ? () => undefined : (stryCov_9fa48("7643"), chunk => stryMutAct_9fa48("7644") ? data -= chunk : (stryCov_9fa48("7644"), data += chunk)));
              res.on(stryMutAct_9fa48("7645") ? "" : (stryCov_9fa48("7645"), 'end'), stryMutAct_9fa48("7646") ? () => undefined : (stryCov_9fa48("7646"), () => resolve(stryMutAct_9fa48("7647") ? {} : (stryCov_9fa48("7647"), {
                status: stryMutAct_9fa48("7648") ? res.statusCode && 0 : (stryCov_9fa48("7648"), res.statusCode ?? 0),
                responseBody: data
              }))));
            }
          });
          req.on(stryMutAct_9fa48("7649") ? "" : (stryCov_9fa48("7649"), 'error'), reject);
          req.setTimeout(10_000, () => {
            if (stryMutAct_9fa48("7650")) {
              {}
            } else {
              stryCov_9fa48("7650");
              req.destroy();
              reject(new Error(stryMutAct_9fa48("7651") ? "" : (stryCov_9fa48("7651"), 'Timeout')));
            }
          });
          req.write(body);
          req.end();
        }
      });
    }
  }
  async retryPending(): Promise<void> {
    if (stryMutAct_9fa48("7652")) {
      {}
    } else {
      stryCov_9fa48("7652");
      const now = new Date();
      const pending = await this.deliveryRepo.find(stryMutAct_9fa48("7653") ? {} : (stryCov_9fa48("7653"), {
        where: stryMutAct_9fa48("7654") ? [] : (stryCov_9fa48("7654"), [stryMutAct_9fa48("7655") ? {} : (stryCov_9fa48("7655"), {
          status: DeliveryStatus.PENDING,
          nextRetryAt: LessThanOrEqual(now)
        }), stryMutAct_9fa48("7656") ? {} : (stryCov_9fa48("7656"), {
          status: DeliveryStatus.PENDING,
          nextRetryAt: IsNull()
        })]),
        take: 20
      }));
      for (const delivery of pending) {
        if (stryMutAct_9fa48("7657")) {
          {}
        } else {
          stryCov_9fa48("7657");
          const wh = await this.webhookRepo.findOne(stryMutAct_9fa48("7658") ? {} : (stryCov_9fa48("7658"), {
            where: stryMutAct_9fa48("7659") ? {} : (stryCov_9fa48("7659"), {
              id: delivery.webhookId
            })
          }));
          if (stryMutAct_9fa48("7661") ? false : stryMutAct_9fa48("7660") ? true : (stryCov_9fa48("7660", "7661"), wh)) await this.deliver(wh, delivery);
        }
      }
    }
  }

  // --- Logs ---

  getLogs(webhookId: string, userId: string) {
    if (stryMutAct_9fa48("7662")) {
      {}
    } else {
      stryCov_9fa48("7662");
      return this.deliveryRepo.createQueryBuilder(stryMutAct_9fa48("7663") ? "" : (stryCov_9fa48("7663"), 'd')).innerJoin(Webhook, stryMutAct_9fa48("7664") ? "" : (stryCov_9fa48("7664"), 'w'), stryMutAct_9fa48("7665") ? "" : (stryCov_9fa48("7665"), 'w.id = d.webhookId')).where(stryMutAct_9fa48("7666") ? "" : (stryCov_9fa48("7666"), 'd.webhookId = :webhookId'), stryMutAct_9fa48("7667") ? {} : (stryCov_9fa48("7667"), {
        webhookId
      })).andWhere(stryMutAct_9fa48("7668") ? "" : (stryCov_9fa48("7668"), 'w.userId = :userId'), stryMutAct_9fa48("7669") ? {} : (stryCov_9fa48("7669"), {
        userId
      })).orderBy(stryMutAct_9fa48("7670") ? "" : (stryCov_9fa48("7670"), 'd.createdAt'), stryMutAct_9fa48("7671") ? "" : (stryCov_9fa48("7671"), 'DESC')).limit(100).getMany();
    }
  }

  // --- Event listeners ---

  @OnEvent('enrollment.created')
  onEnrollment(payload: any) {
    if (stryMutAct_9fa48("7672")) {
      {}
    } else {
      stryCov_9fa48("7672");
      this.publish(stryMutAct_9fa48("7673") ? "" : (stryCov_9fa48("7673"), 'enrollment.created'), payload);
    }
  }
  @OnEvent('enrollment.completed')
  onCompletion(payload: any) {
    if (stryMutAct_9fa48("7674")) {
      {}
    } else {
      stryCov_9fa48("7674");
      this.publish(stryMutAct_9fa48("7675") ? "" : (stryCov_9fa48("7675"), 'enrollment.completed'), payload);
    }
  }
  @OnEvent('credential.issued')
  onCredential(payload: any) {
    if (stryMutAct_9fa48("7676")) {
      {}
    } else {
      stryCov_9fa48("7676");
      this.publish(stryMutAct_9fa48("7677") ? "" : (stryCov_9fa48("7677"), 'credential.issued'), payload);
    }
  }
}