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
export default stryMutAct_9fa48("2051") ? () => undefined : (stryCov_9fa48("2051"), () => stryMutAct_9fa48("2052") ? {} : (stryCov_9fa48("2052"), {
  port: parseInt(stryMutAct_9fa48("2055") ? process.env.PORT && '3000' : stryMutAct_9fa48("2054") ? false : stryMutAct_9fa48("2053") ? true : (stryCov_9fa48("2053", "2054", "2055"), process.env.PORT || (stryMutAct_9fa48("2056") ? "" : (stryCov_9fa48("2056"), '3000'))), 10),
  nodeEnv: stryMutAct_9fa48("2059") ? process.env.NODE_ENV && 'development' : stryMutAct_9fa48("2058") ? false : stryMutAct_9fa48("2057") ? true : (stryCov_9fa48("2057", "2058", "2059"), process.env.NODE_ENV || (stryMutAct_9fa48("2060") ? "" : (stryCov_9fa48("2060"), 'development'))),
  database: stryMutAct_9fa48("2061") ? {} : (stryCov_9fa48("2061"), {
    host: process.env.DATABASE_HOST!,
    port: parseInt(stryMutAct_9fa48("2064") ? process.env.DATABASE_PORT && '5432' : stryMutAct_9fa48("2063") ? false : stryMutAct_9fa48("2062") ? true : (stryCov_9fa48("2062", "2063", "2064"), process.env.DATABASE_PORT || (stryMutAct_9fa48("2065") ? "" : (stryCov_9fa48("2065"), '5432'))), 10),
    username: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    name: process.env.DATABASE_NAME!
  }),
  jwt: stryMutAct_9fa48("2066") ? {} : (stryCov_9fa48("2066"), {
    secret: process.env.JWT_SECRET!
  }),
  redis: stryMutAct_9fa48("2067") ? {} : (stryCov_9fa48("2067"), {
    url: process.env.REDIS_URL!
  }),
  stellar: stryMutAct_9fa48("2068") ? {} : (stryCov_9fa48("2068"), {
    network: process.env.STELLAR_NETWORK as 'testnet' | 'mainnet',
    secretKey: process.env.STELLAR_SECRET_KEY!,
    sorobanRpcUrl: stryMutAct_9fa48("2071") ? process.env.SOROBAN_RPC_URL && 'https://soroban-testnet.stellar.org' : stryMutAct_9fa48("2070") ? false : stryMutAct_9fa48("2069") ? true : (stryCov_9fa48("2069", "2070", "2071"), process.env.SOROBAN_RPC_URL || (stryMutAct_9fa48("2072") ? "" : (stryCov_9fa48("2072"), 'https://soroban-testnet.stellar.org'))),
    contractId: stryMutAct_9fa48("2075") ? process.env.SOROBAN_CONTRACT_ID && '' : stryMutAct_9fa48("2074") ? false : stryMutAct_9fa48("2073") ? true : (stryCov_9fa48("2073", "2074", "2075"), process.env.SOROBAN_CONTRACT_ID || (stryMutAct_9fa48("2076") ? "Stryker was here!" : (stryCov_9fa48("2076"), ''))),
    analyticsContractId: stryMutAct_9fa48("2079") ? process.env.ANALYTICS_CONTRACT_ID && '' : stryMutAct_9fa48("2078") ? false : stryMutAct_9fa48("2077") ? true : (stryCov_9fa48("2077", "2078", "2079"), process.env.ANALYTICS_CONTRACT_ID || (stryMutAct_9fa48("2080") ? "Stryker was here!" : (stryCov_9fa48("2080"), ''))),
    credentialMetadataContractId: stryMutAct_9fa48("2083") ? process.env.CREDENTIAL_METADATA_CONTRACT_ID && '' : stryMutAct_9fa48("2082") ? false : stryMutAct_9fa48("2081") ? true : (stryCov_9fa48("2081", "2082", "2083"), process.env.CREDENTIAL_METADATA_CONTRACT_ID || (stryMutAct_9fa48("2084") ? "Stryker was here!" : (stryCov_9fa48("2084"), ''))),
    tokenContractId: stryMutAct_9fa48("2087") ? process.env.TOKEN_CONTRACT_ID && '' : stryMutAct_9fa48("2086") ? false : stryMutAct_9fa48("2085") ? true : (stryCov_9fa48("2085", "2086", "2087"), process.env.TOKEN_CONTRACT_ID || (stryMutAct_9fa48("2088") ? "Stryker was here!" : (stryCov_9fa48("2088"), ''))),
    indexerPollIntervalMs: parseInt(stryMutAct_9fa48("2091") ? process.env.INDEXER_POLL_INTERVAL_MS && '5000' : stryMutAct_9fa48("2090") ? false : stryMutAct_9fa48("2089") ? true : (stryCov_9fa48("2089", "2090", "2091"), process.env.INDEXER_POLL_INTERVAL_MS || (stryMutAct_9fa48("2092") ? "" : (stryCov_9fa48("2092"), '5000'))), 10),
    webAuthDomain: stryMutAct_9fa48("2095") ? process.env.STELLAR_WEB_AUTH_DOMAIN && 'localhost' : stryMutAct_9fa48("2094") ? false : stryMutAct_9fa48("2093") ? true : (stryCov_9fa48("2093", "2094", "2095"), process.env.STELLAR_WEB_AUTH_DOMAIN || (stryMutAct_9fa48("2096") ? "" : (stryCov_9fa48("2096"), 'localhost')))
  }),
  mail: stryMutAct_9fa48("2097") ? {} : (stryCov_9fa48("2097"), {
    host: process.env.EMAIL_HOST!,
    port: parseInt(stryMutAct_9fa48("2100") ? process.env.EMAIL_PORT && '587' : stryMutAct_9fa48("2099") ? false : stryMutAct_9fa48("2098") ? true : (stryCov_9fa48("2098", "2099", "2100"), process.env.EMAIL_PORT || (stryMutAct_9fa48("2101") ? "" : (stryCov_9fa48("2101"), '587'))), 10),
    secure: stryMutAct_9fa48("2104") ? process.env.EMAIL_SECURE !== 'true' : stryMutAct_9fa48("2103") ? false : stryMutAct_9fa48("2102") ? true : (stryCov_9fa48("2102", "2103", "2104"), process.env.EMAIL_SECURE === (stryMutAct_9fa48("2105") ? "" : (stryCov_9fa48("2105"), 'true'))),
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
    from: stryMutAct_9fa48("2108") ? process.env.EMAIL_FROM && '"Scoopdope" <no-reply@Scoopdope.app>' : stryMutAct_9fa48("2107") ? false : stryMutAct_9fa48("2106") ? true : (stryCov_9fa48("2106", "2107", "2108"), process.env.EMAIL_FROM || (stryMutAct_9fa48("2109") ? "" : (stryCov_9fa48("2109"), '"Scoopdope" <no-reply@Scoopdope.app>'))),
    enabled: stryMutAct_9fa48("2112") ? process.env.EMAIL_ENABLED !== 'true' : stryMutAct_9fa48("2111") ? false : stryMutAct_9fa48("2110") ? true : (stryCov_9fa48("2110", "2111", "2112"), process.env.EMAIL_ENABLED === (stryMutAct_9fa48("2113") ? "" : (stryCov_9fa48("2113"), 'true')))
  }),
  google: stryMutAct_9fa48("2114") ? {} : (stryCov_9fa48("2114"), {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: stryMutAct_9fa48("2117") ? process.env.GOOGLE_CALLBACK_URL && 'http://localhost:3000/auth/google/callback' : stryMutAct_9fa48("2116") ? false : stryMutAct_9fa48("2115") ? true : (stryCov_9fa48("2115", "2116", "2117"), process.env.GOOGLE_CALLBACK_URL || (stryMutAct_9fa48("2118") ? "" : (stryCov_9fa48("2118"), 'http://localhost:3000/auth/google/callback')))
  }),
  frontend: stryMutAct_9fa48("2119") ? {} : (stryCov_9fa48("2119"), {
    url: stryMutAct_9fa48("2122") ? process.env.FRONTEND_URL && 'http://localhost:3001' : stryMutAct_9fa48("2121") ? false : stryMutAct_9fa48("2120") ? true : (stryCov_9fa48("2120", "2121", "2122"), process.env.FRONTEND_URL || (stryMutAct_9fa48("2123") ? "" : (stryCov_9fa48("2123"), 'http://localhost:3001')))
  }),
  cors: stryMutAct_9fa48("2124") ? {} : (stryCov_9fa48("2124"), {
    origins: stryMutAct_9fa48("2127") ? process.env.CORS_ORIGINS?.split(',') && ['http://localhost:3001'] : stryMutAct_9fa48("2126") ? false : stryMutAct_9fa48("2125") ? true : (stryCov_9fa48("2125", "2126", "2127"), (stryMutAct_9fa48("2128") ? process.env.CORS_ORIGINS.split(',') : (stryCov_9fa48("2128"), process.env.CORS_ORIGINS?.split(stryMutAct_9fa48("2129") ? "" : (stryCov_9fa48("2129"), ',')))) || (stryMutAct_9fa48("2130") ? [] : (stryCov_9fa48("2130"), [stryMutAct_9fa48("2131") ? "" : (stryCov_9fa48("2131"), 'http://localhost:3001')]))),
    credentials: stryMutAct_9fa48("2134") ? process.env.CORS_CREDENTIALS !== 'true' : stryMutAct_9fa48("2133") ? false : stryMutAct_9fa48("2132") ? true : (stryCov_9fa48("2132", "2133", "2134"), process.env.CORS_CREDENTIALS === (stryMutAct_9fa48("2135") ? "" : (stryCov_9fa48("2135"), 'true'))),
    maxAge: parseInt(stryMutAct_9fa48("2138") ? process.env.CORS_MAX_AGE && '86400' : stryMutAct_9fa48("2137") ? false : stryMutAct_9fa48("2136") ? true : (stryCov_9fa48("2136", "2137", "2138"), process.env.CORS_MAX_AGE || (stryMutAct_9fa48("2139") ? "" : (stryCov_9fa48("2139"), '86400'))), 10)
  }),
  throttle: stryMutAct_9fa48("2140") ? {} : (stryCov_9fa48("2140"), {
    ttl: parseInt(stryMutAct_9fa48("2143") ? process.env.THROTTLE_TTL && '60000' : stryMutAct_9fa48("2142") ? false : stryMutAct_9fa48("2141") ? true : (stryCov_9fa48("2141", "2142", "2143"), process.env.THROTTLE_TTL || (stryMutAct_9fa48("2144") ? "" : (stryCov_9fa48("2144"), '60000'))), 10),
    limit: parseInt(stryMutAct_9fa48("2147") ? process.env.THROTTLE_LIMIT && '100' : stryMutAct_9fa48("2146") ? false : stryMutAct_9fa48("2145") ? true : (stryCov_9fa48("2145", "2146", "2147"), process.env.THROTTLE_LIMIT || (stryMutAct_9fa48("2148") ? "" : (stryCov_9fa48("2148"), '100'))), 10)
  }),
  kyc: stryMutAct_9fa48("2149") ? {} : (stryCov_9fa48("2149"), {
    providerApiKey: stryMutAct_9fa48("2152") ? process.env.KYC_PROVIDER_API_KEY && '' : stryMutAct_9fa48("2151") ? false : stryMutAct_9fa48("2150") ? true : (stryCov_9fa48("2150", "2151", "2152"), process.env.KYC_PROVIDER_API_KEY || (stryMutAct_9fa48("2153") ? "Stryker was here!" : (stryCov_9fa48("2153"), '')))
  }),
  aws: stryMutAct_9fa48("2154") ? {} : (stryCov_9fa48("2154"), {
    region: stryMutAct_9fa48("2157") ? process.env.AWS_REGION && 'us-east-1' : stryMutAct_9fa48("2156") ? false : stryMutAct_9fa48("2155") ? true : (stryCov_9fa48("2155", "2156", "2157"), process.env.AWS_REGION || (stryMutAct_9fa48("2158") ? "" : (stryCov_9fa48("2158"), 'us-east-1'))),
    accessKeyId: stryMutAct_9fa48("2161") ? process.env.AWS_ACCESS_KEY_ID && '' : stryMutAct_9fa48("2160") ? false : stryMutAct_9fa48("2159") ? true : (stryCov_9fa48("2159", "2160", "2161"), process.env.AWS_ACCESS_KEY_ID || (stryMutAct_9fa48("2162") ? "Stryker was here!" : (stryCov_9fa48("2162"), ''))),
    secretAccessKey: stryMutAct_9fa48("2165") ? process.env.AWS_SECRET_ACCESS_KEY && '' : stryMutAct_9fa48("2164") ? false : stryMutAct_9fa48("2163") ? true : (stryCov_9fa48("2163", "2164", "2165"), process.env.AWS_SECRET_ACCESS_KEY || (stryMutAct_9fa48("2166") ? "Stryker was here!" : (stryCov_9fa48("2166"), '')))
  }),
  moderation: stryMutAct_9fa48("2167") ? {} : (stryCov_9fa48("2167"), {
    toxicityThreshold: parseFloat(stryMutAct_9fa48("2170") ? process.env.MODERATION_TOXICITY_THRESHOLD && '0.7' : stryMutAct_9fa48("2169") ? false : stryMutAct_9fa48("2168") ? true : (stryCov_9fa48("2168", "2169", "2170"), process.env.MODERATION_TOXICITY_THRESHOLD || (stryMutAct_9fa48("2171") ? "" : (stryCov_9fa48("2171"), '0.7'))))
  }),
  elasticsearch: stryMutAct_9fa48("2172") ? {} : (stryCov_9fa48("2172"), {
    node: stryMutAct_9fa48("2175") ? process.env.ELASTICSEARCH_NODE && 'http://localhost:9200' : stryMutAct_9fa48("2174") ? false : stryMutAct_9fa48("2173") ? true : (stryCov_9fa48("2173", "2174", "2175"), process.env.ELASTICSEARCH_NODE || (stryMutAct_9fa48("2176") ? "" : (stryCov_9fa48("2176"), 'http://localhost:9200'))),
    apiKey: stryMutAct_9fa48("2179") ? process.env.ELASTICSEARCH_API_KEY && '' : stryMutAct_9fa48("2178") ? false : stryMutAct_9fa48("2177") ? true : (stryCov_9fa48("2177", "2178", "2179"), process.env.ELASTICSEARCH_API_KEY || (stryMutAct_9fa48("2180") ? "Stryker was here!" : (stryCov_9fa48("2180"), '')))
  }),
  stripe: stryMutAct_9fa48("2181") ? {} : (stryCov_9fa48("2181"), {
    secretKey: stryMutAct_9fa48("2184") ? process.env.STRIPE_SECRET_KEY && '' : stryMutAct_9fa48("2183") ? false : stryMutAct_9fa48("2182") ? true : (stryCov_9fa48("2182", "2183", "2184"), process.env.STRIPE_SECRET_KEY || (stryMutAct_9fa48("2185") ? "Stryker was here!" : (stryCov_9fa48("2185"), ''))),
    webhookSecret: stryMutAct_9fa48("2188") ? process.env.STRIPE_WEBHOOK_SECRET && '' : stryMutAct_9fa48("2187") ? false : stryMutAct_9fa48("2186") ? true : (stryCov_9fa48("2186", "2187", "2188"), process.env.STRIPE_WEBHOOK_SECRET || (stryMutAct_9fa48("2189") ? "Stryker was here!" : (stryCov_9fa48("2189"), ''))),
    proPriceId: stryMutAct_9fa48("2192") ? process.env.STRIPE_PRO_PRICE_ID && '' : stryMutAct_9fa48("2191") ? false : stryMutAct_9fa48("2190") ? true : (stryCov_9fa48("2190", "2191", "2192"), process.env.STRIPE_PRO_PRICE_ID || (stryMutAct_9fa48("2193") ? "Stryker was here!" : (stryCov_9fa48("2193"), ''))),
    enterprisePriceId: stryMutAct_9fa48("2196") ? process.env.STRIPE_ENTERPRISE_PRICE_ID && '' : stryMutAct_9fa48("2195") ? false : stryMutAct_9fa48("2194") ? true : (stryCov_9fa48("2194", "2195", "2196"), process.env.STRIPE_ENTERPRISE_PRICE_ID || (stryMutAct_9fa48("2197") ? "Stryker was here!" : (stryCov_9fa48("2197"), '')))
  }),
  exchangeRate: stryMutAct_9fa48("2198") ? {} : (stryCov_9fa48("2198"), {
    apiKey: stryMutAct_9fa48("2201") ? process.env.EXCHANGE_RATE_API_KEY && '' : stryMutAct_9fa48("2200") ? false : stryMutAct_9fa48("2199") ? true : (stryCov_9fa48("2199", "2200", "2201"), process.env.EXCHANGE_RATE_API_KEY || (stryMutAct_9fa48("2202") ? "Stryker was here!" : (stryCov_9fa48("2202"), '')))
  })
}));