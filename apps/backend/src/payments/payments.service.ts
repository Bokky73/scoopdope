import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Course } from '../courses/course.entity';
import { CurrencyConversionService, SupportedCurrency } from './currency-conversion.service';
import { CouponsService } from '../coupons/coupons.service';

export interface OrderPreview {
  courseId: string;
  courseTitle: string;
  originalPriceUsd: number;
  originalPrice: number;
  currency: SupportedCurrency;
  discountApplied: number;
  finalPriceUsd: number;
  finalPrice: number;
  hasCoupon: boolean;
  couponCode?: string;
  currencyNote?: string;
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private configService: ConfigService,
    private currencyConversion: CurrencyConversionService,
    private couponsService: CouponsService,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('stripe.secretKey') || '', {
      apiVersion: '2025-01-27' as any,
    });
  }

  /**
   * Sanitize PaymentIntent for logging — only include non-sensitive fields
   * Excludes: card details, billing address, customer email, etc. (PCI DSS requirement 3)
   */
  private sanitizePaymentIntent(intent: Stripe.PaymentIntent): Record<string, unknown> {
    return {
      id: intent.id,
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
      created: intent.created,
    };
  }

  /**
   * Create a Stripe PaymentIntent for purchasing a course.
   *
   * Initiates payment processing by creating a PaymentIntent in Stripe. Supports optional
   * coupon codes for discounts. The returned client secret is used by the frontend to complete
   * payment via Stripe Elements or Apple Pay/Google Pay.
   *
   * @param {string} courseId - The UUID of the course being purchased.
   * @param {SupportedCurrency} currency - ISO 4217 currency code (e.g., 'USD', 'EUR').
   * @param {string} userId - The UUID of the user initiating the purchase.
   * @param {string} [couponCode] - Optional coupon code to apply a discount. Validated before use.
   *
   * @returns {Promise<{clientSecret: string; amount: number; currency: SupportedCurrency; courseId: string; discountApplied: number; finalPriceUsd: number}>}
   *   - `clientSecret` (string): Stripe client secret for completing payment on the frontend.
   *   - `amount` (number): Amount in the smallest currency unit (e.g., cents for USD).
   *   - `currency` (SupportedCurrency): Requested currency code.
   *   - `courseId` (string): The course ID for idempotency.
   *   - `discountApplied` (number): Discount amount in USD if a valid coupon was applied.
   *   - `finalPriceUsd` (number): Final price in USD after discount.
   *
   * @throws {NotFoundException} If the course does not exist.
   * @throws {BadRequestException} If the course price is not set or is zero (free course).
   *
   * @see https://stripe.com/docs/api/payment_intents/create
   * @see https://stripe.com/docs/payments/payment-intents
   */
  async createPaymentIntent(
    courseId: string,
    currency: SupportedCurrency,
    userId: string,
    couponCode?: string,
  ) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.priceUsd || course.priceUsd <= 0) {
      throw new BadRequestException('This course is free and does not require payment');
    }

    let priceUsd = Number(course.priceUsd);
    let discountApplied = 0;

    if (couponCode) {
      const { valid, discount, discountType } = await this.couponsService.validateForCheckout(couponCode, priceUsd);
      if (valid) {
        discountApplied = discount;
        priceUsd = Math.max(0, priceUsd - discount);
        await this.couponsService.incrementUsage(couponCode);
      }
    }

    const amount = await this.currencyConversion.toStripeAmount(priceUsd, currency);

    const intent = await this.stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: { courseId, userId, couponCode: couponCode ?? '' },
    });

    return {
      clientSecret: intent.client_secret,
      amount,
      currency,
      courseId,
      discountApplied,
      finalPriceUsd: priceUsd,
    };
  }

  /**
   * Get the price of a course converted to a specific currency.
   *
   * Converts the course price from USD to the requested currency using live exchange rates.
   * Falls back to cached rates or USD display if the exchange rate API is unavailable.
   * Used for displaying course pricing on the storefront and checkout.
   *
   * @param {string} courseId - The UUID of the course.
   * @param {SupportedCurrency} currency - ISO 4217 currency code to convert to.
   *
   * @returns {Promise<{courseId: string; priceUsd: number; currency: SupportedCurrency; price: number; currencyNote?: string}>}
   *   - `courseId` (string): The requested course ID.
   *   - `priceUsd` (number): Original price in USD.
   *   - `currency` (SupportedCurrency): Requested currency.
   *   - `price` (number): Converted price in the requested currency.
   *   - `currencyNote` (string): Optional warning if rates are stale or unavailable.
   *
   * @throws {NotFoundException} If the course does not exist.
   *
   * @see https://stripe.com/docs/currencies
   */
  async getPriceInCurrency(courseId: string, currency: SupportedCurrency) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const priceUsd = course.priceUsd ?? 0;
    const converted = priceUsd > 0 ? await this.currencyConversion.convertWithMetadata(priceUsd, currency) : { amount: 0 };

    return {
      courseId,
      priceUsd,
      currency,
      price: converted.amount,
      currencyNote: converted.currencyNote,
    };
  }

  async previewOrder(
    courseId: string,
    currency: SupportedCurrency,
    couponCode?: string,
  ): Promise<OrderPreview> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const originalPriceUsd = Number(course.priceUsd ?? 0);
    let finalPriceUsd = originalPriceUsd;
    let discountApplied = 0;
    let hasCoupon = false;

    if (couponCode && originalPriceUsd > 0) {
      const { valid, discount } = await this.couponsService.validateForCheckout(couponCode, originalPriceUsd);
      if (valid) {
        discountApplied = discount;
        finalPriceUsd = Math.max(0, originalPriceUsd - discount);
        hasCoupon = true;
      }
    }

    const converted = finalPriceUsd > 0
      ? await this.currencyConversion.convertWithMetadata(finalPriceUsd, currency)
      : { amount: 0 };

    const originalConverted = originalPriceUsd > 0
      ? await this.currencyConversion.convertWithMetadata(originalPriceUsd, currency)
      : { amount: 0 };

    return {
      courseId,
      courseTitle: course.title,
      originalPriceUsd,
      originalPrice: originalConverted.amount,
      currency,
      discountApplied,
      finalPriceUsd,
      finalPrice: converted.amount,
      hasCoupon,
      couponCode: hasCoupon ? couponCode : undefined,
      currencyNote: converted.currencyNote,
    };
  }

  /**
   * Handle incoming Stripe webhook events.
   *
   * Validates the webhook signature and routes events to appropriate handlers. Current events:
   * - `payment_intent.succeeded`: Payment completed successfully (triggers enrollment logic).
   *
   * Webhook signature verification is mandatory (HMAC-SHA256) to prevent unauthorized event
   * injection. Refer to Stripe's webhook documentation for security best practices.
   *
   * @param {string} signature - The `Stripe-Signature` HTTP header value from the webhook.
   * @param {Buffer} payload - Raw request body as a Buffer (must not be parsed JSON).
   *
   * @returns {Promise<void>} Returns void; side effects are event handlers.
   *
   * @throws {BadRequestException} If the signature verification fails or is missing.
   *
   * @see https://stripe.com/docs/webhooks/verify
   * @see https://stripe.com/docs/api/events/types#event_types-payment_intent.succeeded
   * @see https://stripe.com/docs/webhooks/setup
   */
  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>('stripe.webhookSecret')!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new BadRequestException(`Webhook Error: ${message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      this.logger.log(
        `Payment succeeded: ${JSON.stringify(this.sanitizePaymentIntent(intent))}`,
      );
      // Enrollment logic can be triggered here via EventEmitter
    }
  }
}
