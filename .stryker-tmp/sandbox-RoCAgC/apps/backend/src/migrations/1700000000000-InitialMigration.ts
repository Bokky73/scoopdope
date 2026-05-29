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
export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4580")) {
      {}
    } else {
      stryCov_9fa48("4580");
      // Create users table
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4581") ? {} : (stryCov_9fa48("4581"), {
        name: stryMutAct_9fa48("4582") ? "" : (stryCov_9fa48("4582"), 'users'),
        columns: stryMutAct_9fa48("4583") ? [] : (stryCov_9fa48("4583"), [stryMutAct_9fa48("4584") ? {} : (stryCov_9fa48("4584"), {
          name: stryMutAct_9fa48("4585") ? "" : (stryCov_9fa48("4585"), 'id'),
          type: stryMutAct_9fa48("4586") ? "" : (stryCov_9fa48("4586"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4587") ? false : (stryCov_9fa48("4587"), true),
          generationStrategy: stryMutAct_9fa48("4588") ? "" : (stryCov_9fa48("4588"), 'uuid'),
          default: stryMutAct_9fa48("4589") ? "" : (stryCov_9fa48("4589"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4590") ? {} : (stryCov_9fa48("4590"), {
          name: stryMutAct_9fa48("4591") ? "" : (stryCov_9fa48("4591"), 'email'),
          type: stryMutAct_9fa48("4592") ? "" : (stryCov_9fa48("4592"), 'varchar'),
          isUnique: stryMutAct_9fa48("4593") ? false : (stryCov_9fa48("4593"), true)
        }), stryMutAct_9fa48("4594") ? {} : (stryCov_9fa48("4594"), {
          name: stryMutAct_9fa48("4595") ? "" : (stryCov_9fa48("4595"), 'passwordHash'),
          type: stryMutAct_9fa48("4596") ? "" : (stryCov_9fa48("4596"), 'varchar')
        }), stryMutAct_9fa48("4597") ? {} : (stryCov_9fa48("4597"), {
          name: stryMutAct_9fa48("4598") ? "" : (stryCov_9fa48("4598"), 'stellarPublicKey'),
          type: stryMutAct_9fa48("4599") ? "" : (stryCov_9fa48("4599"), 'varchar'),
          isNullable: stryMutAct_9fa48("4600") ? false : (stryCov_9fa48("4600"), true)
        }), stryMutAct_9fa48("4601") ? {} : (stryCov_9fa48("4601"), {
          name: stryMutAct_9fa48("4602") ? "" : (stryCov_9fa48("4602"), 'role'),
          type: stryMutAct_9fa48("4603") ? "" : (stryCov_9fa48("4603"), 'varchar'),
          default: stryMutAct_9fa48("4604") ? "" : (stryCov_9fa48("4604"), "'student'")
        }), stryMutAct_9fa48("4605") ? {} : (stryCov_9fa48("4605"), {
          name: stryMutAct_9fa48("4606") ? "" : (stryCov_9fa48("4606"), 'isBanned'),
          type: stryMutAct_9fa48("4607") ? "" : (stryCov_9fa48("4607"), 'boolean'),
          default: stryMutAct_9fa48("4608") ? true : (stryCov_9fa48("4608"), false)
        }), stryMutAct_9fa48("4609") ? {} : (stryCov_9fa48("4609"), {
          name: stryMutAct_9fa48("4610") ? "" : (stryCov_9fa48("4610"), 'isVerified'),
          type: stryMutAct_9fa48("4611") ? "" : (stryCov_9fa48("4611"), 'boolean'),
          default: stryMutAct_9fa48("4612") ? true : (stryCov_9fa48("4612"), false)
        }), stryMutAct_9fa48("4613") ? {} : (stryCov_9fa48("4613"), {
          name: stryMutAct_9fa48("4614") ? "" : (stryCov_9fa48("4614"), 'deletedAt'),
          type: stryMutAct_9fa48("4615") ? "" : (stryCov_9fa48("4615"), 'timestamp'),
          isNullable: stryMutAct_9fa48("4616") ? false : (stryCov_9fa48("4616"), true)
        }), stryMutAct_9fa48("4617") ? {} : (stryCov_9fa48("4617"), {
          name: stryMutAct_9fa48("4618") ? "" : (stryCov_9fa48("4618"), 'createdAt'),
          type: stryMutAct_9fa48("4619") ? "" : (stryCov_9fa48("4619"), 'timestamp'),
          default: stryMutAct_9fa48("4620") ? "" : (stryCov_9fa48("4620"), 'now()')
        })])
      })), stryMutAct_9fa48("4621") ? false : (stryCov_9fa48("4621"), true));

      // Create courses table
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4622") ? {} : (stryCov_9fa48("4622"), {
        name: stryMutAct_9fa48("4623") ? "" : (stryCov_9fa48("4623"), 'courses'),
        columns: stryMutAct_9fa48("4624") ? [] : (stryCov_9fa48("4624"), [stryMutAct_9fa48("4625") ? {} : (stryCov_9fa48("4625"), {
          name: stryMutAct_9fa48("4626") ? "" : (stryCov_9fa48("4626"), 'id'),
          type: stryMutAct_9fa48("4627") ? "" : (stryCov_9fa48("4627"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4628") ? false : (stryCov_9fa48("4628"), true),
          generationStrategy: stryMutAct_9fa48("4629") ? "" : (stryCov_9fa48("4629"), 'uuid'),
          default: stryMutAct_9fa48("4630") ? "" : (stryCov_9fa48("4630"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4631") ? {} : (stryCov_9fa48("4631"), {
          name: stryMutAct_9fa48("4632") ? "" : (stryCov_9fa48("4632"), 'title'),
          type: stryMutAct_9fa48("4633") ? "" : (stryCov_9fa48("4633"), 'varchar')
        }), stryMutAct_9fa48("4634") ? {} : (stryCov_9fa48("4634"), {
          name: stryMutAct_9fa48("4635") ? "" : (stryCov_9fa48("4635"), 'description'),
          type: stryMutAct_9fa48("4636") ? "" : (stryCov_9fa48("4636"), 'text')
        }), stryMutAct_9fa48("4637") ? {} : (stryCov_9fa48("4637"), {
          name: stryMutAct_9fa48("4638") ? "" : (stryCov_9fa48("4638"), 'level'),
          type: stryMutAct_9fa48("4639") ? "" : (stryCov_9fa48("4639"), 'varchar'),
          default: stryMutAct_9fa48("4640") ? "" : (stryCov_9fa48("4640"), "'beginner'")
        }), stryMutAct_9fa48("4641") ? {} : (stryCov_9fa48("4641"), {
          name: stryMutAct_9fa48("4642") ? "" : (stryCov_9fa48("4642"), 'durationHours'),
          type: stryMutAct_9fa48("4643") ? "" : (stryCov_9fa48("4643"), 'int'),
          default: 0
        }), stryMutAct_9fa48("4644") ? {} : (stryCov_9fa48("4644"), {
          name: stryMutAct_9fa48("4645") ? "" : (stryCov_9fa48("4645"), 'isPublished'),
          type: stryMutAct_9fa48("4646") ? "" : (stryCov_9fa48("4646"), 'boolean'),
          default: stryMutAct_9fa48("4647") ? false : (stryCov_9fa48("4647"), true)
        }), stryMutAct_9fa48("4648") ? {} : (stryCov_9fa48("4648"), {
          name: stryMutAct_9fa48("4649") ? "" : (stryCov_9fa48("4649"), 'createdAt'),
          type: stryMutAct_9fa48("4650") ? "" : (stryCov_9fa48("4650"), 'timestamp'),
          default: stryMutAct_9fa48("4651") ? "" : (stryCov_9fa48("4651"), 'now()')
        })])
      })), stryMutAct_9fa48("4652") ? false : (stryCov_9fa48("4652"), true));

      // Create notifications table
      await queryRunner.createTable(new Table(stryMutAct_9fa48("4653") ? {} : (stryCov_9fa48("4653"), {
        name: stryMutAct_9fa48("4654") ? "" : (stryCov_9fa48("4654"), 'notifications'),
        columns: stryMutAct_9fa48("4655") ? [] : (stryCov_9fa48("4655"), [stryMutAct_9fa48("4656") ? {} : (stryCov_9fa48("4656"), {
          name: stryMutAct_9fa48("4657") ? "" : (stryCov_9fa48("4657"), 'id'),
          type: stryMutAct_9fa48("4658") ? "" : (stryCov_9fa48("4658"), 'uuid'),
          isPrimary: stryMutAct_9fa48("4659") ? false : (stryCov_9fa48("4659"), true),
          generationStrategy: stryMutAct_9fa48("4660") ? "" : (stryCov_9fa48("4660"), 'uuid'),
          default: stryMutAct_9fa48("4661") ? "" : (stryCov_9fa48("4661"), 'uuid_generate_v4()')
        }), stryMutAct_9fa48("4662") ? {} : (stryCov_9fa48("4662"), {
          name: stryMutAct_9fa48("4663") ? "" : (stryCov_9fa48("4663"), 'userId'),
          type: stryMutAct_9fa48("4664") ? "" : (stryCov_9fa48("4664"), 'varchar')
        }), stryMutAct_9fa48("4665") ? {} : (stryCov_9fa48("4665"), {
          name: stryMutAct_9fa48("4666") ? "" : (stryCov_9fa48("4666"), 'type'),
          type: stryMutAct_9fa48("4667") ? "" : (stryCov_9fa48("4667"), 'enum'),
          enum: stryMutAct_9fa48("4668") ? [] : (stryCov_9fa48("4668"), [stryMutAct_9fa48("4669") ? "" : (stryCov_9fa48("4669"), 'enrollment'), stryMutAct_9fa48("4670") ? "" : (stryCov_9fa48("4670"), 'completion'), stryMutAct_9fa48("4671") ? "" : (stryCov_9fa48("4671"), 'credential_issued')])
        }), stryMutAct_9fa48("4672") ? {} : (stryCov_9fa48("4672"), {
          name: stryMutAct_9fa48("4673") ? "" : (stryCov_9fa48("4673"), 'message'),
          type: stryMutAct_9fa48("4674") ? "" : (stryCov_9fa48("4674"), 'varchar')
        }), stryMutAct_9fa48("4675") ? {} : (stryCov_9fa48("4675"), {
          name: stryMutAct_9fa48("4676") ? "" : (stryCov_9fa48("4676"), 'isRead'),
          type: stryMutAct_9fa48("4677") ? "" : (stryCov_9fa48("4677"), 'boolean'),
          default: stryMutAct_9fa48("4678") ? true : (stryCov_9fa48("4678"), false)
        }), stryMutAct_9fa48("4679") ? {} : (stryCov_9fa48("4679"), {
          name: stryMutAct_9fa48("4680") ? "" : (stryCov_9fa48("4680"), 'createdAt'),
          type: stryMutAct_9fa48("4681") ? "" : (stryCov_9fa48("4681"), 'timestamp'),
          default: stryMutAct_9fa48("4682") ? "" : (stryCov_9fa48("4682"), 'now()')
        })])
      })), stryMutAct_9fa48("4683") ? false : (stryCov_9fa48("4683"), true));
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    if (stryMutAct_9fa48("4684")) {
      {}
    } else {
      stryCov_9fa48("4684");
      await queryRunner.dropTable(stryMutAct_9fa48("4685") ? "" : (stryCov_9fa48("4685"), 'notifications'));
      await queryRunner.dropTable(stryMutAct_9fa48("4686") ? "" : (stryCov_9fa48("4686"), 'courses'));
      await queryRunner.dropTable(stryMutAct_9fa48("4687") ? "" : (stryCov_9fa48("4687"), 'users'));
    }
  }
}