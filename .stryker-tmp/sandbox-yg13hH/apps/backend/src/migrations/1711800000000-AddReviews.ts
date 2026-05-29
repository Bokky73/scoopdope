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
export class AddReviews1711800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4731")) {
      {}
    } else {
      stryCov_9fa48("4731");
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4732") ? {} : (stryCov_9fa48("4732"), {
        name: stryMutAct_9fa48("4733") ? "" : (stryCov_9fa48("4733"), 'reviews'),
        columns: stryMutAct_9fa48("4734") ? [] : (stryCov_9fa48("4734"), [stryMutAct_9fa48("4735") ? {} : (stryCov_9fa48("4735"), {
          name: stryMutAct_9fa48("4736") ? "" : (stryCov_9fa48("4736"), 'id'),
          type: stryMutAct_9fa48("4737") ? "" : (stryCov_9fa48("4737"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4738") ? false : (stryCov_9fa48("4738"), true),
          generationStrategy: stryMutAct_9fa48("4739") ? "" : (stryCov_9fa48("4739"), 'uuid'),
          default: stryMutAct_9fa48("4740") ? "" : (stryCov_9fa48("4740"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4741") ? {} : (stryCov_9fa48("4741"), {
          name: stryMutAct_9fa48("4742") ? "" : (stryCov_9fa48("4742"), 'userId'),
          type: stryMutAct_9fa48("4743") ? "" : (stryCov_9fa48("4743"), 'uuid')
        }), stryMutAct_9fa48("4744") ? {} : (stryCov_9fa48("4744"), {
          name: stryMutAct_9fa48("4745") ? "" : (stryCov_9fa48("4745"), 'courseId'),
          type: stryMutAct_9fa48("4746") ? "" : (stryCov_9fa48("4746"), 'uuid')
        }), stryMutAct_9fa48("4747") ? {} : (stryCov_9fa48("4747"), {
          name: stryMutAct_9fa48("4748") ? "" : (stryCov_9fa48("4748"), 'rating'),
          type: stryMutAct_9fa48("4749") ? "" : (stryCov_9fa48("4749"), 'int')
        }), stryMutAct_9fa48("4750") ? {} : (stryCov_9fa48("4750"), {
          name: stryMutAct_9fa48("4751") ? "" : (stryCov_9fa48("4751"), 'comment'),
          type: stryMutAct_9fa48("4752") ? "" : (stryCov_9fa48("4752"), 'text'),
          isNullable: stryMutAct_9fa48("4753") ? false : (stryCov_9fa48("4753"), true)
        }), stryMutAct_9fa48("4754") ? {} : (stryCov_9fa48("4754"), {
          name: stryMutAct_9fa48("4755") ? "" : (stryCov_9fa48("4755"), 'createdAt'),
          type: stryMutAct_9fa48("4756") ? "" : (stryCov_9fa48("4756"), 'timestamp'),
          default: stryMutAct_9fa48("4757") ? "" : (stryCov_9fa48("4757"), 'now()')
        })]),
        uniques: stryMutAct_9fa48("4758") ? [] : (stryCov_9fa48("4758"), [stryMutAct_9fa48("4759") ? {} : (stryCov_9fa48("4759"), {
          columnNames: stryMutAct_9fa48("4760") ? [] : (stryCov_9fa48("4760"), [stryMutAct_9fa48("4761") ? "" : (stryCov_9fa48("4761"), 'userId'), stryMutAct_9fa48("4762") ? "" : (stryCov_9fa48("4762"), 'courseId')])
        })]),
        foreignKeys: stryMutAct_9fa48("4763") ? [] : (stryCov_9fa48("4763"), [stryMutAct_9fa48("4764") ? {} : (stryCov_9fa48("4764"), {
          columnNames: stryMutAct_9fa48("4765") ? [] : (stryCov_9fa48("4765"), [stryMutAct_9fa48("4766") ? "" : (stryCov_9fa48("4766"), 'userId')]),
          referencedTableName: stryMutAct_9fa48("4767") ? "" : (stryCov_9fa48("4767"), 'users'),
          referencedColumnNames: stryMutAct_9fa48("4768") ? [] : (stryCov_9fa48("4768"), [stryMutAct_9fa48("4769") ? "" : (stryCov_9fa48("4769"), 'id')]),
          onDelete: stryMutAct_9fa48("4770") ? "" : (stryCov_9fa48("4770"), 'CASCADE')
        }), stryMutAct_9fa48("4771") ? {} : (stryCov_9fa48("4771"), {
          columnNames: stryMutAct_9fa48("4772") ? [] : (stryCov_9fa48("4772"), [stryMutAct_9fa48("4773") ? "" : (stryCov_9fa48("4773"), 'courseId')]),
          referencedTableName: stryMutAct_9fa48("4774") ? "" : (stryCov_9fa48("4774"), 'courses'),
          referencedColumnNames: stryMutAct_9fa48("4775") ? [] : (stryCov_9fa48("4775"), [stryMutAct_9fa48("4776") ? "" : (stryCov_9fa48("4776"), 'id')]),
          onDelete: stryMutAct_9fa48("4777") ? "" : (stryCov_9fa48("4777"), 'CASCADE')
        })])
      })), stryMutAct_9fa48("4778") ? false : (stryCov_9fa48("4778"), true));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4779")) {
      {}
    } else {
      stryCov_9fa48("4779");
      await queryRunner.dropTable(stryMutAct_9fa48("4780") ? "" : (stryCov_9fa48("4780"), 'reviews'));
    }
  }
}