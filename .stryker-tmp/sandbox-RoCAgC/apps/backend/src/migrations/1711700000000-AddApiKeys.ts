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
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
export class AddApiKeys1711700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4688")) {
      {}
    } else {
      stryCov_9fa48("4688");
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4689") ? {} : (stryCov_9fa48("4689"), {
        name: stryMutAct_9fa48("4690") ? "" : (stryCov_9fa48("4690"), 'api_keys'),
        columns: stryMutAct_9fa48("4691") ? [] : (stryCov_9fa48("4691"), [stryMutAct_9fa48("4692") ? {} : (stryCov_9fa48("4692"), {
          name: stryMutAct_9fa48("4693") ? "" : (stryCov_9fa48("4693"), 'id'),
          type: stryMutAct_9fa48("4694") ? "" : (stryCov_9fa48("4694"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4695") ? false : (stryCov_9fa48("4695"), true),
          generationStrategy: stryMutAct_9fa48("4696") ? "" : (stryCov_9fa48("4696"), 'uuid'),
          default: stryMutAct_9fa48("4697") ? "" : (stryCov_9fa48("4697"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4698") ? {} : (stryCov_9fa48("4698"), {
          name: stryMutAct_9fa48("4699") ? "" : (stryCov_9fa48("4699"), 'name'),
          type: stryMutAct_9fa48("4700") ? "" : (stryCov_9fa48("4700"), 'varchar')
        }), stryMutAct_9fa48("4701") ? {} : (stryCov_9fa48("4701"), {
          name: stryMutAct_9fa48("4702") ? "" : (stryCov_9fa48("4702"), 'keyHash'),
          type: stryMutAct_9fa48("4703") ? "" : (stryCov_9fa48("4703"), 'varchar'),
          isUnique: stryMutAct_9fa48("4704") ? false : (stryCov_9fa48("4704"), true)
        }), stryMutAct_9fa48("4705") ? {} : (stryCov_9fa48("4705"), {
          name: stryMutAct_9fa48("4706") ? "" : (stryCov_9fa48("4706"), 'isActive'),
          type: stryMutAct_9fa48("4707") ? "" : (stryCov_9fa48("4707"), 'boolean'),
          default: stryMutAct_9fa48("4708") ? false : (stryCov_9fa48("4708"), true)
        }), stryMutAct_9fa48("4709") ? {} : (stryCov_9fa48("4709"), {
          name: stryMutAct_9fa48("4710") ? "" : (stryCov_9fa48("4710"), 'userId'),
          type: stryMutAct_9fa48("4711") ? "" : (stryCov_9fa48("4711"), 'uuid')
        }), stryMutAct_9fa48("4712") ? {} : (stryCov_9fa48("4712"), {
          name: stryMutAct_9fa48("4713") ? "" : (stryCov_9fa48("4713"), 'createdAt'),
          type: stryMutAct_9fa48("4714") ? "" : (stryCov_9fa48("4714"), 'timestamp'),
          default: stryMutAct_9fa48("4715") ? "" : (stryCov_9fa48("4715"), 'now()')
        }), stryMutAct_9fa48("4716") ? {} : (stryCov_9fa48("4716"), {
          name: stryMutAct_9fa48("4717") ? "" : (stryCov_9fa48("4717"), 'lastUsedAt'),
          type: stryMutAct_9fa48("4718") ? "" : (stryCov_9fa48("4718"), 'timestamp'),
          isNullable: stryMutAct_9fa48("4719") ? false : (stryCov_9fa48("4719"), true)
        })]),
        foreignKeys: stryMutAct_9fa48("4720") ? [] : (stryCov_9fa48("4720"), [stryMutAct_9fa48("4721") ? {} : (stryCov_9fa48("4721"), {
          columnNames: stryMutAct_9fa48("4722") ? [] : (stryCov_9fa48("4722"), [stryMutAct_9fa48("4723") ? "" : (stryCov_9fa48("4723"), 'userId')]),
          referencedTableName: stryMutAct_9fa48("4724") ? "" : (stryCov_9fa48("4724"), 'users'),
          referencedColumnNames: stryMutAct_9fa48("4725") ? [] : (stryCov_9fa48("4725"), [stryMutAct_9fa48("4726") ? "" : (stryCov_9fa48("4726"), 'id')]),
          onDelete: stryMutAct_9fa48("4727") ? "" : (stryCov_9fa48("4727"), 'CASCADE')
        })])
      })), stryMutAct_9fa48("4728") ? false : (stryCov_9fa48("4728"), true));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4729")) {
      {}
    } else {
      stryCov_9fa48("4729");
      await queryRunner.dropTable(stryMutAct_9fa48("4730") ? "" : (stryCov_9fa48("4730"), 'api_keys'));
    }
  }
}