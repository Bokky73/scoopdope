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
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
export class AddSurveys1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4891")) {
      {}
    } else {
      stryCov_9fa48("4891");
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4892") ? {} : (stryCov_9fa48("4892"), {
        name: stryMutAct_9fa48("4893") ? "" : (stryCov_9fa48("4893"), 'surveys'),
        columns: stryMutAct_9fa48("4894") ? [] : (stryCov_9fa48("4894"), [stryMutAct_9fa48("4895") ? {} : (stryCov_9fa48("4895"), {
          name: stryMutAct_9fa48("4896") ? "" : (stryCov_9fa48("4896"), 'id'),
          type: stryMutAct_9fa48("4897") ? "" : (stryCov_9fa48("4897"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4898") ? false : (stryCov_9fa48("4898"), true),
          generationStrategy: stryMutAct_9fa48("4899") ? "" : (stryCov_9fa48("4899"), 'uuid'),
          default: stryMutAct_9fa48("4900") ? "" : (stryCov_9fa48("4900"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4901") ? {} : (stryCov_9fa48("4901"), {
          name: stryMutAct_9fa48("4902") ? "" : (stryCov_9fa48("4902"), 'courseId'),
          type: stryMutAct_9fa48("4903") ? "" : (stryCov_9fa48("4903"), 'uuid')
        }), stryMutAct_9fa48("4904") ? {} : (stryCov_9fa48("4904"), {
          name: stryMutAct_9fa48("4905") ? "" : (stryCov_9fa48("4905"), 'title'),
          type: stryMutAct_9fa48("4906") ? "" : (stryCov_9fa48("4906"), 'varchar')
        }), stryMutAct_9fa48("4907") ? {} : (stryCov_9fa48("4907"), {
          name: stryMutAct_9fa48("4908") ? "" : (stryCov_9fa48("4908"), 'description'),
          type: stryMutAct_9fa48("4909") ? "" : (stryCov_9fa48("4909"), 'text')
        }), stryMutAct_9fa48("4910") ? {} : (stryCov_9fa48("4910"), {
          name: stryMutAct_9fa48("4911") ? "" : (stryCov_9fa48("4911"), 'triggerType'),
          type: stryMutAct_9fa48("4912") ? "" : (stryCov_9fa48("4912"), 'enum'),
          enum: stryMutAct_9fa48("4913") ? [] : (stryCov_9fa48("4913"), [stryMutAct_9fa48("4914") ? "" : (stryCov_9fa48("4914"), 'completion'), stryMutAct_9fa48("4915") ? "" : (stryCov_9fa48("4915"), 'milestone')]),
          default: stryMutAct_9fa48("4916") ? "" : (stryCov_9fa48("4916"), "'completion'")
        }), stryMutAct_9fa48("4917") ? {} : (stryCov_9fa48("4917"), {
          name: stryMutAct_9fa48("4918") ? "" : (stryCov_9fa48("4918"), 'triggerMilestone'),
          type: stryMutAct_9fa48("4919") ? "" : (stryCov_9fa48("4919"), 'int'),
          isNullable: stryMutAct_9fa48("4920") ? false : (stryCov_9fa48("4920"), true)
        }), stryMutAct_9fa48("4921") ? {} : (stryCov_9fa48("4921"), {
          name: stryMutAct_9fa48("4922") ? "" : (stryCov_9fa48("4922"), 'isActive'),
          type: stryMutAct_9fa48("4923") ? "" : (stryCov_9fa48("4923"), 'boolean'),
          default: stryMutAct_9fa48("4924") ? false : (stryCov_9fa48("4924"), true)
        }), stryMutAct_9fa48("4925") ? {} : (stryCov_9fa48("4925"), {
          name: stryMutAct_9fa48("4926") ? "" : (stryCov_9fa48("4926"), 'createdAt'),
          type: stryMutAct_9fa48("4927") ? "" : (stryCov_9fa48("4927"), 'timestamp'),
          default: stryMutAct_9fa48("4928") ? "" : (stryCov_9fa48("4928"), 'CURRENT_TIMESTAMP')
        })])
      })), stryMutAct_9fa48("4929") ? false : (stryCov_9fa48("4929"), true));
      await queryRunner.createForeignKey(stryMutAct_9fa48("4930") ? "" : (stryCov_9fa48("4930"), 'surveys'), new TableForeignKey(stryMutAct_9fa48("4931") ? {} : (stryCov_9fa48("4931"), {
        columnNames: stryMutAct_9fa48("4932") ? [] : (stryCov_9fa48("4932"), [stryMutAct_9fa48("4933") ? "" : (stryCov_9fa48("4933"), 'courseId')]),
        referencedColumnNames: stryMutAct_9fa48("4934") ? [] : (stryCov_9fa48("4934"), [stryMutAct_9fa48("4935") ? "" : (stryCov_9fa48("4935"), 'id')]),
        referencedTableName: stryMutAct_9fa48("4936") ? "" : (stryCov_9fa48("4936"), 'courses'),
        onDelete: stryMutAct_9fa48("4937") ? "" : (stryCov_9fa48("4937"), 'CASCADE')
      })));
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4938") ? {} : (stryCov_9fa48("4938"), {
        name: stryMutAct_9fa48("4939") ? "" : (stryCov_9fa48("4939"), 'survey_questions'),
        columns: stryMutAct_9fa48("4940") ? [] : (stryCov_9fa48("4940"), [stryMutAct_9fa48("4941") ? {} : (stryCov_9fa48("4941"), {
          name: stryMutAct_9fa48("4942") ? "" : (stryCov_9fa48("4942"), 'id'),
          type: stryMutAct_9fa48("4943") ? "" : (stryCov_9fa48("4943"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4944") ? false : (stryCov_9fa48("4944"), true),
          generationStrategy: stryMutAct_9fa48("4945") ? "" : (stryCov_9fa48("4945"), 'uuid'),
          default: stryMutAct_9fa48("4946") ? "" : (stryCov_9fa48("4946"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4947") ? {} : (stryCov_9fa48("4947"), {
          name: stryMutAct_9fa48("4948") ? "" : (stryCov_9fa48("4948"), 'surveyId'),
          type: stryMutAct_9fa48("4949") ? "" : (stryCov_9fa48("4949"), 'uuid')
        }), stryMutAct_9fa48("4950") ? {} : (stryCov_9fa48("4950"), {
          name: stryMutAct_9fa48("4951") ? "" : (stryCov_9fa48("4951"), 'text'),
          type: stryMutAct_9fa48("4952") ? "" : (stryCov_9fa48("4952"), 'text')
        }), stryMutAct_9fa48("4953") ? {} : (stryCov_9fa48("4953"), {
          name: stryMutAct_9fa48("4954") ? "" : (stryCov_9fa48("4954"), 'type'),
          type: stryMutAct_9fa48("4955") ? "" : (stryCov_9fa48("4955"), 'enum'),
          enum: stryMutAct_9fa48("4956") ? [] : (stryCov_9fa48("4956"), [stryMutAct_9fa48("4957") ? "" : (stryCov_9fa48("4957"), 'rating'), stryMutAct_9fa48("4958") ? "" : (stryCov_9fa48("4958"), 'text'), stryMutAct_9fa48("4959") ? "" : (stryCov_9fa48("4959"), 'mcq')])
        }), stryMutAct_9fa48("4960") ? {} : (stryCov_9fa48("4960"), {
          name: stryMutAct_9fa48("4961") ? "" : (stryCov_9fa48("4961"), 'options'),
          type: stryMutAct_9fa48("4962") ? "" : (stryCov_9fa48("4962"), 'text'),
          isNullable: stryMutAct_9fa48("4963") ? false : (stryCov_9fa48("4963"), true)
        }), stryMutAct_9fa48("4964") ? {} : (stryCov_9fa48("4964"), {
          name: stryMutAct_9fa48("4965") ? "" : (stryCov_9fa48("4965"), 'order'),
          type: stryMutAct_9fa48("4966") ? "" : (stryCov_9fa48("4966"), 'int')
        }), stryMutAct_9fa48("4967") ? {} : (stryCov_9fa48("4967"), {
          name: stryMutAct_9fa48("4968") ? "" : (stryCov_9fa48("4968"), 'required'),
          type: stryMutAct_9fa48("4969") ? "" : (stryCov_9fa48("4969"), 'boolean'),
          default: stryMutAct_9fa48("4970") ? false : (stryCov_9fa48("4970"), true)
        })])
      })), stryMutAct_9fa48("4971") ? false : (stryCov_9fa48("4971"), true));
      await queryRunner.createForeignKey(stryMutAct_9fa48("4972") ? "" : (stryCov_9fa48("4972"), 'survey_questions'), new TableForeignKey(stryMutAct_9fa48("4973") ? {} : (stryCov_9fa48("4973"), {
        columnNames: stryMutAct_9fa48("4974") ? [] : (stryCov_9fa48("4974"), [stryMutAct_9fa48("4975") ? "" : (stryCov_9fa48("4975"), 'surveyId')]),
        referencedColumnNames: stryMutAct_9fa48("4976") ? [] : (stryCov_9fa48("4976"), [stryMutAct_9fa48("4977") ? "" : (stryCov_9fa48("4977"), 'id')]),
        referencedTableName: stryMutAct_9fa48("4978") ? "" : (stryCov_9fa48("4978"), 'surveys'),
        onDelete: stryMutAct_9fa48("4979") ? "" : (stryCov_9fa48("4979"), 'CASCADE')
      })));
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4980") ? {} : (stryCov_9fa48("4980"), {
        name: stryMutAct_9fa48("4981") ? "" : (stryCov_9fa48("4981"), 'survey_responses'),
        columns: stryMutAct_9fa48("4982") ? [] : (stryCov_9fa48("4982"), [stryMutAct_9fa48("4983") ? {} : (stryCov_9fa48("4983"), {
          name: stryMutAct_9fa48("4984") ? "" : (stryCov_9fa48("4984"), 'id'),
          type: stryMutAct_9fa48("4985") ? "" : (stryCov_9fa48("4985"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4986") ? false : (stryCov_9fa48("4986"), true),
          generationStrategy: stryMutAct_9fa48("4987") ? "" : (stryCov_9fa48("4987"), 'uuid'),
          default: stryMutAct_9fa48("4988") ? "" : (stryCov_9fa48("4988"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4989") ? {} : (stryCov_9fa48("4989"), {
          name: stryMutAct_9fa48("4990") ? "" : (stryCov_9fa48("4990"), 'surveyId'),
          type: stryMutAct_9fa48("4991") ? "" : (stryCov_9fa48("4991"), 'uuid')
        }), stryMutAct_9fa48("4992") ? {} : (stryCov_9fa48("4992"), {
          name: stryMutAct_9fa48("4993") ? "" : (stryCov_9fa48("4993"), 'userId'),
          type: stryMutAct_9fa48("4994") ? "" : (stryCov_9fa48("4994"), 'uuid')
        }), stryMutAct_9fa48("4995") ? {} : (stryCov_9fa48("4995"), {
          name: stryMutAct_9fa48("4996") ? "" : (stryCov_9fa48("4996"), 'answers'),
          type: stryMutAct_9fa48("4997") ? "" : (stryCov_9fa48("4997"), 'jsonb')
        }), stryMutAct_9fa48("4998") ? {} : (stryCov_9fa48("4998"), {
          name: stryMutAct_9fa48("4999") ? "" : (stryCov_9fa48("4999"), 'submittedAt'),
          type: stryMutAct_9fa48("5000") ? "" : (stryCov_9fa48("5000"), 'timestamp'),
          default: stryMutAct_9fa48("5001") ? "" : (stryCov_9fa48("5001"), 'CURRENT_TIMESTAMP')
        })])
      })), stryMutAct_9fa48("5002") ? false : (stryCov_9fa48("5002"), true));
      await queryRunner.createForeignKey(stryMutAct_9fa48("5003") ? "" : (stryCov_9fa48("5003"), 'survey_responses'), new TableForeignKey(stryMutAct_9fa48("5004") ? {} : (stryCov_9fa48("5004"), {
        columnNames: stryMutAct_9fa48("5005") ? [] : (stryCov_9fa48("5005"), [stryMutAct_9fa48("5006") ? "" : (stryCov_9fa48("5006"), 'surveyId')]),
        referencedColumnNames: stryMutAct_9fa48("5007") ? [] : (stryCov_9fa48("5007"), [stryMutAct_9fa48("5008") ? "" : (stryCov_9fa48("5008"), 'id')]),
        referencedTableName: stryMutAct_9fa48("5009") ? "" : (stryCov_9fa48("5009"), 'surveys'),
        onDelete: stryMutAct_9fa48("5010") ? "" : (stryCov_9fa48("5010"), 'CASCADE')
      })));
      await queryRunner.createForeignKey(stryMutAct_9fa48("5011") ? "" : (stryCov_9fa48("5011"), 'survey_responses'), new TableForeignKey(stryMutAct_9fa48("5012") ? {} : (stryCov_9fa48("5012"), {
        columnNames: stryMutAct_9fa48("5013") ? [] : (stryCov_9fa48("5013"), [stryMutAct_9fa48("5014") ? "" : (stryCov_9fa48("5014"), 'userId')]),
        referencedColumnNames: stryMutAct_9fa48("5015") ? [] : (stryCov_9fa48("5015"), [stryMutAct_9fa48("5016") ? "" : (stryCov_9fa48("5016"), 'id')]),
        referencedTableName: stryMutAct_9fa48("5017") ? "" : (stryCov_9fa48("5017"), 'users'),
        onDelete: stryMutAct_9fa48("5018") ? "" : (stryCov_9fa48("5018"), 'CASCADE')
      })));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("5019")) {
      {}
    } else {
      stryCov_9fa48("5019");
      await queryRunner.dropTable(stryMutAct_9fa48("5020") ? "" : (stryCov_9fa48("5020"), 'survey_responses'));
      await queryRunner.dropTable(stryMutAct_9fa48("5021") ? "" : (stryCov_9fa48("5021"), 'survey_questions'));
      await queryRunner.dropTable(stryMutAct_9fa48("5022") ? "" : (stryCov_9fa48("5022"), 'surveys'));
    }
  }
}