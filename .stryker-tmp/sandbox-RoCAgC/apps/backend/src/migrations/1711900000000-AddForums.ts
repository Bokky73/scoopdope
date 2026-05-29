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
export class AddForums1711900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4781")) {
      {}
    } else {
      stryCov_9fa48("4781");
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4782") ? {} : (stryCov_9fa48("4782"), {
        name: stryMutAct_9fa48("4783") ? "" : (stryCov_9fa48("4783"), 'posts'),
        columns: stryMutAct_9fa48("4784") ? [] : (stryCov_9fa48("4784"), [stryMutAct_9fa48("4785") ? {} : (stryCov_9fa48("4785"), {
          name: stryMutAct_9fa48("4786") ? "" : (stryCov_9fa48("4786"), 'id'),
          type: stryMutAct_9fa48("4787") ? "" : (stryCov_9fa48("4787"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4788") ? false : (stryCov_9fa48("4788"), true),
          generationStrategy: stryMutAct_9fa48("4789") ? "" : (stryCov_9fa48("4789"), 'uuid'),
          default: stryMutAct_9fa48("4790") ? "" : (stryCov_9fa48("4790"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4791") ? {} : (stryCov_9fa48("4791"), {
          name: stryMutAct_9fa48("4792") ? "" : (stryCov_9fa48("4792"), 'courseId'),
          type: stryMutAct_9fa48("4793") ? "" : (stryCov_9fa48("4793"), 'uuid')
        }), stryMutAct_9fa48("4794") ? {} : (stryCov_9fa48("4794"), {
          name: stryMutAct_9fa48("4795") ? "" : (stryCov_9fa48("4795"), 'userId'),
          type: stryMutAct_9fa48("4796") ? "" : (stryCov_9fa48("4796"), 'uuid')
        }), stryMutAct_9fa48("4797") ? {} : (stryCov_9fa48("4797"), {
          name: stryMutAct_9fa48("4798") ? "" : (stryCov_9fa48("4798"), 'title'),
          type: stryMutAct_9fa48("4799") ? "" : (stryCov_9fa48("4799"), 'varchar')
        }), stryMutAct_9fa48("4800") ? {} : (stryCov_9fa48("4800"), {
          name: stryMutAct_9fa48("4801") ? "" : (stryCov_9fa48("4801"), 'content'),
          type: stryMutAct_9fa48("4802") ? "" : (stryCov_9fa48("4802"), 'text')
        }), stryMutAct_9fa48("4803") ? {} : (stryCov_9fa48("4803"), {
          name: stryMutAct_9fa48("4804") ? "" : (stryCov_9fa48("4804"), 'isPinned'),
          type: stryMutAct_9fa48("4805") ? "" : (stryCov_9fa48("4805"), 'boolean'),
          default: stryMutAct_9fa48("4806") ? true : (stryCov_9fa48("4806"), false)
        }), stryMutAct_9fa48("4807") ? {} : (stryCov_9fa48("4807"), {
          name: stryMutAct_9fa48("4808") ? "" : (stryCov_9fa48("4808"), 'answerReplyId'),
          type: stryMutAct_9fa48("4809") ? "" : (stryCov_9fa48("4809"), 'uuid'),
          isNullable: stryMutAct_9fa48("4810") ? false : (stryCov_9fa48("4810"), true)
        }), stryMutAct_9fa48("4811") ? {} : (stryCov_9fa48("4811"), {
          name: stryMutAct_9fa48("4812") ? "" : (stryCov_9fa48("4812"), 'createdAt'),
          type: stryMutAct_9fa48("4813") ? "" : (stryCov_9fa48("4813"), 'timestamp'),
          default: stryMutAct_9fa48("4814") ? "" : (stryCov_9fa48("4814"), 'now()')
        })]),
        foreignKeys: stryMutAct_9fa48("4815") ? [] : (stryCov_9fa48("4815"), [stryMutAct_9fa48("4816") ? {} : (stryCov_9fa48("4816"), {
          columnNames: stryMutAct_9fa48("4817") ? [] : (stryCov_9fa48("4817"), [stryMutAct_9fa48("4818") ? "" : (stryCov_9fa48("4818"), 'courseId')]),
          referencedTableName: stryMutAct_9fa48("4819") ? "" : (stryCov_9fa48("4819"), 'courses'),
          referencedColumnNames: stryMutAct_9fa48("4820") ? [] : (stryCov_9fa48("4820"), [stryMutAct_9fa48("4821") ? "" : (stryCov_9fa48("4821"), 'id')]),
          onDelete: stryMutAct_9fa48("4822") ? "" : (stryCov_9fa48("4822"), 'CASCADE')
        }), stryMutAct_9fa48("4823") ? {} : (stryCov_9fa48("4823"), {
          columnNames: stryMutAct_9fa48("4824") ? [] : (stryCov_9fa48("4824"), [stryMutAct_9fa48("4825") ? "" : (stryCov_9fa48("4825"), 'userId')]),
          referencedTableName: stryMutAct_9fa48("4826") ? "" : (stryCov_9fa48("4826"), 'users'),
          referencedColumnNames: stryMutAct_9fa48("4827") ? [] : (stryCov_9fa48("4827"), [stryMutAct_9fa48("4828") ? "" : (stryCov_9fa48("4828"), 'id')]),
          onDelete: stryMutAct_9fa48("4829") ? "" : (stryCov_9fa48("4829"), 'CASCADE')
        })])
      })), stryMutAct_9fa48("4830") ? false : (stryCov_9fa48("4830"), true));
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4831") ? {} : (stryCov_9fa48("4831"), {
        name: stryMutAct_9fa48("4832") ? "" : (stryCov_9fa48("4832"), 'replies'),
        columns: stryMutAct_9fa48("4833") ? [] : (stryCov_9fa48("4833"), [stryMutAct_9fa48("4834") ? {} : (stryCov_9fa48("4834"), {
          name: stryMutAct_9fa48("4835") ? "" : (stryCov_9fa48("4835"), 'id'),
          type: stryMutAct_9fa48("4836") ? "" : (stryCov_9fa48("4836"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4837") ? false : (stryCov_9fa48("4837"), true),
          generationStrategy: stryMutAct_9fa48("4838") ? "" : (stryCov_9fa48("4838"), 'uuid'),
          default: stryMutAct_9fa48("4839") ? "" : (stryCov_9fa48("4839"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4840") ? {} : (stryCov_9fa48("4840"), {
          name: stryMutAct_9fa48("4841") ? "" : (stryCov_9fa48("4841"), 'postId'),
          type: stryMutAct_9fa48("4842") ? "" : (stryCov_9fa48("4842"), 'uuid')
        }), stryMutAct_9fa48("4843") ? {} : (stryCov_9fa48("4843"), {
          name: stryMutAct_9fa48("4844") ? "" : (stryCov_9fa48("4844"), 'userId'),
          type: stryMutAct_9fa48("4845") ? "" : (stryCov_9fa48("4845"), 'uuid')
        }), stryMutAct_9fa48("4846") ? {} : (stryCov_9fa48("4846"), {
          name: stryMutAct_9fa48("4847") ? "" : (stryCov_9fa48("4847"), 'content'),
          type: stryMutAct_9fa48("4848") ? "" : (stryCov_9fa48("4848"), 'text')
        }), stryMutAct_9fa48("4849") ? {} : (stryCov_9fa48("4849"), {
          name: stryMutAct_9fa48("4850") ? "" : (stryCov_9fa48("4850"), 'isAnswer'),
          type: stryMutAct_9fa48("4851") ? "" : (stryCov_9fa48("4851"), 'boolean'),
          default: stryMutAct_9fa48("4852") ? true : (stryCov_9fa48("4852"), false)
        }), stryMutAct_9fa48("4853") ? {} : (stryCov_9fa48("4853"), {
          name: stryMutAct_9fa48("4854") ? "" : (stryCov_9fa48("4854"), 'createdAt'),
          type: stryMutAct_9fa48("4855") ? "" : (stryCov_9fa48("4855"), 'timestamp'),
          default: stryMutAct_9fa48("4856") ? "" : (stryCov_9fa48("4856"), 'now()')
        })]),
        foreignKeys: stryMutAct_9fa48("4857") ? [] : (stryCov_9fa48("4857"), [stryMutAct_9fa48("4858") ? {} : (stryCov_9fa48("4858"), {
          columnNames: stryMutAct_9fa48("4859") ? [] : (stryCov_9fa48("4859"), [stryMutAct_9fa48("4860") ? "" : (stryCov_9fa48("4860"), 'postId')]),
          referencedTableName: stryMutAct_9fa48("4861") ? "" : (stryCov_9fa48("4861"), 'posts'),
          referencedColumnNames: stryMutAct_9fa48("4862") ? [] : (stryCov_9fa48("4862"), [stryMutAct_9fa48("4863") ? "" : (stryCov_9fa48("4863"), 'id')]),
          onDelete: stryMutAct_9fa48("4864") ? "" : (stryCov_9fa48("4864"), 'CASCADE')
        }), stryMutAct_9fa48("4865") ? {} : (stryCov_9fa48("4865"), {
          columnNames: stryMutAct_9fa48("4866") ? [] : (stryCov_9fa48("4866"), [stryMutAct_9fa48("4867") ? "" : (stryCov_9fa48("4867"), 'userId')]),
          referencedTableName: stryMutAct_9fa48("4868") ? "" : (stryCov_9fa48("4868"), 'users'),
          referencedColumnNames: stryMutAct_9fa48("4869") ? [] : (stryCov_9fa48("4869"), [stryMutAct_9fa48("4870") ? "" : (stryCov_9fa48("4870"), 'id')]),
          onDelete: stryMutAct_9fa48("4871") ? "" : (stryCov_9fa48("4871"), 'CASCADE')
        })])
      })), stryMutAct_9fa48("4872") ? false : (stryCov_9fa48("4872"), true));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4873")) {
      {}
    } else {
      stryCov_9fa48("4873");
      await queryRunner.dropTable(stryMutAct_9fa48("4874") ? "" : (stryCov_9fa48("4874"), 'replies'));
      await queryRunner.dropTable(stryMutAct_9fa48("4875") ? "" : (stryCov_9fa48("4875"), 'posts'));
    }
  }
}