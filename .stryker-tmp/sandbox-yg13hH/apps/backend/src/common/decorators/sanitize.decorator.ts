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
import { Transform } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content, removing all tags
 */
export function SanitizeHtml() {
  if (stryMutAct_9fa48("1817")) {
    {}
  } else {
    stryCov_9fa48("1817");
    return Transform(({
      value
    }) => {
      if (stryMutAct_9fa48("1818")) {
        {}
      } else {
        stryCov_9fa48("1818");
        if (stryMutAct_9fa48("1821") ? typeof value === 'string' : stryMutAct_9fa48("1820") ? false : stryMutAct_9fa48("1819") ? true : (stryCov_9fa48("1819", "1820", "1821"), typeof value !== (stryMutAct_9fa48("1822") ? "" : (stryCov_9fa48("1822"), 'string')))) {
          if (stryMutAct_9fa48("1823")) {
            {}
          } else {
            stryCov_9fa48("1823");
            return value;
          }
        }
        return sanitizeHtml(value, stryMutAct_9fa48("1824") ? {} : (stryCov_9fa48("1824"), {
          allowedTags: stryMutAct_9fa48("1825") ? ["Stryker was here"] : (stryCov_9fa48("1825"), []),
          allowedAttributes: {}
        }));
      }
    });
  }
}

/**
 * Trim whitespace from string
 */
export function TrimString() {
  if (stryMutAct_9fa48("1826")) {
    {}
  } else {
    stryCov_9fa48("1826");
    return Transform(({
      value
    }) => {
      if (stryMutAct_9fa48("1827")) {
        {}
      } else {
        stryCov_9fa48("1827");
        if (stryMutAct_9fa48("1830") ? typeof value !== 'string' : stryMutAct_9fa48("1829") ? false : stryMutAct_9fa48("1828") ? true : (stryCov_9fa48("1828", "1829", "1830"), typeof value === (stryMutAct_9fa48("1831") ? "" : (stryCov_9fa48("1831"), 'string')))) {
          if (stryMutAct_9fa48("1832")) {
            {}
          } else {
            stryCov_9fa48("1832");
            return stryMutAct_9fa48("1833") ? value : (stryCov_9fa48("1833"), value.trim());
          }
        }
        return value;
      }
    });
  }
}

/**
 * Remove null bytes and control characters
 */
export function RemoveControlChars() {
  if (stryMutAct_9fa48("1834")) {
    {}
  } else {
    stryCov_9fa48("1834");
    return Transform(({
      value
    }) => {
      if (stryMutAct_9fa48("1835")) {
        {}
      } else {
        stryCov_9fa48("1835");
        if (stryMutAct_9fa48("1838") ? typeof value === 'string' : stryMutAct_9fa48("1837") ? false : stryMutAct_9fa48("1836") ? true : (stryCov_9fa48("1836", "1837", "1838"), typeof value !== (stryMutAct_9fa48("1839") ? "" : (stryCov_9fa48("1839"), 'string')))) {
          if (stryMutAct_9fa48("1840")) {
            {}
          } else {
            stryCov_9fa48("1840");
            return value;
          }
        }
        // Remove null bytes and other control characters
        return value.replace(stryMutAct_9fa48("1841") ? /[^\x00-\x1F\x7F]/g : (stryCov_9fa48("1841"), /[\x00-\x1F\x7F]/g), stryMutAct_9fa48("1842") ? "Stryker was here!" : (stryCov_9fa48("1842"), ''));
      }
    });
  }
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function SanitizeUrl() {
  if (stryMutAct_9fa48("1843")) {
    {}
  } else {
    stryCov_9fa48("1843");
    return Transform(({
      value
    }) => {
      if (stryMutAct_9fa48("1844")) {
        {}
      } else {
        stryCov_9fa48("1844");
        if (stryMutAct_9fa48("1847") ? typeof value === 'string' : stryMutAct_9fa48("1846") ? false : stryMutAct_9fa48("1845") ? true : (stryCov_9fa48("1845", "1846", "1847"), typeof value !== (stryMutAct_9fa48("1848") ? "" : (stryCov_9fa48("1848"), 'string')))) {
          if (stryMutAct_9fa48("1849")) {
            {}
          } else {
            stryCov_9fa48("1849");
            return value;
          }
        }
        try {
          if (stryMutAct_9fa48("1850")) {
            {}
          } else {
            stryCov_9fa48("1850");
            const url = new URL(value);
            if (stryMutAct_9fa48("1853") ? false : stryMutAct_9fa48("1852") ? true : stryMutAct_9fa48("1851") ? ['http:', 'https:'].includes(url.protocol) : (stryCov_9fa48("1851", "1852", "1853"), !(stryMutAct_9fa48("1854") ? [] : (stryCov_9fa48("1854"), [stryMutAct_9fa48("1855") ? "" : (stryCov_9fa48("1855"), 'http:'), stryMutAct_9fa48("1856") ? "" : (stryCov_9fa48("1856"), 'https:')])).includes(url.protocol))) {
              if (stryMutAct_9fa48("1857")) {
                {}
              } else {
                stryCov_9fa48("1857");
                throw new Error(stryMutAct_9fa48("1858") ? "" : (stryCov_9fa48("1858"), 'Invalid protocol'));
              }
            }
            return value;
          }
        } catch {
          if (stryMutAct_9fa48("1859")) {
            {}
          } else {
            stryCov_9fa48("1859");
            throw new Error(stryMutAct_9fa48("1860") ? "" : (stryCov_9fa48("1860"), 'Invalid URL'));
          }
        }
      }
    });
  }
}

/**
 * Sanitize email address
 */
export function SanitizeEmail() {
  if (stryMutAct_9fa48("1861")) {
    {}
  } else {
    stryCov_9fa48("1861");
    return Transform(({
      value
    }) => {
      if (stryMutAct_9fa48("1862")) {
        {}
      } else {
        stryCov_9fa48("1862");
        if (stryMutAct_9fa48("1865") ? typeof value === 'string' : stryMutAct_9fa48("1864") ? false : stryMutAct_9fa48("1863") ? true : (stryCov_9fa48("1863", "1864", "1865"), typeof value !== (stryMutAct_9fa48("1866") ? "" : (stryCov_9fa48("1866"), 'string')))) {
          if (stryMutAct_9fa48("1867")) {
            {}
          } else {
            stryCov_9fa48("1867");
            return value;
          }
        }
        // Basic email sanitization - lowercase and trim
        return stryMutAct_9fa48("1869") ? value.toUpperCase().trim() : stryMutAct_9fa48("1868") ? value.toLowerCase() : (stryCov_9fa48("1868", "1869"), value.toLowerCase().trim());
      }
    });
  }
}