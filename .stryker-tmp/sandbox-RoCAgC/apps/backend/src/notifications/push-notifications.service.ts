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
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';
@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  constructor(private configService: ConfigService, @InjectRepository(PushSubscription)
  private pushSubscriptionRepo: Repository<PushSubscription>) {
    if (stryMutAct_9fa48("5340")) {
      {}
    } else {
      stryCov_9fa48("5340");
      const publicKey = this.configService.get<string>(stryMutAct_9fa48("5341") ? "" : (stryCov_9fa48("5341"), 'VAPID_PUBLIC_KEY'));
      const privateKey = this.configService.get<string>(stryMutAct_9fa48("5342") ? "" : (stryCov_9fa48("5342"), 'VAPID_PRIVATE_KEY'));
      const subject = this.configService.get<string>(stryMutAct_9fa48("5343") ? "" : (stryCov_9fa48("5343"), 'VAPID_SUBJECT'), stryMutAct_9fa48("5344") ? "" : (stryCov_9fa48("5344"), 'mailto:admin@scoopdope.com'));
      if (stryMutAct_9fa48("5347") ? publicKey || privateKey : stryMutAct_9fa48("5346") ? false : stryMutAct_9fa48("5345") ? true : (stryCov_9fa48("5345", "5346", "5347"), publicKey && privateKey)) {
        if (stryMutAct_9fa48("5348")) {
          {}
        } else {
          stryCov_9fa48("5348");
          webpush.setVapidDetails(subject, publicKey, privateKey);
        }
      } else {
        if (stryMutAct_9fa48("5349")) {
          {}
        } else {
          stryCov_9fa48("5349");
          this.logger.warn(stryMutAct_9fa48("5350") ? "" : (stryCov_9fa48("5350"), 'VAPID keys are not configured. Push notifications will not work.'));
        }
      }
    }
  }
  async subscribe(userId: string, subscription: any) {
    if (stryMutAct_9fa48("5351")) {
      {}
    } else {
      stryCov_9fa48("5351");
      let sub = await this.pushSubscriptionRepo.findOne(stryMutAct_9fa48("5352") ? {} : (stryCov_9fa48("5352"), {
        where: stryMutAct_9fa48("5353") ? {} : (stryCov_9fa48("5353"), {
          userId,
          endpoint: subscription.endpoint
        })
      }));
      if (stryMutAct_9fa48("5356") ? false : stryMutAct_9fa48("5355") ? true : stryMutAct_9fa48("5354") ? sub : (stryCov_9fa48("5354", "5355", "5356"), !sub)) {
        if (stryMutAct_9fa48("5357")) {
          {}
        } else {
          stryCov_9fa48("5357");
          sub = this.pushSubscriptionRepo.create(stryMutAct_9fa48("5358") ? {} : (stryCov_9fa48("5358"), {
            userId,
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime,
            keys: subscription.keys
          }));
        }
      } else {
        if (stryMutAct_9fa48("5359")) {
          {}
        } else {
          stryCov_9fa48("5359");
          sub.expirationTime = subscription.expirationTime;
          sub.keys = subscription.keys;
        }
      }
      return this.pushSubscriptionRepo.save(sub);
    }
  }
  async unsubscribe(userId: string, endpoint: string) {
    if (stryMutAct_9fa48("5360")) {
      {}
    } else {
      stryCov_9fa48("5360");
      return this.pushSubscriptionRepo.delete(stryMutAct_9fa48("5361") ? {} : (stryCov_9fa48("5361"), {
        userId,
        endpoint
      }));
    }
  }
  async sendNotification(userId: string, payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
  }) {
    if (stryMutAct_9fa48("5362")) {
      {}
    } else {
      stryCov_9fa48("5362");
      const subscriptions = await this.pushSubscriptionRepo.find(stryMutAct_9fa48("5363") ? {} : (stryCov_9fa48("5363"), {
        where: stryMutAct_9fa48("5364") ? {} : (stryCov_9fa48("5364"), {
          userId
        })
      }));
      const notifications = subscriptions.map(async sub => {
        if (stryMutAct_9fa48("5365")) {
          {}
        } else {
          stryCov_9fa48("5365");
          try {
            if (stryMutAct_9fa48("5366")) {
              {}
            } else {
              stryCov_9fa48("5366");
              await webpush.sendNotification(stryMutAct_9fa48("5367") ? {} : (stryCov_9fa48("5367"), {
                endpoint: sub.endpoint,
                keys: sub.keys
              }), JSON.stringify(payload));
            }
          } catch (error) {
            if (stryMutAct_9fa48("5368")) {
              {}
            } else {
              stryCov_9fa48("5368");
              if (stryMutAct_9fa48("5371") ? error.statusCode === 410 && error.statusCode === 404 : stryMutAct_9fa48("5370") ? false : stryMutAct_9fa48("5369") ? true : (stryCov_9fa48("5369", "5370", "5371"), (stryMutAct_9fa48("5373") ? error.statusCode !== 410 : stryMutAct_9fa48("5372") ? false : (stryCov_9fa48("5372", "5373"), error.statusCode === 410)) || (stryMutAct_9fa48("5375") ? error.statusCode !== 404 : stryMutAct_9fa48("5374") ? false : (stryCov_9fa48("5374", "5375"), error.statusCode === 404)))) {
                if (stryMutAct_9fa48("5376")) {
                  {}
                } else {
                  stryCov_9fa48("5376");
                  // Subscription has expired or is no longer valid
                  this.logger.log(stryMutAct_9fa48("5377") ? `` : (stryCov_9fa48("5377"), `Removing invalid subscription for user ${userId}: ${sub.endpoint}`));
                  await this.pushSubscriptionRepo.remove(sub);
                }
              } else {
                if (stryMutAct_9fa48("5378")) {
                  {}
                } else {
                  stryCov_9fa48("5378");
                  this.logger.error(stryMutAct_9fa48("5379") ? `` : (stryCov_9fa48("5379"), `Error sending push notification to user ${userId}:`), error);
                }
              }
            }
          }
        }
      });
      return Promise.all(notifications);
    }
  }
}