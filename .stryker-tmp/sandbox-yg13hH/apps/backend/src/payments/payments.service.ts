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
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Course } from '../courses/course.entity';
import { CurrencyConversionService, SupportedCurrency } from './currency-conversion.service';
@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);
  constructor(private configService: ConfigService, private currencyConversion: CurrencyConversionService, @InjectRepository(Course)
  private courseRepo: Repository<Course>) {
    if (stryMutAct_9fa48("5465")) {
      {}
    } else {
      stryCov_9fa48("5465");
      this.stripe = new Stripe(stryMutAct_9fa48("5468") ? this.configService.get<string>('stripe.secretKey') && '' : stryMutAct_9fa48("5467") ? false : stryMutAct_9fa48("5466") ? true : (stryCov_9fa48("5466", "5467", "5468"), this.configService.get<string>(stryMutAct_9fa48("5469") ? "" : (stryCov_9fa48("5469"), 'stripe.secretKey')) || (stryMutAct_9fa48("5470") ? "Stryker was here!" : (stryCov_9fa48("5470"), ''))), stryMutAct_9fa48("5471") ? {} : (stryCov_9fa48("5471"), {
        apiVersion: '2025-01-27' as any
      }));
    }
  }
  async createPaymentIntent(courseId: string, currency: SupportedCurrency, userId: string) {
    if (stryMutAct_9fa48("5472")) {
      {}
    } else {
      stryCov_9fa48("5472");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("5473") ? {} : (stryCov_9fa48("5473"), {
        where: stryMutAct_9fa48("5474") ? {} : (stryCov_9fa48("5474"), {
          id: courseId
        })
      }));
      if (stryMutAct_9fa48("5477") ? false : stryMutAct_9fa48("5476") ? true : stryMutAct_9fa48("5475") ? course : (stryCov_9fa48("5475", "5476", "5477"), !course)) throw new NotFoundException(stryMutAct_9fa48("5478") ? "" : (stryCov_9fa48("5478"), 'Course not found'));
      if (stryMutAct_9fa48("5481") ? !course.priceUsd && course.priceUsd <= 0 : stryMutAct_9fa48("5480") ? false : stryMutAct_9fa48("5479") ? true : (stryCov_9fa48("5479", "5480", "5481"), (stryMutAct_9fa48("5482") ? course.priceUsd : (stryCov_9fa48("5482"), !course.priceUsd)) || (stryMutAct_9fa48("5485") ? course.priceUsd > 0 : stryMutAct_9fa48("5484") ? course.priceUsd < 0 : stryMutAct_9fa48("5483") ? false : (stryCov_9fa48("5483", "5484", "5485"), course.priceUsd <= 0)))) {
        if (stryMutAct_9fa48("5486")) {
          {}
        } else {
          stryCov_9fa48("5486");
          throw new BadRequestException(stryMutAct_9fa48("5487") ? "" : (stryCov_9fa48("5487"), 'This course is free and does not require payment'));
        }
      }
      const amount = await this.currencyConversion.toStripeAmount(course.priceUsd, currency);
      const intent = await this.stripe.paymentIntents.create(stryMutAct_9fa48("5488") ? {} : (stryCov_9fa48("5488"), {
        amount,
        currency: stryMutAct_9fa48("5489") ? currency.toUpperCase() : (stryCov_9fa48("5489"), currency.toLowerCase()),
        metadata: stryMutAct_9fa48("5490") ? {} : (stryCov_9fa48("5490"), {
          courseId,
          userId
        })
      }));
      return stryMutAct_9fa48("5491") ? {} : (stryCov_9fa48("5491"), {
        clientSecret: intent.client_secret,
        amount,
        currency,
        courseId
      });
    }
  }
  async getPriceInCurrency(courseId: string, currency: SupportedCurrency) {
    if (stryMutAct_9fa48("5492")) {
      {}
    } else {
      stryCov_9fa48("5492");
      const course = await this.courseRepo.findOne(stryMutAct_9fa48("5493") ? {} : (stryCov_9fa48("5493"), {
        where: stryMutAct_9fa48("5494") ? {} : (stryCov_9fa48("5494"), {
          id: courseId
        })
      }));
      if (stryMutAct_9fa48("5497") ? false : stryMutAct_9fa48("5496") ? true : stryMutAct_9fa48("5495") ? course : (stryCov_9fa48("5495", "5496", "5497"), !course)) throw new NotFoundException(stryMutAct_9fa48("5498") ? "" : (stryCov_9fa48("5498"), 'Course not found'));
      const priceUsd = stryMutAct_9fa48("5499") ? course.priceUsd && 0 : (stryCov_9fa48("5499"), course.priceUsd ?? 0);
      const converted = (stryMutAct_9fa48("5503") ? priceUsd <= 0 : stryMutAct_9fa48("5502") ? priceUsd >= 0 : stryMutAct_9fa48("5501") ? false : stryMutAct_9fa48("5500") ? true : (stryCov_9fa48("5500", "5501", "5502", "5503"), priceUsd > 0)) ? await this.currencyConversion.convert(priceUsd, currency) : 0;
      return stryMutAct_9fa48("5504") ? {} : (stryCov_9fa48("5504"), {
        courseId,
        priceUsd,
        currency,
        price: converted
      });
    }
  }
  async handleWebhook(signature: string, payload: Buffer) {
    if (stryMutAct_9fa48("5505")) {
      {}
    } else {
      stryCov_9fa48("5505");
      const webhookSecret = this.configService.get<string>(stryMutAct_9fa48("5506") ? "" : (stryCov_9fa48("5506"), 'stripe.webhookSecret'))!;
      let event: Stripe.Event;
      try {
        if (stryMutAct_9fa48("5507")) {
          {}
        } else {
          stryCov_9fa48("5507");
          event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
      } catch (err) {
        if (stryMutAct_9fa48("5508")) {
          {}
        } else {
          stryCov_9fa48("5508");
          this.logger.error(stryMutAct_9fa48("5509") ? `` : (stryCov_9fa48("5509"), `Webhook signature verification failed: ${err.message}`));
          throw new BadRequestException(stryMutAct_9fa48("5510") ? `` : (stryCov_9fa48("5510"), `Webhook Error: ${err.message}`));
        }
      }
      if (stryMutAct_9fa48("5513") ? event.type !== 'payment_intent.succeeded' : stryMutAct_9fa48("5512") ? false : stryMutAct_9fa48("5511") ? true : (stryCov_9fa48("5511", "5512", "5513"), event.type === (stryMutAct_9fa48("5514") ? "" : (stryCov_9fa48("5514"), 'payment_intent.succeeded')))) {
        if (stryMutAct_9fa48("5515")) {
          {}
        } else {
          stryCov_9fa48("5515");
          const intent = event.data.object as Stripe.PaymentIntent;
          this.logger.log(stryMutAct_9fa48("5516") ? `` : (stryCov_9fa48("5516"), `Payment succeeded for course ${intent.metadata.courseId} by user ${intent.metadata.userId}`));
          // Enrollment logic can be triggered here via EventEmitter
        }
      }
    }
  }
}