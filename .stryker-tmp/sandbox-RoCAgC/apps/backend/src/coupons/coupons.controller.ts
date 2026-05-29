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
import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, ValidateCouponDto, BulkGenerateCouponDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
@Controller('v1/coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body()
  dto: CreateCouponDto) {
    if (stryMutAct_9fa48("2249")) {
      {}
    } else {
      stryCov_9fa48("2249");
      return this.couponsService.create(dto);
    }
  }
  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  generateBulk(@Body()
  dto: BulkGenerateCouponDto) {
    if (stryMutAct_9fa48("2250")) {
      {}
    } else {
      stryCov_9fa48("2250");
      return this.couponsService.generateBulk(dto.prefix, dto.count, dto.discountType, dto.discountValue, dto.expiresAt ? new Date(dto.expiresAt) : undefined);
    }
  }
  @Post('validate')
  validate(@Body()
  dto: ValidateCouponDto) {
    if (stryMutAct_9fa48("2251")) {
      {}
    } else {
      stryCov_9fa48("2251");
      return this.couponsService.validate(dto);
    }
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    if (stryMutAct_9fa48("2252")) {
      {}
    } else {
      stryCov_9fa48("2252");
      return this.couponsService.findAll();
    }
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findById(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2253")) {
      {}
    } else {
      stryCov_9fa48("2253");
      return this.couponsService.findById(id);
    }
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id')
  id: string, @Body()
  dto: Partial<CreateCouponDto>) {
    if (stryMutAct_9fa48("2254")) {
      {}
    } else {
      stryCov_9fa48("2254");
      return this.couponsService.update(id, dto);
    }
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  delete(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2255")) {
      {}
    } else {
      stryCov_9fa48("2255");
      return this.couponsService.delete(id);
    }
  }
}