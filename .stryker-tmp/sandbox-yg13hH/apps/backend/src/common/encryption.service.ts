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
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
@Injectable()
export class EncryptionService {
  private readonly algorithm = stryMutAct_9fa48("1870") ? "" : (stryCov_9fa48("1870"), 'aes-256-cbc');
  private readonly key: Buffer;
  constructor(private configService: ConfigService) {
    if (stryMutAct_9fa48("1871")) {
      {}
    } else {
      stryCov_9fa48("1871");
      const secret = stryMutAct_9fa48("1874") ? this.configService.get<string>('ENCRYPTION_KEY') && 'default-very-long-and-secure-secret-key-32-chars-long' : stryMutAct_9fa48("1873") ? false : stryMutAct_9fa48("1872") ? true : (stryCov_9fa48("1872", "1873", "1874"), this.configService.get<string>(stryMutAct_9fa48("1875") ? "" : (stryCov_9fa48("1875"), 'ENCRYPTION_KEY')) || (stryMutAct_9fa48("1876") ? "" : (stryCov_9fa48("1876"), 'default-very-long-and-secure-secret-key-32-chars-long')));
      this.key = crypto.scryptSync(secret, stryMutAct_9fa48("1877") ? "" : (stryCov_9fa48("1877"), 'salt'), 32);
    }
  }
  encrypt(text: string): string {
    if (stryMutAct_9fa48("1878")) {
      {}
    } else {
      stryCov_9fa48("1878");
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, stryMutAct_9fa48("1879") ? "" : (stryCov_9fa48("1879"), 'utf8'), stryMutAct_9fa48("1880") ? "" : (stryCov_9fa48("1880"), 'hex'));
      stryMutAct_9fa48("1881") ? encrypted -= cipher.final('hex') : (stryCov_9fa48("1881"), encrypted += cipher.final(stryMutAct_9fa48("1882") ? "" : (stryCov_9fa48("1882"), 'hex')));
      return stryMutAct_9fa48("1883") ? `` : (stryCov_9fa48("1883"), `${iv.toString(stryMutAct_9fa48("1884") ? "" : (stryCov_9fa48("1884"), 'hex'))}:${encrypted}`);
    }
  }
  decrypt(encryptedText: string): string {
    if (stryMutAct_9fa48("1885")) {
      {}
    } else {
      stryCov_9fa48("1885");
      if (stryMutAct_9fa48("1888") ? false : stryMutAct_9fa48("1887") ? true : stryMutAct_9fa48("1886") ? encryptedText : (stryCov_9fa48("1886", "1887", "1888"), !encryptedText)) return stryMutAct_9fa48("1889") ? "Stryker was here!" : (stryCov_9fa48("1889"), '');
      try {
        if (stryMutAct_9fa48("1890")) {
          {}
        } else {
          stryCov_9fa48("1890");
          const [ivHex, dataHex] = encryptedText.split(stryMutAct_9fa48("1891") ? "" : (stryCov_9fa48("1891"), ':'));
          const iv = Buffer.from(ivHex, stryMutAct_9fa48("1892") ? "" : (stryCov_9fa48("1892"), 'hex'));
          const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
          let decrypted = decipher.update(dataHex, stryMutAct_9fa48("1893") ? "" : (stryCov_9fa48("1893"), 'hex'), stryMutAct_9fa48("1894") ? "" : (stryCov_9fa48("1894"), 'utf8'));
          stryMutAct_9fa48("1895") ? decrypted -= decipher.final('utf8') : (stryCov_9fa48("1895"), decrypted += decipher.final(stryMutAct_9fa48("1896") ? "" : (stryCov_9fa48("1896"), 'utf8')));
          return decrypted;
        }
      } catch (error) {
        if (stryMutAct_9fa48("1897")) {
          {}
        } else {
          stryCov_9fa48("1897");
          throw new Error(stryMutAct_9fa48("1898") ? "" : (stryCov_9fa48("1898"), 'Decryption failed'));
        }
      }
    }
  }
}