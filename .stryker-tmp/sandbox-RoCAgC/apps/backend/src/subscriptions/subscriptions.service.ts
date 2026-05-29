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
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, SubscriptionTier } from '../users/user.entity';
@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;
  private readonly logger = new Logger(SubscriptionsService.name);
  constructor(private configService: ConfigService, @InjectRepository(User)
  private userRepo: Repository<User>) {
    if (stryMutAct_9fa48("6809")) {
      {}
    } else {
      stryCov_9fa48("6809");
      this.stripe = new Stripe(stryMutAct_9fa48("6812") ? this.configService.get<string>('stripe.secretKey') && '' : stryMutAct_9fa48("6811") ? false : stryMutAct_9fa48("6810") ? true : (stryCov_9fa48("6810", "6811", "6812"), this.configService.get<string>(stryMutAct_9fa48("6813") ? "" : (stryCov_9fa48("6813"), 'stripe.secretKey')) || (stryMutAct_9fa48("6814") ? "Stryker was here!" : (stryCov_9fa48("6814"), ''))), stryMutAct_9fa48("6815") ? {} : (stryCov_9fa48("6815"), {
        apiVersion: '2025-01-27' as any
      }));
    }
  }
  async createCheckoutSession(userId: string, tier: SubscriptionTier) {
    if (stryMutAct_9fa48("6816")) {
      {}
    } else {
      stryCov_9fa48("6816");
      const user = await this.userRepo.findOne(stryMutAct_9fa48("6817") ? {} : (stryCov_9fa48("6817"), {
        where: stryMutAct_9fa48("6818") ? {} : (stryCov_9fa48("6818"), {
          id: userId
        })
      }));
      if (stryMutAct_9fa48("6821") ? false : stryMutAct_9fa48("6820") ? true : stryMutAct_9fa48("6819") ? user : (stryCov_9fa48("6819", "6820", "6821"), !user)) throw new NotFoundException(stryMutAct_9fa48("6822") ? "" : (stryCov_9fa48("6822"), 'User not found'));
      let priceId: string;
      if (stryMutAct_9fa48("6825") ? tier !== SubscriptionTier.PRO : stryMutAct_9fa48("6824") ? false : stryMutAct_9fa48("6823") ? true : (stryCov_9fa48("6823", "6824", "6825"), tier === SubscriptionTier.PRO)) {
        if (stryMutAct_9fa48("6826")) {
          {}
        } else {
          stryCov_9fa48("6826");
          priceId = this.configService.get<string>(stryMutAct_9fa48("6827") ? "" : (stryCov_9fa48("6827"), 'stripe.proPriceId'))!;
        }
      } else if (stryMutAct_9fa48("6830") ? tier !== SubscriptionTier.ENTERPRISE : stryMutAct_9fa48("6829") ? false : stryMutAct_9fa48("6828") ? true : (stryCov_9fa48("6828", "6829", "6830"), tier === SubscriptionTier.ENTERPRISE)) {
        if (stryMutAct_9fa48("6831")) {
          {}
        } else {
          stryCov_9fa48("6831");
          priceId = this.configService.get<string>(stryMutAct_9fa48("6832") ? "" : (stryCov_9fa48("6832"), 'stripe.enterprisePriceId'))!;
        }
      } else {
        if (stryMutAct_9fa48("6833")) {
          {}
        } else {
          stryCov_9fa48("6833");
          throw new BadRequestException(stryMutAct_9fa48("6834") ? "" : (stryCov_9fa48("6834"), 'Invalid subscription tier'));
        }
      }
      if (stryMutAct_9fa48("6837") ? false : stryMutAct_9fa48("6836") ? true : stryMutAct_9fa48("6835") ? priceId : (stryCov_9fa48("6835", "6836", "6837"), !priceId)) {
        if (stryMutAct_9fa48("6838")) {
          {}
        } else {
          stryCov_9fa48("6838");
          throw new BadRequestException(stryMutAct_9fa48("6839") ? "" : (stryCov_9fa48("6839"), 'Stripe Price ID not configured for this tier'));
        }
      }
      const session = await this.stripe.checkout.sessions.create(stryMutAct_9fa48("6840") ? {} : (stryCov_9fa48("6840"), {
        payment_method_types: stryMutAct_9fa48("6841") ? [] : (stryCov_9fa48("6841"), [stryMutAct_9fa48("6842") ? "" : (stryCov_9fa48("6842"), 'card')]),
        line_items: stryMutAct_9fa48("6843") ? [] : (stryCov_9fa48("6843"), [stryMutAct_9fa48("6844") ? {} : (stryCov_9fa48("6844"), {
          price: priceId,
          quantity: 1
        })]),
        mode: stryMutAct_9fa48("6845") ? "" : (stryCov_9fa48("6845"), 'subscription'),
        success_url: stryMutAct_9fa48("6846") ? `` : (stryCov_9fa48("6846"), `${this.configService.get(stryMutAct_9fa48("6847") ? "" : (stryCov_9fa48("6847"), 'frontend.url'))}/dashboard?subscription=success`),
        cancel_url: stryMutAct_9fa48("6848") ? `` : (stryCov_9fa48("6848"), `${this.configService.get(stryMutAct_9fa48("6849") ? "" : (stryCov_9fa48("6849"), 'frontend.url'))}/pricing`),
        client_reference_id: userId,
        customer_email: user.email,
        metadata: stryMutAct_9fa48("6850") ? {} : (stryCov_9fa48("6850"), {
          userId,
          tier
        })
      }));
      return stryMutAct_9fa48("6851") ? {} : (stryCov_9fa48("6851"), {
        url: session.url
      });
    }
  }
  async handleWebhook(signature: string, payload: Buffer) {
    if (stryMutAct_9fa48("6852")) {
      {}
    } else {
      stryCov_9fa48("6852");
      const webhookSecret = this.configService.get<string>(stryMutAct_9fa48("6853") ? "" : (stryCov_9fa48("6853"), 'stripe.webhookSecret'))!;
      let event: Stripe.Event;
      try {
        if (stryMutAct_9fa48("6854")) {
          {}
        } else {
          stryCov_9fa48("6854");
          event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
      } catch (err) {
        if (stryMutAct_9fa48("6855")) {
          {}
        } else {
          stryCov_9fa48("6855");
          this.logger.error(stryMutAct_9fa48("6856") ? `` : (stryCov_9fa48("6856"), `Webhook signature verification failed: ${err.message}`));
          throw new BadRequestException(stryMutAct_9fa48("6857") ? `` : (stryCov_9fa48("6857"), `Webhook Error: ${err.message}`));
        }
      }
      switch (event.type) {
        case stryMutAct_9fa48("6859") ? "" : (stryCov_9fa48("6859"), 'checkout.session.completed'):
          if (stryMutAct_9fa48("6858")) {} else {
            stryCov_9fa48("6858");
            await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
            break;
          }
        case stryMutAct_9fa48("6860") ? "" : (stryCov_9fa48("6860"), 'customer.subscription.updated'):
        case stryMutAct_9fa48("6862") ? "" : (stryCov_9fa48("6862"), 'customer.subscription.deleted'):
          if (stryMutAct_9fa48("6861")) {} else {
            stryCov_9fa48("6861");
            await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
            break;
          }
        default:
          if (stryMutAct_9fa48("6863")) {} else {
            stryCov_9fa48("6863");
            this.logger.log(stryMutAct_9fa48("6864") ? `` : (stryCov_9fa48("6864"), `Unhandled event type ${event.type}`));
          }
      }
    }
  }
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (stryMutAct_9fa48("6865")) {
      {}
    } else {
      stryCov_9fa48("6865");
      const userId = stryMutAct_9fa48("6866") ? session.metadata.userId : (stryCov_9fa48("6866"), session.metadata?.userId);
      const tier = session.metadata?.tier as SubscriptionTier;
      const stripeCustomerId = session.customer as string;
      const stripeSubscriptionId = session.subscription as string;
      if (stryMutAct_9fa48("6869") ? !userId && !tier : stryMutAct_9fa48("6868") ? false : stryMutAct_9fa48("6867") ? true : (stryCov_9fa48("6867", "6868", "6869"), (stryMutAct_9fa48("6870") ? userId : (stryCov_9fa48("6870"), !userId)) || (stryMutAct_9fa48("6871") ? tier : (stryCov_9fa48("6871"), !tier)))) return;
      const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
      await this.userRepo.update(userId, stryMutAct_9fa48("6872") ? {} : (stryCov_9fa48("6872"), {
        subscriptionTier: tier,
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionExpiresAt: new Date(stryMutAct_9fa48("6873") ? subscription.current_period_end / 1000 : (stryCov_9fa48("6873"), subscription.current_period_end * 1000))
      }));
      this.logger.log(stryMutAct_9fa48("6874") ? `` : (stryCov_9fa48("6874"), `Subscription activated for user ${userId}: ${tier}`));
    }
  }
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    if (stryMutAct_9fa48("6875")) {
      {}
    } else {
      stryCov_9fa48("6875");
      const stripeSubscriptionId = subscription.id;
      const user = await this.userRepo.findOne(stryMutAct_9fa48("6876") ? {} : (stryCov_9fa48("6876"), {
        where: stryMutAct_9fa48("6877") ? {} : (stryCov_9fa48("6877"), {
          stripeSubscriptionId
        })
      }));
      if (stryMutAct_9fa48("6880") ? false : stryMutAct_9fa48("6879") ? true : stryMutAct_9fa48("6878") ? user : (stryCov_9fa48("6878", "6879", "6880"), !user)) return;
      if (stryMutAct_9fa48("6883") ? subscription.status !== 'active' : stryMutAct_9fa48("6882") ? false : stryMutAct_9fa48("6881") ? true : (stryCov_9fa48("6881", "6882", "6883"), subscription.status === (stryMutAct_9fa48("6884") ? "" : (stryCov_9fa48("6884"), 'active')))) {
        if (stryMutAct_9fa48("6885")) {
          {}
        } else {
          stryCov_9fa48("6885");
          await this.userRepo.update(user.id, stryMutAct_9fa48("6886") ? {} : (stryCov_9fa48("6886"), {
            subscriptionExpiresAt: new Date(stryMutAct_9fa48("6887") ? subscription.current_period_end / 1000 : (stryCov_9fa48("6887"), subscription.current_period_end * 1000))
          }));
        }
      } else {
        if (stryMutAct_9fa48("6888")) {
          {}
        } else {
          stryCov_9fa48("6888");
          await this.userRepo.update(user.id, stryMutAct_9fa48("6889") ? {} : (stryCov_9fa48("6889"), {
            subscriptionTier: SubscriptionTier.FREE,
            subscriptionExpiresAt: null
          }));
        }
      }
    }
  }
  async getSubscriptionStatus(userId: string) {
    if (stryMutAct_9fa48("6890")) {
      {}
    } else {
      stryCov_9fa48("6890");
      const user = await this.userRepo.findOne(stryMutAct_9fa48("6891") ? {} : (stryCov_9fa48("6891"), {
        where: stryMutAct_9fa48("6892") ? {} : (stryCov_9fa48("6892"), {
          id: userId
        })
      }));
      if (stryMutAct_9fa48("6895") ? false : stryMutAct_9fa48("6894") ? true : stryMutAct_9fa48("6893") ? user : (stryCov_9fa48("6893", "6894", "6895"), !user)) throw new NotFoundException(stryMutAct_9fa48("6896") ? "" : (stryCov_9fa48("6896"), 'User not found'));
      return stryMutAct_9fa48("6897") ? {} : (stryCov_9fa48("6897"), {
        tier: user.subscriptionTier,
        expiresAt: user.subscriptionExpiresAt,
        isPro: stryMutAct_9fa48("6900") ? user.subscriptionTier === SubscriptionTier.PRO && user.subscriptionTier === SubscriptionTier.ENTERPRISE : stryMutAct_9fa48("6899") ? false : stryMutAct_9fa48("6898") ? true : (stryCov_9fa48("6898", "6899", "6900"), (stryMutAct_9fa48("6902") ? user.subscriptionTier !== SubscriptionTier.PRO : stryMutAct_9fa48("6901") ? false : (stryCov_9fa48("6901", "6902"), user.subscriptionTier === SubscriptionTier.PRO)) || (stryMutAct_9fa48("6904") ? user.subscriptionTier !== SubscriptionTier.ENTERPRISE : stryMutAct_9fa48("6903") ? false : (stryCov_9fa48("6903", "6904"), user.subscriptionTier === SubscriptionTier.ENTERPRISE)))
      });
    }
  }
}