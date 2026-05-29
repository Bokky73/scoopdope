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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User)
  private repo: Repository<User>) {}
  findByEmail(email: string) {
    if (stryMutAct_9fa48("7275")) {
      {}
    } else {
      stryCov_9fa48("7275");
      return this.repo.findOne(stryMutAct_9fa48("7276") ? {} : (stryCov_9fa48("7276"), {
        where: stryMutAct_9fa48("7277") ? {} : (stryCov_9fa48("7277"), {
          email
        })
      }));
    }
  }
  findByVerificationToken(hash: string) {
    if (stryMutAct_9fa48("7278")) {
      {}
    } else {
      stryCov_9fa48("7278");
      return this.repo.findOne(stryMutAct_9fa48("7279") ? {} : (stryCov_9fa48("7279"), {
        where: stryMutAct_9fa48("7280") ? {} : (stryCov_9fa48("7280"), {
          verificationToken: hash
        })
      }));
    }
  }
  findById(id: string) {
    if (stryMutAct_9fa48("7281")) {
      {}
    } else {
      stryCov_9fa48("7281");
      return this.repo.findOne(stryMutAct_9fa48("7282") ? {} : (stryCov_9fa48("7282"), {
        where: stryMutAct_9fa48("7283") ? {} : (stryCov_9fa48("7283"), {
          id
        })
      }));
    }
  }
  findByStellarPublicKey(stellarPublicKey: string) {
    if (stryMutAct_9fa48("7284")) {
      {}
    } else {
      stryCov_9fa48("7284");
      return this.repo.findOne(stryMutAct_9fa48("7285") ? {} : (stryCov_9fa48("7285"), {
        where: stryMutAct_9fa48("7286") ? {} : (stryCov_9fa48("7286"), {
          stellarPublicKey
        })
      }));
    }
  }
  create(data: Partial<User>) {
    if (stryMutAct_9fa48("7287")) {
      {}
    } else {
      stryCov_9fa48("7287");
      return this.repo.save(this.repo.create(data));
    }
  }
  async update(id: string, data: Partial<User>) {
    if (stryMutAct_9fa48("7288")) {
      {}
    } else {
      stryCov_9fa48("7288");
      const user = await this.findById(id);
      if (stryMutAct_9fa48("7291") ? false : stryMutAct_9fa48("7290") ? true : stryMutAct_9fa48("7289") ? user : (stryCov_9fa48("7289", "7290", "7291"), !user)) throw new NotFoundException(stryMutAct_9fa48("7292") ? "" : (stryCov_9fa48("7292"), 'User not found'));
      return this.repo.save(stryMutAct_9fa48("7293") ? {} : (stryCov_9fa48("7293"), {
        ...user,
        ...data
      }));
    }
  }
  async findAll(options: {
    page?: number;
    limit?: number;
    role?: string;
    isVerified?: boolean;
    search?: string;
  } = {}) {
    if (stryMutAct_9fa48("7294")) {
      {}
    } else {
      stryCov_9fa48("7294");
      const {
        page = 1,
        limit = 10,
        role,
        isVerified,
        search
      } = options;
      const query = this.repo.createQueryBuilder(stryMutAct_9fa48("7295") ? "" : (stryCov_9fa48("7295"), 'user'));
      if (stryMutAct_9fa48("7297") ? false : stryMutAct_9fa48("7296") ? true : (stryCov_9fa48("7296", "7297"), role)) {
        if (stryMutAct_9fa48("7298")) {
          {}
        } else {
          stryCov_9fa48("7298");
          query.andWhere(stryMutAct_9fa48("7299") ? "" : (stryCov_9fa48("7299"), 'user.role = :role'), stryMutAct_9fa48("7300") ? {} : (stryCov_9fa48("7300"), {
            role
          }));
        }
      }
      if (stryMutAct_9fa48("7303") ? isVerified === undefined : stryMutAct_9fa48("7302") ? false : stryMutAct_9fa48("7301") ? true : (stryCov_9fa48("7301", "7302", "7303"), isVerified !== undefined)) {
        if (stryMutAct_9fa48("7304")) {
          {}
        } else {
          stryCov_9fa48("7304");
          query.andWhere(stryMutAct_9fa48("7305") ? "" : (stryCov_9fa48("7305"), 'user.isVerified = :isVerified'), stryMutAct_9fa48("7306") ? {} : (stryCov_9fa48("7306"), {
            isVerified
          }));
        }
      }
      if (stryMutAct_9fa48("7308") ? false : stryMutAct_9fa48("7307") ? true : (stryCov_9fa48("7307", "7308"), search)) {
        if (stryMutAct_9fa48("7309")) {
          {}
        } else {
          stryCov_9fa48("7309");
          query.andWhere(stryMutAct_9fa48("7310") ? "" : (stryCov_9fa48("7310"), 'user.email ILIKE :search'), stryMutAct_9fa48("7311") ? {} : (stryCov_9fa48("7311"), {
            search: stryMutAct_9fa48("7312") ? `` : (stryCov_9fa48("7312"), `%${search}%`)
          }));
        }
      }
      query.andWhere(stryMutAct_9fa48("7313") ? "" : (stryCov_9fa48("7313"), 'user.deletedAt IS NULL'));
      const [users, total] = await query.skip(stryMutAct_9fa48("7314") ? (page - 1) / limit : (stryCov_9fa48("7314"), (stryMutAct_9fa48("7315") ? page + 1 : (stryCov_9fa48("7315"), page - 1)) * limit)).take(limit).orderBy(stryMutAct_9fa48("7316") ? "" : (stryCov_9fa48("7316"), 'user.createdAt'), stryMutAct_9fa48("7317") ? "" : (stryCov_9fa48("7317"), 'DESC')).getManyAndCount();
      return stryMutAct_9fa48("7318") ? {} : (stryCov_9fa48("7318"), {
        data: users,
        meta: stryMutAct_9fa48("7319") ? {} : (stryCov_9fa48("7319"), {
          total,
          page,
          limit,
          totalPages: Math.ceil(stryMutAct_9fa48("7320") ? total * limit : (stryCov_9fa48("7320"), total / limit))
        })
      });
    }
  }
  async banUser(id: string, isBanned: boolean) {
    if (stryMutAct_9fa48("7321")) {
      {}
    } else {
      stryCov_9fa48("7321");
      const user = await this.findById(id);
      if (stryMutAct_9fa48("7324") ? false : stryMutAct_9fa48("7323") ? true : stryMutAct_9fa48("7322") ? user : (stryCov_9fa48("7322", "7323", "7324"), !user)) throw new NotFoundException(stryMutAct_9fa48("7325") ? "" : (stryCov_9fa48("7325"), 'User not found'));
      return this.repo.save(stryMutAct_9fa48("7326") ? {} : (stryCov_9fa48("7326"), {
        ...user,
        isBanned
      }));
    }
  }
  async changeRole(id: string, role: string) {
    if (stryMutAct_9fa48("7327")) {
      {}
    } else {
      stryCov_9fa48("7327");
      const user = await this.findById(id);
      if (stryMutAct_9fa48("7330") ? false : stryMutAct_9fa48("7329") ? true : stryMutAct_9fa48("7328") ? user : (stryCov_9fa48("7328", "7329", "7330"), !user)) throw new NotFoundException(stryMutAct_9fa48("7331") ? "" : (stryCov_9fa48("7331"), 'User not found'));
      return this.repo.save(stryMutAct_9fa48("7332") ? {} : (stryCov_9fa48("7332"), {
        ...user,
        role
      }));
    }
  }
  async softDelete(id: string) {
    if (stryMutAct_9fa48("7333")) {
      {}
    } else {
      stryCov_9fa48("7333");
      const user = await this.findById(id);
      if (stryMutAct_9fa48("7336") ? false : stryMutAct_9fa48("7335") ? true : stryMutAct_9fa48("7334") ? user : (stryCov_9fa48("7334", "7335", "7336"), !user)) throw new NotFoundException(stryMutAct_9fa48("7337") ? "" : (stryCov_9fa48("7337"), 'User not found'));
      return this.repo.save(stryMutAct_9fa48("7338") ? {} : (stryCov_9fa48("7338"), {
        ...user,
        deletedAt: new Date()
      }));
    }
  }
  findByReferralCode(code: string) {
    if (stryMutAct_9fa48("7339")) {
      {}
    } else {
      stryCov_9fa48("7339");
      return this.repo.findOne(stryMutAct_9fa48("7340") ? {} : (stryCov_9fa48("7340"), {
        where: stryMutAct_9fa48("7341") ? {} : (stryCov_9fa48("7341"), {
          referralCode: code
        })
      }));
    }
  }
  async getReferralStats(userId: string) {
    if (stryMutAct_9fa48("7342")) {
      {}
    } else {
      stryCov_9fa48("7342");
      const count = await this.repo.count(stryMutAct_9fa48("7343") ? {} : (stryCov_9fa48("7343"), {
        where: stryMutAct_9fa48("7344") ? {} : (stryCov_9fa48("7344"), {
          referredBy: userId
        })
      }));
      return stryMutAct_9fa48("7345") ? {} : (stryCov_9fa48("7345"), {
        referralCount: count,
        earnedBst: stryMutAct_9fa48("7346") ? count / 50 : (stryCov_9fa48("7346"), count * 50)
      });
    }
  }
}