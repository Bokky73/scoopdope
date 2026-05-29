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
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { CreateCouponDto, ValidateCouponDto } from './dto';
@Injectable()
export class CouponsService {
  constructor(@InjectRepository(Coupon)
  private couponsRepository: Repository<Coupon>) {}
  async create(dto: CreateCouponDto): Promise<Coupon> {
    if (stryMutAct_9fa48("2256")) {
      {}
    } else {
      stryCov_9fa48("2256");
      const existing = await this.couponsRepository.findOne(stryMutAct_9fa48("2257") ? {} : (stryCov_9fa48("2257"), {
        where: stryMutAct_9fa48("2258") ? {} : (stryCov_9fa48("2258"), {
          code: dto.code
        })
      }));
      if (stryMutAct_9fa48("2260") ? false : stryMutAct_9fa48("2259") ? true : (stryCov_9fa48("2259", "2260"), existing)) {
        if (stryMutAct_9fa48("2261")) {
          {}
        } else {
          stryCov_9fa48("2261");
          throw new BadRequestException(stryMutAct_9fa48("2262") ? "" : (stryCov_9fa48("2262"), 'Coupon code already exists'));
        }
      }
      const coupon = this.couponsRepository.create(stryMutAct_9fa48("2263") ? {} : (stryCov_9fa48("2263"), {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null
      }));
      return this.couponsRepository.save(coupon);
    }
  }
  async generateBulk(prefix: string, count: number, discountType: 'percentage' | 'fixed', discountValue: number, expiresAt?: Date): Promise<Coupon[]> {
    if (stryMutAct_9fa48("2264")) {
      {}
    } else {
      stryCov_9fa48("2264");
      const coupons = stryMutAct_9fa48("2265") ? ["Stryker was here"] : (stryCov_9fa48("2265"), []);
      for (let i = 0; stryMutAct_9fa48("2268") ? i >= count : stryMutAct_9fa48("2267") ? i <= count : stryMutAct_9fa48("2266") ? false : (stryCov_9fa48("2266", "2267", "2268"), i < count); stryMutAct_9fa48("2269") ? i-- : (stryCov_9fa48("2269"), i++)) {
        if (stryMutAct_9fa48("2270")) {
          {}
        } else {
          stryCov_9fa48("2270");
          const code = stryMutAct_9fa48("2271") ? `` : (stryCov_9fa48("2271"), `${prefix}-${Date.now()}-${i}`);
          const coupon = this.couponsRepository.create(stryMutAct_9fa48("2272") ? {} : (stryCov_9fa48("2272"), {
            code,
            discountType,
            discountValue,
            expiresAt: stryMutAct_9fa48("2275") ? expiresAt && null : stryMutAct_9fa48("2274") ? false : stryMutAct_9fa48("2273") ? true : (stryCov_9fa48("2273", "2274", "2275"), expiresAt || null)
          }));
          coupons.push(coupon);
        }
      }
      return this.couponsRepository.save(coupons);
    }
  }
  async validate(dto: ValidateCouponDto): Promise<{
    valid: boolean;
    discount: number;
  }> {
    if (stryMutAct_9fa48("2276")) {
      {}
    } else {
      stryCov_9fa48("2276");
      const coupon = await this.couponsRepository.findOne(stryMutAct_9fa48("2277") ? {} : (stryCov_9fa48("2277"), {
        where: stryMutAct_9fa48("2278") ? {} : (stryCov_9fa48("2278"), {
          code: dto.code
        })
      }));
      if (stryMutAct_9fa48("2281") ? false : stryMutAct_9fa48("2280") ? true : stryMutAct_9fa48("2279") ? coupon : (stryCov_9fa48("2279", "2280", "2281"), !coupon)) {
        if (stryMutAct_9fa48("2282")) {
          {}
        } else {
          stryCov_9fa48("2282");
          throw new NotFoundException(stryMutAct_9fa48("2283") ? "" : (stryCov_9fa48("2283"), 'Coupon not found'));
        }
      }
      if (stryMutAct_9fa48("2286") ? false : stryMutAct_9fa48("2285") ? true : stryMutAct_9fa48("2284") ? coupon.isActive : (stryCov_9fa48("2284", "2285", "2286"), !coupon.isActive)) {
        if (stryMutAct_9fa48("2287")) {
          {}
        } else {
          stryCov_9fa48("2287");
          throw new BadRequestException(stryMutAct_9fa48("2288") ? "" : (stryCov_9fa48("2288"), 'Coupon is inactive'));
        }
      }
      if (stryMutAct_9fa48("2291") ? coupon.expiresAt || new Date() > coupon.expiresAt : stryMutAct_9fa48("2290") ? false : stryMutAct_9fa48("2289") ? true : (stryCov_9fa48("2289", "2290", "2291"), coupon.expiresAt && (stryMutAct_9fa48("2294") ? new Date() <= coupon.expiresAt : stryMutAct_9fa48("2293") ? new Date() >= coupon.expiresAt : stryMutAct_9fa48("2292") ? true : (stryCov_9fa48("2292", "2293", "2294"), new Date() > coupon.expiresAt)))) {
        if (stryMutAct_9fa48("2295")) {
          {}
        } else {
          stryCov_9fa48("2295");
          throw new BadRequestException(stryMutAct_9fa48("2296") ? "" : (stryCov_9fa48("2296"), 'Coupon has expired'));
        }
      }
      if (stryMutAct_9fa48("2299") ? coupon.maxUsage || coupon.usageCount >= coupon.maxUsage : stryMutAct_9fa48("2298") ? false : stryMutAct_9fa48("2297") ? true : (stryCov_9fa48("2297", "2298", "2299"), coupon.maxUsage && (stryMutAct_9fa48("2302") ? coupon.usageCount < coupon.maxUsage : stryMutAct_9fa48("2301") ? coupon.usageCount > coupon.maxUsage : stryMutAct_9fa48("2300") ? true : (stryCov_9fa48("2300", "2301", "2302"), coupon.usageCount >= coupon.maxUsage)))) {
        if (stryMutAct_9fa48("2303")) {
          {}
        } else {
          stryCov_9fa48("2303");
          throw new BadRequestException(stryMutAct_9fa48("2304") ? "" : (stryCov_9fa48("2304"), 'Coupon usage limit reached'));
        }
      }
      return stryMutAct_9fa48("2305") ? {} : (stryCov_9fa48("2305"), {
        valid: stryMutAct_9fa48("2306") ? false : (stryCov_9fa48("2306"), true),
        discount: Number(coupon.discountValue)
      });
    }
  }
  async incrementUsage(code: string): Promise<void> {
    if (stryMutAct_9fa48("2307")) {
      {}
    } else {
      stryCov_9fa48("2307");
      await this.couponsRepository.increment(stryMutAct_9fa48("2308") ? {} : (stryCov_9fa48("2308"), {
        code
      }), stryMutAct_9fa48("2309") ? "" : (stryCov_9fa48("2309"), 'usageCount'), 1);
    }
  }
  async findAll(): Promise<Coupon[]> {
    if (stryMutAct_9fa48("2310")) {
      {}
    } else {
      stryCov_9fa48("2310");
      return this.couponsRepository.find();
    }
  }
  async findById(id: string): Promise<Coupon> {
    if (stryMutAct_9fa48("2311")) {
      {}
    } else {
      stryCov_9fa48("2311");
      const coupon = await this.couponsRepository.findOne(stryMutAct_9fa48("2312") ? {} : (stryCov_9fa48("2312"), {
        where: stryMutAct_9fa48("2313") ? {} : (stryCov_9fa48("2313"), {
          id
        })
      }));
      if (stryMutAct_9fa48("2316") ? false : stryMutAct_9fa48("2315") ? true : stryMutAct_9fa48("2314") ? coupon : (stryCov_9fa48("2314", "2315", "2316"), !coupon)) {
        if (stryMutAct_9fa48("2317")) {
          {}
        } else {
          stryCov_9fa48("2317");
          throw new NotFoundException(stryMutAct_9fa48("2318") ? "" : (stryCov_9fa48("2318"), 'Coupon not found'));
        }
      }
      return coupon;
    }
  }
  async update(id: string, dto: Partial<CreateCouponDto>): Promise<Coupon> {
    if (stryMutAct_9fa48("2319")) {
      {}
    } else {
      stryCov_9fa48("2319");
      const coupon = await this.findById(id);
      Object.assign(coupon, dto);
      return this.couponsRepository.save(coupon);
    }
  }
  async delete(id: string): Promise<void> {
    if (stryMutAct_9fa48("2320")) {
      {}
    } else {
      stryCov_9fa48("2320");
      const result = await this.couponsRepository.delete(id);
      if (stryMutAct_9fa48("2323") ? result.affected !== 0 : stryMutAct_9fa48("2322") ? false : stryMutAct_9fa48("2321") ? true : (stryCov_9fa48("2321", "2322", "2323"), result.affected === 0)) {
        if (stryMutAct_9fa48("2324")) {
          {}
        } else {
          stryCov_9fa48("2324");
          throw new NotFoundException(stryMutAct_9fa48("2325") ? "" : (stryCov_9fa48("2325"), 'Coupon not found'));
        }
      }
    }
  }
}