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
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Horizon, Keypair, Networks, TransactionBuilder, BASE_FEE, Operation, SorobanRpc, nativeToScVal, Address } from '@stellar/stellar-sdk';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private server: Horizon.Server;
  private sorobanServer: SorobanRpc.Server;
  private networkPassphrase: string;
  private analyticsContractId: string;
  private tokenContractId: string;
  private credentialMetadataContractId: string;
  private contractId: string;
  constructor(private configService: ConfigService, @Inject(CACHE_MANAGER)
  private cacheManager: Cache) {
    if (stryMutAct_9fa48("6583")) {
      {}
    } else {
      stryCov_9fa48("6583");
      const isTestnet = stryMutAct_9fa48("6586") ? this.configService.get<string>('stellar.network') === 'mainnet' : stryMutAct_9fa48("6585") ? false : stryMutAct_9fa48("6584") ? true : (stryCov_9fa48("6584", "6585", "6586"), this.configService.get<string>(stryMutAct_9fa48("6587") ? "" : (stryCov_9fa48("6587"), 'stellar.network')) !== (stryMutAct_9fa48("6588") ? "" : (stryCov_9fa48("6588"), 'mainnet')));
      this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
      this.server = new Horizon.Server(isTestnet ? stryMutAct_9fa48("6589") ? "" : (stryCov_9fa48("6589"), 'https://horizon-testnet.stellar.org') : stryMutAct_9fa48("6590") ? "" : (stryCov_9fa48("6590"), 'https://horizon.stellar.org'));
      const rpcUrl = stryMutAct_9fa48("6591") ? this.configService.get<string>('stellar.sorobanRpcUrl') && '' : (stryCov_9fa48("6591"), this.configService.get<string>(stryMutAct_9fa48("6592") ? "" : (stryCov_9fa48("6592"), 'stellar.sorobanRpcUrl')) ?? (stryMutAct_9fa48("6593") ? "Stryker was here!" : (stryCov_9fa48("6593"), '')));
      this.sorobanServer = new SorobanRpc.Server(rpcUrl);
      this.contractId = stryMutAct_9fa48("6594") ? this.configService.get<string>('stellar.contractId') && '' : (stryCov_9fa48("6594"), this.configService.get<string>(stryMutAct_9fa48("6595") ? "" : (stryCov_9fa48("6595"), 'stellar.contractId')) ?? (stryMutAct_9fa48("6596") ? "Stryker was here!" : (stryCov_9fa48("6596"), '')));
      this.analyticsContractId = stryMutAct_9fa48("6597") ? this.configService.get<string>('stellar.analyticsContractId') && '' : (stryCov_9fa48("6597"), this.configService.get<string>(stryMutAct_9fa48("6598") ? "" : (stryCov_9fa48("6598"), 'stellar.analyticsContractId')) ?? (stryMutAct_9fa48("6599") ? "Stryker was here!" : (stryCov_9fa48("6599"), '')));
      this.tokenContractId = stryMutAct_9fa48("6600") ? this.configService.get<string>('stellar.tokenContractId') && '' : (stryCov_9fa48("6600"), this.configService.get<string>(stryMutAct_9fa48("6601") ? "" : (stryCov_9fa48("6601"), 'stellar.tokenContractId')) ?? (stryMutAct_9fa48("6602") ? "Stryker was here!" : (stryCov_9fa48("6602"), '')));
      this.credentialMetadataContractId = stryMutAct_9fa48("6603") ? this.configService.get<string>('stellar.credentialMetadataContractId') && '' : (stryCov_9fa48("6603"), this.configService.get<string>(stryMutAct_9fa48("6604") ? "" : (stryCov_9fa48("6604"), 'stellar.credentialMetadataContractId')) ?? (stryMutAct_9fa48("6605") ? "Stryker was here!" : (stryCov_9fa48("6605"), '')));
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  async getAccountBalance(publicKey: string) {
    if (stryMutAct_9fa48("6606")) {
      {}
    } else {
      stryCov_9fa48("6606");
      const account = await this.server.loadAccount(publicKey);
      return account.balances;
    }
  }
  async fundTestnetAccount(publicKey: string): Promise<{
    message: string;
  }> {
    if (stryMutAct_9fa48("6607")) {
      {}
    } else {
      stryCov_9fa48("6607");
      const network = this.configService.get<string>(stryMutAct_9fa48("6608") ? "" : (stryCov_9fa48("6608"), 'stellar.network'));
      if (stryMutAct_9fa48("6611") ? network === 'testnet' : stryMutAct_9fa48("6610") ? false : stryMutAct_9fa48("6609") ? true : (stryCov_9fa48("6609", "6610", "6611"), network !== (stryMutAct_9fa48("6612") ? "" : (stryCov_9fa48("6612"), 'testnet')))) {
        if (stryMutAct_9fa48("6613")) {
          {}
        } else {
          stryCov_9fa48("6613");
          throw new Error(stryMutAct_9fa48("6614") ? "" : (stryCov_9fa48("6614"), 'Friendbot is only available on testnet'));
        }
      }
      const response = await fetch(stryMutAct_9fa48("6615") ? `` : (stryCov_9fa48("6615"), `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`));
      if (stryMutAct_9fa48("6618") ? false : stryMutAct_9fa48("6617") ? true : stryMutAct_9fa48("6616") ? response.ok : (stryCov_9fa48("6616", "6617", "6618"), !response.ok)) {
        if (stryMutAct_9fa48("6619")) {
          {}
        } else {
          stryCov_9fa48("6619");
          const body = await response.text();
          throw new Error(stryMutAct_9fa48("6620") ? `` : (stryCov_9fa48("6620"), `Friendbot error: ${body}`));
        }
      }
      return stryMutAct_9fa48("6621") ? {} : (stryCov_9fa48("6621"), {
        message: stryMutAct_9fa48("6622") ? `` : (stryCov_9fa48("6622"), `Account ${publicKey} funded successfully`)
      });
    }
  }
  async issueCredential(recipientPublicKey: string, courseId: string, metadata?: {
    courseName: string;
    grade: string;
    skills: string[];
  }): Promise<string> {
    if (stryMutAct_9fa48("6623")) {
      {}
    } else {
      stryCov_9fa48("6623");
      try {
        if (stryMutAct_9fa48("6624")) {
          {}
        } else {
          stryCov_9fa48("6624");
          await this.retryWithBackoff(stryMutAct_9fa48("6625") ? () => undefined : (stryCov_9fa48("6625"), () => this.recordProgressOnChain(recipientPublicKey, courseId)));
          this.logger.log(stryMutAct_9fa48("6626") ? `` : (stryCov_9fa48("6626"), `Progress recorded on Soroban for ${courseId}`));
        }
      } catch (error) {
        if (stryMutAct_9fa48("6627")) {
          {}
        } else {
          stryCov_9fa48("6627");
          this.logger.error(stryMutAct_9fa48("6628") ? `` : (stryCov_9fa48("6628"), `Failed to record progress on Soroban: ${error.message}, falling back to Horizon`));
          await this.issueCredentialFallback(recipientPublicKey, courseId);
        }
      }
      if (stryMutAct_9fa48("6631") ? metadata || this.credentialMetadataContractId : stryMutAct_9fa48("6630") ? false : stryMutAct_9fa48("6629") ? true : (stryCov_9fa48("6629", "6630", "6631"), metadata && this.credentialMetadataContractId)) {
        if (stryMutAct_9fa48("6632")) {
          {}
        } else {
          stryCov_9fa48("6632");
          try {
            if (stryMutAct_9fa48("6633")) {
              {}
            } else {
              stryCov_9fa48("6633");
              await this.retryWithBackoff(stryMutAct_9fa48("6634") ? () => undefined : (stryCov_9fa48("6634"), () => this.storeCredentialMetadata(recipientPublicKey, metadata)));
              this.logger.log(stryMutAct_9fa48("6635") ? `` : (stryCov_9fa48("6635"), `Metadata stored on-chain for ${metadata.courseName}`));
            }
          } catch (error) {
            if (stryMutAct_9fa48("6636")) {
              {}
            } else {
              stryCov_9fa48("6636");
              this.logger.error(stryMutAct_9fa48("6637") ? `` : (stryCov_9fa48("6637"), `Failed to store metadata on-chain: ${error.message}`));
            }
          }
        }
      }
      return this.mintCredentialViaHorizon(recipientPublicKey, courseId);
    }
  }
  async storeCredentialMetadata(studentPublicKey: string, metadata: {
    courseName: string;
    grade: string;
    skills: string[];
  }): Promise<string> {
    if (stryMutAct_9fa48("6638")) {
      {}
    } else {
      stryCov_9fa48("6638");
      const issuerKeypair = Keypair.fromSecret(stryMutAct_9fa48("6639") ? this.configService.get<string>('stellar.secretKey') && '' : (stryCov_9fa48("6639"), this.configService.get<string>(stryMutAct_9fa48("6640") ? "" : (stryCov_9fa48("6640"), 'stellar.secretKey')) ?? (stryMutAct_9fa48("6641") ? "Stryker was here!" : (stryCov_9fa48("6641"), ''))));
      return this.invokeContract(this.credentialMetadataContractId, stryMutAct_9fa48("6642") ? "" : (stryCov_9fa48("6642"), 'store_metadata'), stryMutAct_9fa48("6643") ? [] : (stryCov_9fa48("6643"), [new Address(issuerKeypair.publicKey()).toScVal(),
      // admin
      new Address(studentPublicKey).toScVal(),
      // student
      nativeToScVal(metadata.courseName, stryMutAct_9fa48("6644") ? {} : (stryCov_9fa48("6644"), {
        type: stryMutAct_9fa48("6645") ? "" : (stryCov_9fa48("6645"), 'string')
      })), nativeToScVal(Math.floor(stryMutAct_9fa48("6646") ? Date.now() * 1000 : (stryCov_9fa48("6646"), Date.now() / 1000)), stryMutAct_9fa48("6647") ? {} : (stryCov_9fa48("6647"), {
        type: stryMutAct_9fa48("6648") ? "" : (stryCov_9fa48("6648"), 'u64')
      })),
      // completion_date
      nativeToScVal(metadata.grade, stryMutAct_9fa48("6649") ? {} : (stryCov_9fa48("6649"), {
        type: stryMutAct_9fa48("6650") ? "" : (stryCov_9fa48("6650"), 'string')
      })), nativeToScVal(metadata.skills) // Soroban Vec<String>
      ]));
    }
  }
  async recordProgress(studentPublicKey: string, courseId: string, _progressPct: number): Promise<string> {
    if (stryMutAct_9fa48("6651")) {
      {}
    } else {
      stryCov_9fa48("6651");
      return this.retryWithBackoff(stryMutAct_9fa48("6652") ? () => undefined : (stryCov_9fa48("6652"), () => this.invokeContract(stryMutAct_9fa48("6653") ? this.analyticsContractId && this.contractId : (stryCov_9fa48("6653"), this.analyticsContractId ?? this.contractId), stryMutAct_9fa48("6654") ? "" : (stryCov_9fa48("6654"), 'record_progress'), stryMutAct_9fa48("6655") ? [] : (stryCov_9fa48("6655"), [new Address(studentPublicKey).toScVal(), nativeToScVal(courseId, stryMutAct_9fa48("6656") ? {} : (stryCov_9fa48("6656"), {
        type: stryMutAct_9fa48("6657") ? "" : (stryCov_9fa48("6657"), 'symbol')
      })), nativeToScVal(_progressPct, stryMutAct_9fa48("6658") ? {} : (stryCov_9fa48("6658"), {
        type: stryMutAct_9fa48("6659") ? "" : (stryCov_9fa48("6659"), 'i32')
      }))]))));
    }
  }

  /** Read BST balance for an address from the Token contract (read-only simulate) */
  async getTokenBalance(stellarPublicKey: string): Promise<string> {
    if (stryMutAct_9fa48("6660")) {
      {}
    } else {
      stryCov_9fa48("6660");
      if (stryMutAct_9fa48("6663") ? false : stryMutAct_9fa48("6662") ? true : stryMutAct_9fa48("6661") ? this.tokenContractId : (stryCov_9fa48("6661", "6662", "6663"), !this.tokenContractId)) {
        if (stryMutAct_9fa48("6664")) {
          {}
        } else {
          stryCov_9fa48("6664");
          throw new Error(stryMutAct_9fa48("6665") ? "" : (stryCov_9fa48("6665"), 'TOKEN_CONTRACT_ID not configured'));
        }
      }
      const cacheKey = stryMutAct_9fa48("6666") ? `` : (stryCov_9fa48("6666"), `token_balance:${stellarPublicKey}`);
      const cached = await this.cacheManager.get<string>(cacheKey);
      if (stryMutAct_9fa48("6669") ? cached !== undefined || cached !== null : stryMutAct_9fa48("6668") ? false : stryMutAct_9fa48("6667") ? true : (stryCov_9fa48("6667", "6668", "6669"), (stryMutAct_9fa48("6671") ? cached === undefined : stryMutAct_9fa48("6670") ? true : (stryCov_9fa48("6670", "6671"), cached !== undefined)) && (stryMutAct_9fa48("6673") ? cached === null : stryMutAct_9fa48("6672") ? true : (stryCov_9fa48("6672", "6673"), cached !== null)))) return cached;
      const issuerKeypair = Keypair.fromSecret(stryMutAct_9fa48("6674") ? this.configService.get<string>('stellar.secretKey') && '' : (stryCov_9fa48("6674"), this.configService.get<string>(stryMutAct_9fa48("6675") ? "" : (stryCov_9fa48("6675"), 'stellar.secretKey')) ?? (stryMutAct_9fa48("6676") ? "Stryker was here!" : (stryCov_9fa48("6676"), ''))));
      const source = await this.sorobanServer.getAccount(issuerKeypair.publicKey());
      const tx = new TransactionBuilder(source as any, stryMutAct_9fa48("6677") ? {} : (stryCov_9fa48("6677"), {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })).addOperation(Operation.invokeContractFunction(stryMutAct_9fa48("6678") ? {} : (stryCov_9fa48("6678"), {
        contract: this.tokenContractId,
        function: stryMutAct_9fa48("6679") ? "" : (stryCov_9fa48("6679"), 'balance'),
        args: stryMutAct_9fa48("6680") ? [] : (stryCov_9fa48("6680"), [new Address(stellarPublicKey).toScVal()])
      }))).setTimeout(30).build();
      const simResult = await this.sorobanServer.simulateTransaction(tx);
      if (stryMutAct_9fa48("6682") ? false : stryMutAct_9fa48("6681") ? true : (stryCov_9fa48("6681", "6682"), SorobanRpc.Api.isSimulationError(simResult))) {
        if (stryMutAct_9fa48("6683")) {
          {}
        } else {
          stryCov_9fa48("6683");
          throw new Error(stryMutAct_9fa48("6684") ? `` : (stryCov_9fa48("6684"), `Token balance simulation failed: ${simResult.error}`));
        }
      }
      const retVal = stryMutAct_9fa48("6685") ? (simResult as SorobanRpc.Api.SimulateTransactionSuccessResponse).result.retval : (stryCov_9fa48("6685"), (simResult as SorobanRpc.Api.SimulateTransactionSuccessResponse).result?.retval);
      const balance = retVal ? BigInt(retVal.value() as unknown as bigint).toString() : stryMutAct_9fa48("6686") ? "" : (stryCov_9fa48("6686"), '0');
      await this.cacheManager.set(cacheKey, balance, 30_000);
      return balance;
    }
  }

  /** Mint reward tokens via the Token Soroban contract */
  async mintReward(recipientPublicKey: string, amount: number): Promise<string> {
    if (stryMutAct_9fa48("6687")) {
      {}
    } else {
      stryCov_9fa48("6687");
      if (stryMutAct_9fa48("6690") ? false : stryMutAct_9fa48("6689") ? true : stryMutAct_9fa48("6688") ? this.tokenContractId : (stryCov_9fa48("6688", "6689", "6690"), !this.tokenContractId)) {
        if (stryMutAct_9fa48("6691")) {
          {}
        } else {
          stryCov_9fa48("6691");
          throw new Error(stryMutAct_9fa48("6692") ? "" : (stryCov_9fa48("6692"), 'TOKEN_CONTRACT_ID not configured'));
        }
      }
      return this.retryWithBackoff(stryMutAct_9fa48("6693") ? () => undefined : (stryCov_9fa48("6693"), () => this.invokeContract(this.tokenContractId, stryMutAct_9fa48("6694") ? "" : (stryCov_9fa48("6694"), 'mint_reward'), stryMutAct_9fa48("6695") ? [] : (stryCov_9fa48("6695"), [new Address(recipientPublicKey).toScVal(), nativeToScVal(amount, stryMutAct_9fa48("6696") ? {} : (stryCov_9fa48("6696"), {
        type: stryMutAct_9fa48("6697") ? "" : (stryCov_9fa48("6697"), 'i128')
      }))]))));
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async recordProgressOnChain(studentPublicKey: string, courseId: string): Promise<void> {
    if (stryMutAct_9fa48("6698")) {
      {}
    } else {
      stryCov_9fa48("6698");
      await this.invokeContract(stryMutAct_9fa48("6699") ? this.analyticsContractId && this.contractId : (stryCov_9fa48("6699"), this.analyticsContractId ?? this.contractId), stryMutAct_9fa48("6700") ? "" : (stryCov_9fa48("6700"), 'record_progress'), stryMutAct_9fa48("6701") ? [] : (stryCov_9fa48("6701"), [new Address(studentPublicKey).toScVal(), nativeToScVal(courseId, stryMutAct_9fa48("6702") ? {} : (stryCov_9fa48("6702"), {
        type: stryMutAct_9fa48("6703") ? "" : (stryCov_9fa48("6703"), 'symbol')
      })), nativeToScVal(100, stryMutAct_9fa48("6704") ? {} : (stryCov_9fa48("6704"), {
        type: stryMutAct_9fa48("6705") ? "" : (stryCov_9fa48("6705"), 'i32')
      }))]));
    }
  }
  private async issueCredentialFallback(recipientPublicKey: string, courseId: string): Promise<void> {
    if (stryMutAct_9fa48("6706")) {
      {}
    } else {
      stryCov_9fa48("6706");
      const issuerKeypair = Keypair.fromSecret(stryMutAct_9fa48("6707") ? this.configService.get<string>('stellar.secretKey') && '' : (stryCov_9fa48("6707"), this.configService.get<string>(stryMutAct_9fa48("6708") ? "" : (stryCov_9fa48("6708"), 'stellar.secretKey')) ?? (stryMutAct_9fa48("6709") ? "Stryker was here!" : (stryCov_9fa48("6709"), ''))));
      const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());
      const tx = new TransactionBuilder(issuerAccount, stryMutAct_9fa48("6710") ? {} : (stryCov_9fa48("6710"), {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })).addOperation(Operation.manageData(stryMutAct_9fa48("6711") ? {} : (stryCov_9fa48("6711"), {
        name: stryMutAct_9fa48("6712") ? `` : (stryCov_9fa48("6712"), `scoopdope:credential:${courseId}`),
        value: recipientPublicKey
      }))).setTimeout(30).build();
      tx.sign(issuerKeypair);
      await this.server.submitTransaction(tx);
    }
  }
  private async invokeContract(contractId: string, method: string, args: any[]): Promise<string> {
    if (stryMutAct_9fa48("6713")) {
      {}
    } else {
      stryCov_9fa48("6713");
      const issuerKeypair = Keypair.fromSecret(stryMutAct_9fa48("6714") ? this.configService.get<string>('stellar.secretKey') && '' : (stryCov_9fa48("6714"), this.configService.get<string>(stryMutAct_9fa48("6715") ? "" : (stryCov_9fa48("6715"), 'stellar.secretKey')) ?? (stryMutAct_9fa48("6716") ? "Stryker was here!" : (stryCov_9fa48("6716"), ''))));
      const source = await this.sorobanServer.getAccount(issuerKeypair.publicKey());
      const tx = new TransactionBuilder(source as any, stryMutAct_9fa48("6717") ? {} : (stryCov_9fa48("6717"), {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })).addOperation(Operation.invokeContractFunction(stryMutAct_9fa48("6718") ? {} : (stryCov_9fa48("6718"), {
        contract: contractId,
        function: method,
        args
      }))).setTimeout(30).build();
      const prepared = await this.sorobanServer.prepareTransaction(tx);
      (prepared as any).sign(issuerKeypair);
      const result = await this.sorobanServer.sendTransaction(prepared as any);
      this.logger.log(stryMutAct_9fa48("6719") ? `` : (stryCov_9fa48("6719"), `Contract ${method} tx: ${result.hash}`));
      return result.hash;
    }
  }
  private async mintCredentialViaHorizon(recipientPublicKey: string, courseId: string): Promise<string> {
    if (stryMutAct_9fa48("6720")) {
      {}
    } else {
      stryCov_9fa48("6720");
      const issuerKeypair = Keypair.fromSecret(stryMutAct_9fa48("6721") ? this.configService.get<string>('stellar.secretKey') && '' : (stryCov_9fa48("6721"), this.configService.get<string>(stryMutAct_9fa48("6722") ? "" : (stryCov_9fa48("6722"), 'stellar.secretKey')) ?? (stryMutAct_9fa48("6723") ? "Stryker was here!" : (stryCov_9fa48("6723"), ''))));
      const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());
      const tx = new TransactionBuilder(issuerAccount, stryMutAct_9fa48("6724") ? {} : (stryCov_9fa48("6724"), {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })).addOperation(Operation.manageData(stryMutAct_9fa48("6725") ? {} : (stryCov_9fa48("6725"), {
        name: stryMutAct_9fa48("6726") ? `` : (stryCov_9fa48("6726"), `scoopdope:credential:${courseId}`),
        value: recipientPublicKey
      }))).setTimeout(30).build();
      tx.sign(issuerKeypair);
      const result = await this.server.submitTransaction(tx);
      this.logger.log(stryMutAct_9fa48("6727") ? `` : (stryCov_9fa48("6727"), `Credential issued via Horizon: ${result.hash}`));
      return result.hash;
    }
  }
  private async retryWithBackoff<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
    if (stryMutAct_9fa48("6728")) {
      {}
    } else {
      stryCov_9fa48("6728");
      try {
        if (stryMutAct_9fa48("6729")) {
          {}
        } else {
          stryCov_9fa48("6729");
          return await fn();
        }
      } catch (error) {
        if (stryMutAct_9fa48("6730")) {
          {}
        } else {
          stryCov_9fa48("6730");
          if (stryMutAct_9fa48("6734") ? attempt < MAX_RETRIES : stryMutAct_9fa48("6733") ? attempt > MAX_RETRIES : stryMutAct_9fa48("6732") ? false : stryMutAct_9fa48("6731") ? true : (stryCov_9fa48("6731", "6732", "6733", "6734"), attempt >= MAX_RETRIES)) throw error;
          const delay = stryMutAct_9fa48("6735") ? BASE_DELAY_MS / Math.pow(2, attempt - 1) : (stryCov_9fa48("6735"), BASE_DELAY_MS * Math.pow(2, stryMutAct_9fa48("6736") ? attempt + 1 : (stryCov_9fa48("6736"), attempt - 1)));
          this.logger.warn(stryMutAct_9fa48("6737") ? `` : (stryCov_9fa48("6737"), `Attempt ${attempt} failed, retrying in ${delay}ms`));
          await new Promise(stryMutAct_9fa48("6738") ? () => undefined : (stryCov_9fa48("6738"), r => setTimeout(r, delay)));
          return this.retryWithBackoff(fn, stryMutAct_9fa48("6739") ? attempt - 1 : (stryCov_9fa48("6739"), attempt + 1));
        }
      }
    }
  }
}