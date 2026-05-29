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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Keypair, Networks, WebAuth } from '@stellar/stellar-sdk';
import { UsersService } from '../users/users.service';
const CHALLENGE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class StellarAuthService {
  private readonly serverKeypair: Keypair;
  private readonly networkPassphrase: string;
  private readonly webAuthDomain: string;
  constructor(private configService: ConfigService, private jwtService: JwtService, private usersService: UsersService) {
    if (stryMutAct_9fa48("1269")) {
      {}
    } else {
      stryCov_9fa48("1269");
      this.serverKeypair = Keypair.fromSecret(stryMutAct_9fa48("1270") ? this.configService.get<string>('stellar.secretKey') && '' : (stryCov_9fa48("1270"), this.configService.get<string>(stryMutAct_9fa48("1271") ? "" : (stryCov_9fa48("1271"), 'stellar.secretKey')) ?? (stryMutAct_9fa48("1272") ? "Stryker was here!" : (stryCov_9fa48("1272"), ''))));
      const isTestnet = stryMutAct_9fa48("1275") ? this.configService.get<string>('stellar.network') === 'mainnet' : stryMutAct_9fa48("1274") ? false : stryMutAct_9fa48("1273") ? true : (stryCov_9fa48("1273", "1274", "1275"), this.configService.get<string>(stryMutAct_9fa48("1276") ? "" : (stryCov_9fa48("1276"), 'stellar.network')) !== (stryMutAct_9fa48("1277") ? "" : (stryCov_9fa48("1277"), 'mainnet')));
      this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
      this.webAuthDomain = stryMutAct_9fa48("1278") ? this.configService.get<string>('stellar.webAuthDomain') && '' : (stryCov_9fa48("1278"), this.configService.get<string>(stryMutAct_9fa48("1279") ? "" : (stryCov_9fa48("1279"), 'stellar.webAuthDomain')) ?? (stryMutAct_9fa48("1280") ? "Stryker was here!" : (stryCov_9fa48("1280"), '')));
    }
  }

  /** GET /auth/stellar?account=G... — returns a SEP-0010 challenge XDR */
  buildChallenge(clientPublicKey: string): {
    transaction: string;
    network_passphrase: string;
  } {
    if (stryMutAct_9fa48("1281")) {
      {}
    } else {
      stryCov_9fa48("1281");
      const transaction = WebAuth.buildChallengeTx(this.serverKeypair, clientPublicKey, this.webAuthDomain, CHALLENGE_TTL_SECONDS, this.networkPassphrase, this.webAuthDomain);
      return stryMutAct_9fa48("1282") ? {} : (stryCov_9fa48("1282"), {
        transaction,
        network_passphrase: this.networkPassphrase
      });
    }
  }

  /** POST /auth/stellar — verifies signed challenge, returns JWT */
  async verifyChallenge(signedXdr: string): Promise<{
    access_token: string;
  }> {
    if (stryMutAct_9fa48("1283")) {
      {}
    } else {
      stryCov_9fa48("1283");
      let clientPublicKey: string;
      try {
        if (stryMutAct_9fa48("1284")) {
          {}
        } else {
          stryCov_9fa48("1284");
          const {
            clientAccountID
          } = WebAuth.readChallengeTx(signedXdr, this.serverKeypair.publicKey(), this.networkPassphrase, this.webAuthDomain, this.webAuthDomain);
          clientPublicKey = clientAccountID;
        }
      } catch (err) {
        if (stryMutAct_9fa48("1285")) {
          {}
        } else {
          stryCov_9fa48("1285");
          throw new UnauthorizedException(stryMutAct_9fa48("1286") ? `` : (stryCov_9fa48("1286"), `Invalid SEP-0010 challenge: ${err.message}`));
        }
      }

      // Find or auto-provision a user for this Stellar account
      let user = await this.usersService.findByStellarPublicKey(clientPublicKey);
      if (stryMutAct_9fa48("1289") ? false : stryMutAct_9fa48("1288") ? true : stryMutAct_9fa48("1287") ? user : (stryCov_9fa48("1287", "1288", "1289"), !user)) {
        if (stryMutAct_9fa48("1290")) {
          {}
        } else {
          stryCov_9fa48("1290");
          user = await this.usersService.create(stryMutAct_9fa48("1291") ? {} : (stryCov_9fa48("1291"), {
            stellarPublicKey: clientPublicKey,
            email: stryMutAct_9fa48("1292") ? `` : (stryCov_9fa48("1292"), `${clientPublicKey}@stellar.local`),
            passwordHash: stryMutAct_9fa48("1293") ? "Stryker was here!" : (stryCov_9fa48("1293"), ''),
            isVerified: stryMutAct_9fa48("1294") ? false : (stryCov_9fa48("1294"), true)
          }));
        }
      }
      const access_token = this.jwtService.sign(stryMutAct_9fa48("1295") ? {} : (stryCov_9fa48("1295"), {
        sub: user.id,
        email: user.email,
        role: user.role
      }), stryMutAct_9fa48("1296") ? {} : (stryCov_9fa48("1296"), {
        expiresIn: stryMutAct_9fa48("1297") ? "" : (stryCov_9fa48("1297"), '15m')
      }));
      return stryMutAct_9fa48("1298") ? {} : (stryCov_9fa48("1298"), {
        access_token
      });
    }
  }
}