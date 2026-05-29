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
import { Controller, Post, Get, Body, Param, Headers, RawBodyRequest, Req, UseGuards, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaymentsService } from './payments.service';
import { CurrencyConversionService, SUPPORTED_CURRENCIES, SupportedCurrency } from './currency-conversion.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
@ApiTags('payments')
@Controller('v1/payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService, private currencyConversion: CurrencyConversionService) {}
  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a Stripe PaymentIntent for a course purchase'
  })
  createPaymentIntent(@Body()
  dto: CreatePaymentIntentDto, @CurrentUser()
  user: {
    id: string;
  }) {
    if (stryMutAct_9fa48("5456")) {
      {}
    } else {
      stryCov_9fa48("5456");
      return this.paymentsService.createPaymentIntent(dto.courseId, dto.currency, user.id);
    }
  }
  @Get('price/:courseId')
  @ApiOperation({
    summary: 'Get course price in a specific currency'
  })
  getPrice(@Param('courseId')
  courseId: string, @Headers('accept-language')
  acceptLanguage: string) {
    if (stryMutAct_9fa48("5457")) {
      {}
    } else {
      stryCov_9fa48("5457");
      const currency = this.currencyConversion.detectCurrencyFromLocale(stryMutAct_9fa48("5458") ? acceptLanguage && 'en-US' : (stryCov_9fa48("5458"), acceptLanguage ?? (stryMutAct_9fa48("5459") ? "" : (stryCov_9fa48("5459"), 'en-US'))));
      return this.paymentsService.getPriceInCurrency(courseId, currency);
    }
  }
  @Get('currencies')
  @ApiOperation({
    summary: 'List supported currencies'
  })
  getSupportedCurrencies() {
    if (stryMutAct_9fa48("5460")) {
      {}
    } else {
      stryCov_9fa48("5460");
      return stryMutAct_9fa48("5461") ? {} : (stryCov_9fa48("5461"), {
        currencies: SUPPORTED_CURRENCIES
      });
    }
  }
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Stripe webhook endpoint'
  })
  async handleWebhook(@Headers('stripe-signature')
  signature: string, @Req()
  req: RawBodyRequest<Request>) {
    if (stryMutAct_9fa48("5462")) {
      {}
    } else {
      stryCov_9fa48("5462");
      await this.paymentsService.handleWebhook(signature, req.rawBody!);
      return stryMutAct_9fa48("5463") ? {} : (stryCov_9fa48("5463"), {
        received: stryMutAct_9fa48("5464") ? false : (stryCov_9fa48("5464"), true)
      });
    }
  }
}