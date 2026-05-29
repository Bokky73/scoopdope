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
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'INR', 'BRL', 'CAD', 'AUD'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);
  private readonly apiKey: string;
  private ratesCache: {
    rates: Record<string, number>;
    fetchedAt: number;
  } | null = null;
  private readonly cacheTtlMs = stryMutAct_9fa48("5380") ? 60 * 60 / 1000 : (stryCov_9fa48("5380"), (stryMutAct_9fa48("5381") ? 60 / 60 : (stryCov_9fa48("5381"), 60 * 60)) * 1000); // 1 hour

  constructor(private configService: ConfigService) {
    if (stryMutAct_9fa48("5382")) {
      {}
    } else {
      stryCov_9fa48("5382");
      this.apiKey = stryMutAct_9fa48("5385") ? this.configService.get<string>('exchangeRate.apiKey') && '' : stryMutAct_9fa48("5384") ? false : stryMutAct_9fa48("5383") ? true : (stryCov_9fa48("5383", "5384", "5385"), this.configService.get<string>(stryMutAct_9fa48("5386") ? "" : (stryCov_9fa48("5386"), 'exchangeRate.apiKey')) || (stryMutAct_9fa48("5387") ? "Stryker was here!" : (stryCov_9fa48("5387"), '')));
    }
  }
  async getRates(base: SupportedCurrency = stryMutAct_9fa48("5388") ? "" : (stryCov_9fa48("5388"), 'USD')): Promise<Record<string, number>> {
    if (stryMutAct_9fa48("5389")) {
      {}
    } else {
      stryCov_9fa48("5389");
      const now = Date.now();
      if (stryMutAct_9fa48("5392") ? this.ratesCache || now - this.ratesCache.fetchedAt < this.cacheTtlMs : stryMutAct_9fa48("5391") ? false : stryMutAct_9fa48("5390") ? true : (stryCov_9fa48("5390", "5391", "5392"), this.ratesCache && (stryMutAct_9fa48("5395") ? now - this.ratesCache.fetchedAt >= this.cacheTtlMs : stryMutAct_9fa48("5394") ? now - this.ratesCache.fetchedAt <= this.cacheTtlMs : stryMutAct_9fa48("5393") ? true : (stryCov_9fa48("5393", "5394", "5395"), (stryMutAct_9fa48("5396") ? now + this.ratesCache.fetchedAt : (stryCov_9fa48("5396"), now - this.ratesCache.fetchedAt)) < this.cacheTtlMs)))) {
        if (stryMutAct_9fa48("5397")) {
          {}
        } else {
          stryCov_9fa48("5397");
          return this.ratesCache.rates;
        }
      }
      try {
        if (stryMutAct_9fa48("5398")) {
          {}
        } else {
          stryCov_9fa48("5398");
          const url = this.apiKey ? stryMutAct_9fa48("5399") ? `` : (stryCov_9fa48("5399"), `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${base}`) : stryMutAct_9fa48("5400") ? `` : (stryCov_9fa48("5400"), `https://open.er-api.com/v6/latest/${base}`);
          const res = await fetch(url);
          if (stryMutAct_9fa48("5403") ? false : stryMutAct_9fa48("5402") ? true : stryMutAct_9fa48("5401") ? res.ok : (stryCov_9fa48("5401", "5402", "5403"), !res.ok)) throw new Error(stryMutAct_9fa48("5404") ? `` : (stryCov_9fa48("5404"), `Exchange rate API error: ${res.status}`));
          const data = await res.json();
          const rates: Record<string, number> = stryMutAct_9fa48("5405") ? data.rates && data.conversion_rates : (stryCov_9fa48("5405"), data.rates ?? data.conversion_rates);
          this.ratesCache = stryMutAct_9fa48("5406") ? {} : (stryCov_9fa48("5406"), {
            rates,
            fetchedAt: now
          });
          return rates;
        }
      } catch (err) {
        if (stryMutAct_9fa48("5407")) {
          {}
        } else {
          stryCov_9fa48("5407");
          this.logger.error(stryMutAct_9fa48("5408") ? `` : (stryCov_9fa48("5408"), `Failed to fetch exchange rates: ${err.message}`));
          // Return cached rates if available, even if stale
          if (stryMutAct_9fa48("5410") ? false : stryMutAct_9fa48("5409") ? true : (stryCov_9fa48("5409", "5410"), this.ratesCache)) return this.ratesCache.rates;
          throw err;
        }
      }
    }
  }
  async convert(amountInUsd: number, targetCurrency: SupportedCurrency): Promise<number> {
    if (stryMutAct_9fa48("5411")) {
      {}
    } else {
      stryCov_9fa48("5411");
      if (stryMutAct_9fa48("5414") ? targetCurrency !== 'USD' : stryMutAct_9fa48("5413") ? false : stryMutAct_9fa48("5412") ? true : (stryCov_9fa48("5412", "5413", "5414"), targetCurrency === (stryMutAct_9fa48("5415") ? "" : (stryCov_9fa48("5415"), 'USD')))) return amountInUsd;
      const rates = await this.getRates(stryMutAct_9fa48("5416") ? "" : (stryCov_9fa48("5416"), 'USD'));
      const rate = rates[targetCurrency];
      if (stryMutAct_9fa48("5419") ? false : stryMutAct_9fa48("5418") ? true : stryMutAct_9fa48("5417") ? rate : (stryCov_9fa48("5417", "5418", "5419"), !rate)) throw new Error(stryMutAct_9fa48("5420") ? `` : (stryCov_9fa48("5420"), `Unsupported currency: ${targetCurrency}`));
      return stryMutAct_9fa48("5421") ? Math.round(amountInUsd * rate * 100) * 100 : (stryCov_9fa48("5421"), Math.round(stryMutAct_9fa48("5422") ? amountInUsd * rate / 100 : (stryCov_9fa48("5422"), (stryMutAct_9fa48("5423") ? amountInUsd / rate : (stryCov_9fa48("5423"), amountInUsd * rate)) * 100)) / 100);
    }
  }

  /** Returns amount in smallest currency unit (e.g. cents) for Stripe */
  async toStripeAmount(amountInUsd: number, targetCurrency: SupportedCurrency): Promise<number> {
    if (stryMutAct_9fa48("5424")) {
      {}
    } else {
      stryCov_9fa48("5424");
      const converted = await this.convert(amountInUsd, targetCurrency);
      // Zero-decimal currencies
      const zeroDecimal = stryMutAct_9fa48("5425") ? [] : (stryCov_9fa48("5425"), [stryMutAct_9fa48("5426") ? "" : (stryCov_9fa48("5426"), 'KES'), stryMutAct_9fa48("5427") ? "" : (stryCov_9fa48("5427"), 'NGN'), stryMutAct_9fa48("5428") ? "" : (stryCov_9fa48("5428"), 'GHS')]);
      return zeroDecimal.includes(targetCurrency) ? Math.round(converted) : Math.round(stryMutAct_9fa48("5429") ? converted / 100 : (stryCov_9fa48("5429"), converted * 100));
    }
  }

  /** Detect currency from Accept-Language or locale header */
  detectCurrencyFromLocale(locale: string): SupportedCurrency {
    if (stryMutAct_9fa48("5430")) {
      {}
    } else {
      stryCov_9fa48("5430");
      const map: Record<string, SupportedCurrency> = stryMutAct_9fa48("5431") ? {} : (stryCov_9fa48("5431"), {
        'en-US': stryMutAct_9fa48("5432") ? "" : (stryCov_9fa48("5432"), 'USD'),
        'en-CA': stryMutAct_9fa48("5433") ? "" : (stryCov_9fa48("5433"), 'CAD'),
        'en-AU': stryMutAct_9fa48("5434") ? "" : (stryCov_9fa48("5434"), 'AUD'),
        'en-GB': stryMutAct_9fa48("5435") ? "" : (stryCov_9fa48("5435"), 'GBP'),
        'en-NG': stryMutAct_9fa48("5436") ? "" : (stryCov_9fa48("5436"), 'NGN'),
        'en-KE': stryMutAct_9fa48("5437") ? "" : (stryCov_9fa48("5437"), 'KES'),
        'en-GH': stryMutAct_9fa48("5438") ? "" : (stryCov_9fa48("5438"), 'GHS'),
        'en-ZA': stryMutAct_9fa48("5439") ? "" : (stryCov_9fa48("5439"), 'ZAR'),
        'en-IN': stryMutAct_9fa48("5440") ? "" : (stryCov_9fa48("5440"), 'INR'),
        'pt-BR': stryMutAct_9fa48("5441") ? "" : (stryCov_9fa48("5441"), 'BRL'),
        'de': stryMutAct_9fa48("5442") ? "" : (stryCov_9fa48("5442"), 'EUR'),
        'fr': stryMutAct_9fa48("5443") ? "" : (stryCov_9fa48("5443"), 'EUR'),
        'es': stryMutAct_9fa48("5444") ? "" : (stryCov_9fa48("5444"), 'EUR'),
        'it': stryMutAct_9fa48("5445") ? "" : (stryCov_9fa48("5445"), 'EUR'),
        'nl': stryMutAct_9fa48("5446") ? "" : (stryCov_9fa48("5446"), 'EUR')
      });
      const normalized = stryMutAct_9fa48("5449") ? locale.split(',')[0]?.trim() : stryMutAct_9fa48("5448") ? locale?.split(',')[0].trim() : stryMutAct_9fa48("5447") ? locale?.split(',')[0] : (stryCov_9fa48("5447", "5448", "5449"), locale?.split(stryMutAct_9fa48("5450") ? "" : (stryCov_9fa48("5450"), ','))[0]?.trim());
      return stryMutAct_9fa48("5451") ? (map[normalized] ?? map[normalized?.split('-')[0]]) && 'USD' : (stryCov_9fa48("5451"), (stryMutAct_9fa48("5452") ? map[normalized] && map[normalized?.split('-')[0]] : (stryCov_9fa48("5452"), map[normalized] ?? map[stryMutAct_9fa48("5453") ? normalized.split('-')[0] : (stryCov_9fa48("5453"), normalized?.split(stryMutAct_9fa48("5454") ? "" : (stryCov_9fa48("5454"), '-'))[0])])) ?? (stryMutAct_9fa48("5455") ? "" : (stryCov_9fa48("5455"), 'USD')));
    }
  }
}