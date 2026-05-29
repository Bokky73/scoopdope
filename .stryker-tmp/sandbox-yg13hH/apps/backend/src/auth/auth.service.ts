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
import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { ApiKey } from './api-key.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { generateSecret, generateSync, verifySync, generateURI } from 'otplib';
import * as qrcode from 'qrcode';
import { EncryptionService } from '../common/encryption.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService, private mailService: MailService, @InjectRepository(PasswordResetToken)
  private resetTokenRepo: Repository<PasswordResetToken>, @InjectRepository(RefreshToken)
  private refreshTokenRepo: Repository<RefreshToken>, @InjectRepository(ApiKey)
  private apiKeyRepo: Repository<ApiKey>, private encryptionService: EncryptionService, private auditService: AuditService) {}
  async register(email: string, password: string, refCode?: string) {
    if (stryMutAct_9fa48("843")) {
      {}
    } else {
      stryCov_9fa48("843");
      const existing = await this.usersService.findByEmail(email);
      if (stryMutAct_9fa48("845") ? false : stryMutAct_9fa48("844") ? true : (stryCov_9fa48("844", "845"), existing)) throw new BadRequestException(stryMutAct_9fa48("846") ? "" : (stryCov_9fa48("846"), 'Email already in use'));
      const passwordHash = await bcrypt.hash(password, 10);
      const {
        token,
        hash,
        expiresAt
      } = this.generateOpaqueToken(24);
      const referralCode = crypto.randomBytes(6).toString(stryMutAct_9fa48("847") ? "" : (stryCov_9fa48("847"), 'hex'));
      let referredBy: string | null = null;
      if (stryMutAct_9fa48("849") ? false : stryMutAct_9fa48("848") ? true : (stryCov_9fa48("848", "849"), refCode)) {
        if (stryMutAct_9fa48("850")) {
          {}
        } else {
          stryCov_9fa48("850");
          const referrer = await this.usersService.findByReferralCode(refCode);
          if (stryMutAct_9fa48("852") ? false : stryMutAct_9fa48("851") ? true : (stryCov_9fa48("851", "852"), referrer)) referredBy = referrer.id;
        }
      }
      const user = await this.usersService.create(stryMutAct_9fa48("853") ? {} : (stryCov_9fa48("853"), {
        email,
        passwordHash,
        isVerified: stryMutAct_9fa48("854") ? true : (stryCov_9fa48("854"), false),
        verificationToken: hash,
        verificationTokenExpiresAt: expiresAt,
        referralCode,
        referredBy
      }));
      await this.mailService.sendVerificationEmail(user.email, token);
      await this.auditService.log(AuditAction.REGISTER, user.id, stryMutAct_9fa48("855") ? false : (stryCov_9fa48("855"), true), stryMutAct_9fa48("856") ? {} : (stryCov_9fa48("856"), {
        email
      }));
      return stryMutAct_9fa48("857") ? {} : (stryCov_9fa48("857"), {
        message: stryMutAct_9fa48("858") ? "" : (stryCov_9fa48("858"), 'Registration successful. Please verify your email.')
      });
    }
  }
  async login(email: string, password: string, mfaToken?: string, ipAddress?: string, userAgent?: string) {
    if (stryMutAct_9fa48("859")) {
      {}
    } else {
      stryCov_9fa48("859");
      const user = await this.usersService.findByEmail(email);
      if (stryMutAct_9fa48("862") ? !user && !(await bcrypt.compare(password, user.passwordHash)) : stryMutAct_9fa48("861") ? false : stryMutAct_9fa48("860") ? true : (stryCov_9fa48("860", "861", "862"), (stryMutAct_9fa48("863") ? user : (stryCov_9fa48("863"), !user)) || (stryMutAct_9fa48("864") ? await bcrypt.compare(password, user.passwordHash) : (stryCov_9fa48("864"), !(await bcrypt.compare(password, user.passwordHash)))))) {
        if (stryMutAct_9fa48("865")) {
          {}
        } else {
          stryCov_9fa48("865");
          await this.auditService.log(AuditAction.LOGIN_FAILURE, null, stryMutAct_9fa48("866") ? true : (stryCov_9fa48("866"), false), stryMutAct_9fa48("867") ? {} : (stryCov_9fa48("867"), {
            email
          }), ipAddress, userAgent);
          throw new UnauthorizedException(stryMutAct_9fa48("868") ? "" : (stryCov_9fa48("868"), 'Invalid credentials'));
        }
      }
      if (stryMutAct_9fa48("870") ? false : stryMutAct_9fa48("869") ? true : (stryCov_9fa48("869", "870"), user.isBanned)) {
        if (stryMutAct_9fa48("871")) {
          {}
        } else {
          stryCov_9fa48("871");
          await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, stryMutAct_9fa48("872") ? true : (stryCov_9fa48("872"), false), stryMutAct_9fa48("873") ? {} : (stryCov_9fa48("873"), {
            reason: stryMutAct_9fa48("874") ? "" : (stryCov_9fa48("874"), 'banned')
          }), ipAddress, userAgent);
          throw new UnauthorizedException(stryMutAct_9fa48("875") ? "" : (stryCov_9fa48("875"), 'Account is banned'));
        }
      }
      if (stryMutAct_9fa48("878") ? false : stryMutAct_9fa48("877") ? true : stryMutAct_9fa48("876") ? user.isVerified : (stryCov_9fa48("876", "877", "878"), !user.isVerified)) {
        if (stryMutAct_9fa48("879")) {
          {}
        } else {
          stryCov_9fa48("879");
          await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, stryMutAct_9fa48("880") ? true : (stryCov_9fa48("880"), false), stryMutAct_9fa48("881") ? {} : (stryCov_9fa48("881"), {
            reason: stryMutAct_9fa48("882") ? "" : (stryCov_9fa48("882"), 'unverified')
          }), ipAddress, userAgent);
          throw new ForbiddenException(stryMutAct_9fa48("883") ? "" : (stryCov_9fa48("883"), 'Please verify your email before logging in'));
        }
      }

      // Enforce 2FA for admin accounts
      if (stryMutAct_9fa48("886") ? user.role === 'admin' || !user.mfaEnabled : stryMutAct_9fa48("885") ? false : stryMutAct_9fa48("884") ? true : (stryCov_9fa48("884", "885", "886"), (stryMutAct_9fa48("888") ? user.role !== 'admin' : stryMutAct_9fa48("887") ? true : (stryCov_9fa48("887", "888"), user.role === (stryMutAct_9fa48("889") ? "" : (stryCov_9fa48("889"), 'admin')))) && (stryMutAct_9fa48("890") ? user.mfaEnabled : (stryCov_9fa48("890"), !user.mfaEnabled)))) {
        if (stryMutAct_9fa48("891")) {
          {}
        } else {
          stryCov_9fa48("891");
          await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, stryMutAct_9fa48("892") ? true : (stryCov_9fa48("892"), false), stryMutAct_9fa48("893") ? {} : (stryCov_9fa48("893"), {
            reason: stryMutAct_9fa48("894") ? "" : (stryCov_9fa48("894"), 'mfa_required')
          }), ipAddress, userAgent);
          throw new ForbiddenException(stryMutAct_9fa48("895") ? "" : (stryCov_9fa48("895"), 'Admin accounts must enable 2FA before logging in'));
        }
      }
      if (stryMutAct_9fa48("897") ? false : stryMutAct_9fa48("896") ? true : (stryCov_9fa48("896", "897"), user.mfaEnabled)) {
        if (stryMutAct_9fa48("898")) {
          {}
        } else {
          stryCov_9fa48("898");
          if (stryMutAct_9fa48("901") ? false : stryMutAct_9fa48("900") ? true : stryMutAct_9fa48("899") ? mfaToken : (stryCov_9fa48("899", "900", "901"), !mfaToken)) {
            if (stryMutAct_9fa48("902")) {
              {}
            } else {
              stryCov_9fa48("902");
              return stryMutAct_9fa48("903") ? {} : (stryCov_9fa48("903"), {
                mfa_required: stryMutAct_9fa48("904") ? false : (stryCov_9fa48("904"), true)
              });
            }
          }

          // Try TOTP first, then backup codes
          const secret = this.encryptionService.decrypt(stryMutAct_9fa48("907") ? user.mfaSecret && '' : stryMutAct_9fa48("906") ? false : stryMutAct_9fa48("905") ? true : (stryCov_9fa48("905", "906", "907"), user.mfaSecret || (stryMutAct_9fa48("908") ? "Stryker was here!" : (stryCov_9fa48("908"), ''))));
          const totpResult = verifySync(stryMutAct_9fa48("909") ? {} : (stryCov_9fa48("909"), {
            token: mfaToken,
            secret
          }));
          const totpValid = stryMutAct_9fa48("912") ? totpResult || totpResult.valid : stryMutAct_9fa48("911") ? false : stryMutAct_9fa48("910") ? true : (stryCov_9fa48("910", "911", "912"), totpResult && totpResult.valid);
          if (stryMutAct_9fa48("915") ? false : stryMutAct_9fa48("914") ? true : stryMutAct_9fa48("913") ? totpValid : (stryCov_9fa48("913", "914", "915"), !totpValid)) {
            if (stryMutAct_9fa48("916")) {
              {}
            } else {
              stryCov_9fa48("916");
              // Try backup code
              const used = await this.useBackupCode(user.id, mfaToken);
              if (stryMutAct_9fa48("919") ? false : stryMutAct_9fa48("918") ? true : stryMutAct_9fa48("917") ? used : (stryCov_9fa48("917", "918", "919"), !used)) {
                if (stryMutAct_9fa48("920")) {
                  {}
                } else {
                  stryCov_9fa48("920");
                  await this.auditService.log(AuditAction.LOGIN_FAILURE, user.id, stryMutAct_9fa48("921") ? true : (stryCov_9fa48("921"), false), stryMutAct_9fa48("922") ? {} : (stryCov_9fa48("922"), {
                    reason: stryMutAct_9fa48("923") ? "" : (stryCov_9fa48("923"), 'invalid_mfa')
                  }), ipAddress, userAgent);
                  throw new UnauthorizedException(stryMutAct_9fa48("924") ? "" : (stryCov_9fa48("924"), 'Invalid MFA token'));
                }
              }
            }
          }
        }
      }
      const result = await this.issueTokenPair(user.id, user.email, user.role);
      await this.auditService.log(AuditAction.LOGIN_SUCCESS, user.id, stryMutAct_9fa48("925") ? false : (stryCov_9fa48("925"), true), {}, ipAddress, userAgent);
      return result;
    }
  }
  async refresh(rawRefreshToken: string) {
    if (stryMutAct_9fa48("926")) {
      {}
    } else {
      stryCov_9fa48("926");
      const hash = this.hashToken(rawRefreshToken);
      const stored = await this.refreshTokenRepo.findOne(stryMutAct_9fa48("927") ? {} : (stryCov_9fa48("927"), {
        where: stryMutAct_9fa48("928") ? {} : (stryCov_9fa48("928"), {
          tokenHash: hash,
          revoked: stryMutAct_9fa48("929") ? true : (stryCov_9fa48("929"), false)
        })
      }));
      if (stryMutAct_9fa48("932") ? false : stryMutAct_9fa48("931") ? true : stryMutAct_9fa48("930") ? stored : (stryCov_9fa48("930", "931", "932"), !stored)) throw new UnauthorizedException(stryMutAct_9fa48("933") ? "" : (stryCov_9fa48("933"), 'Invalid or revoked refresh token'));
      if (stryMutAct_9fa48("937") ? stored.expiresAt >= new Date() : stryMutAct_9fa48("936") ? stored.expiresAt <= new Date() : stryMutAct_9fa48("935") ? false : stryMutAct_9fa48("934") ? true : (stryCov_9fa48("934", "935", "936", "937"), stored.expiresAt < new Date())) {
        if (stryMutAct_9fa48("938")) {
          {}
        } else {
          stryCov_9fa48("938");
          throw new UnauthorizedException(stryMutAct_9fa48("939") ? "" : (stryCov_9fa48("939"), 'Refresh token has expired'));
        }
      }

      // Revoke old token (rotation)
      await this.refreshTokenRepo.save(stryMutAct_9fa48("940") ? {} : (stryCov_9fa48("940"), {
        ...stored,
        revoked: stryMutAct_9fa48("941") ? false : (stryCov_9fa48("941"), true)
      }));
      const user = await this.usersService.findById(stored.userId);
      if (stryMutAct_9fa48("944") ? false : stryMutAct_9fa48("943") ? true : stryMutAct_9fa48("942") ? user : (stryCov_9fa48("942", "943", "944"), !user)) throw new UnauthorizedException(stryMutAct_9fa48("945") ? "" : (stryCov_9fa48("945"), 'User not found'));
      return this.issueTokenPair(user.id, user.email, user.role);
    }
  }
  async logout(rawRefreshToken: string, userId?: string) {
    if (stryMutAct_9fa48("946")) {
      {}
    } else {
      stryCov_9fa48("946");
      const hash = this.hashToken(rawRefreshToken);
      const stored = await this.refreshTokenRepo.findOne(stryMutAct_9fa48("947") ? {} : (stryCov_9fa48("947"), {
        where: stryMutAct_9fa48("948") ? {} : (stryCov_9fa48("948"), {
          tokenHash: hash,
          revoked: stryMutAct_9fa48("949") ? true : (stryCov_9fa48("949"), false)
        })
      }));
      if (stryMutAct_9fa48("951") ? false : stryMutAct_9fa48("950") ? true : (stryCov_9fa48("950", "951"), stored)) {
        if (stryMutAct_9fa48("952")) {
          {}
        } else {
          stryCov_9fa48("952");
          await this.refreshTokenRepo.save(stryMutAct_9fa48("953") ? {} : (stryCov_9fa48("953"), {
            ...stored,
            revoked: stryMutAct_9fa48("954") ? false : (stryCov_9fa48("954"), true)
          }));
        }
      }
      await this.auditService.log(AuditAction.LOGOUT, stryMutAct_9fa48("957") ? (userId || stored?.userId) && null : stryMutAct_9fa48("956") ? false : stryMutAct_9fa48("955") ? true : (stryCov_9fa48("955", "956", "957"), (stryMutAct_9fa48("959") ? userId && stored?.userId : stryMutAct_9fa48("958") ? false : (stryCov_9fa48("958", "959"), userId || (stryMutAct_9fa48("960") ? stored.userId : (stryCov_9fa48("960"), stored?.userId)))) || null), stryMutAct_9fa48("961") ? false : (stryCov_9fa48("961"), true));
      return stryMutAct_9fa48("962") ? {} : (stryCov_9fa48("962"), {
        message: stryMutAct_9fa48("963") ? "" : (stryCov_9fa48("963"), 'Logged out successfully.')
      });
    }
  }
  async verifyEmail(token: string) {
    if (stryMutAct_9fa48("964")) {
      {}
    } else {
      stryCov_9fa48("964");
      const hash = this.hashToken(token);
      const user = await this.usersService.findByVerificationToken(hash);
      if (stryMutAct_9fa48("967") ? false : stryMutAct_9fa48("966") ? true : stryMutAct_9fa48("965") ? user : (stryCov_9fa48("965", "966", "967"), !user)) throw new BadRequestException(stryMutAct_9fa48("968") ? "" : (stryCov_9fa48("968"), 'Invalid or expired verification token'));
      if (stryMutAct_9fa48("971") ? !user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date() : stryMutAct_9fa48("970") ? false : stryMutAct_9fa48("969") ? true : (stryCov_9fa48("969", "970", "971"), (stryMutAct_9fa48("972") ? user.verificationTokenExpiresAt : (stryCov_9fa48("972"), !user.verificationTokenExpiresAt)) || (stryMutAct_9fa48("975") ? user.verificationTokenExpiresAt >= new Date() : stryMutAct_9fa48("974") ? user.verificationTokenExpiresAt <= new Date() : stryMutAct_9fa48("973") ? false : (stryCov_9fa48("973", "974", "975"), user.verificationTokenExpiresAt < new Date())))) {
        if (stryMutAct_9fa48("976")) {
          {}
        } else {
          stryCov_9fa48("976");
          throw new BadRequestException(stryMutAct_9fa48("977") ? "" : (stryCov_9fa48("977"), 'Verification token has expired'));
        }
      }
      await this.usersService.update(user.id, stryMutAct_9fa48("978") ? {} : (stryCov_9fa48("978"), {
        isVerified: stryMutAct_9fa48("979") ? false : (stryCov_9fa48("979"), true),
        verificationToken: null,
        verificationTokenExpiresAt: null
      }));
      return stryMutAct_9fa48("980") ? {} : (stryCov_9fa48("980"), {
        message: stryMutAct_9fa48("981") ? "" : (stryCov_9fa48("981"), 'Email verified successfully. You can now log in.')
      });
    }
  }
  async resendVerification(email: string) {
    if (stryMutAct_9fa48("982")) {
      {}
    } else {
      stryCov_9fa48("982");
      const user = await this.usersService.findByEmail(email);
      if (stryMutAct_9fa48("985") ? false : stryMutAct_9fa48("984") ? true : stryMutAct_9fa48("983") ? user : (stryCov_9fa48("983", "984", "985"), !user)) throw new NotFoundException(stryMutAct_9fa48("986") ? "" : (stryCov_9fa48("986"), 'User not found'));
      if (stryMutAct_9fa48("988") ? false : stryMutAct_9fa48("987") ? true : (stryCov_9fa48("987", "988"), user.isVerified)) throw new BadRequestException(stryMutAct_9fa48("989") ? "" : (stryCov_9fa48("989"), 'Email is already verified'));
      const {
        token,
        hash,
        expiresAt
      } = this.generateOpaqueToken(24);
      await this.usersService.update(user.id, stryMutAct_9fa48("990") ? {} : (stryCov_9fa48("990"), {
        verificationToken: hash,
        verificationTokenExpiresAt: expiresAt
      }));
      await this.mailService.sendVerificationEmail(user.email, token);
      return stryMutAct_9fa48("991") ? {} : (stryCov_9fa48("991"), {
        message: stryMutAct_9fa48("992") ? "" : (stryCov_9fa48("992"), 'Verification email resent.')
      });
    }
  }
  async forgotPassword(email: string) {
    if (stryMutAct_9fa48("993")) {
      {}
    } else {
      stryCov_9fa48("993");
      const user = await this.usersService.findByEmail(email);
      if (stryMutAct_9fa48("996") ? false : stryMutAct_9fa48("995") ? true : stryMutAct_9fa48("994") ? user : (stryCov_9fa48("994", "995", "996"), !user)) return stryMutAct_9fa48("997") ? {} : (stryCov_9fa48("997"), {
        message: stryMutAct_9fa48("998") ? "" : (stryCov_9fa48("998"), 'If that email exists, a reset link has been sent.')
      });
      const oneHourAgo = new Date(stryMutAct_9fa48("999") ? Date.now() + 60 * 60 * 1000 : (stryCov_9fa48("999"), Date.now() - (stryMutAct_9fa48("1000") ? 60 * 60 / 1000 : (stryCov_9fa48("1000"), (stryMutAct_9fa48("1001") ? 60 / 60 : (stryCov_9fa48("1001"), 60 * 60)) * 1000))));
      const recentTokens = await this.resetTokenRepo.createQueryBuilder(stryMutAct_9fa48("1002") ? "" : (stryCov_9fa48("1002"), 't')).where(stryMutAct_9fa48("1003") ? "" : (stryCov_9fa48("1003"), 't.userId = :userId'), stryMutAct_9fa48("1004") ? {} : (stryCov_9fa48("1004"), {
        userId: user.id
      })).andWhere(stryMutAct_9fa48("1005") ? "" : (stryCov_9fa48("1005"), 't.createdAt > :since'), stryMutAct_9fa48("1006") ? {} : (stryCov_9fa48("1006"), {
        since: oneHourAgo
      })).getCount();
      if (stryMutAct_9fa48("1010") ? recentTokens < 3 : stryMutAct_9fa48("1009") ? recentTokens > 3 : stryMutAct_9fa48("1008") ? false : stryMutAct_9fa48("1007") ? true : (stryCov_9fa48("1007", "1008", "1009", "1010"), recentTokens >= 3)) {
        if (stryMutAct_9fa48("1011")) {
          {}
        } else {
          stryCov_9fa48("1011");
          throw new BadRequestException(stryMutAct_9fa48("1012") ? "" : (stryCov_9fa48("1012"), 'Too many reset requests. Please wait before trying again.'));
        }
      }
      const {
        token,
        hash,
        expiresAt
      } = this.generateOpaqueToken(1);
      await this.resetTokenRepo.save(this.resetTokenRepo.create(stryMutAct_9fa48("1013") ? {} : (stryCov_9fa48("1013"), {
        tokenHash: hash,
        userId: user.id,
        expiresAt,
        used: stryMutAct_9fa48("1014") ? true : (stryCov_9fa48("1014"), false)
      })));
      await this.mailService.sendPasswordResetEmail(user.email, token);
      await this.auditService.log(AuditAction.PASSWORD_RESET_REQUEST, user.id, stryMutAct_9fa48("1015") ? false : (stryCov_9fa48("1015"), true), stryMutAct_9fa48("1016") ? {} : (stryCov_9fa48("1016"), {
        email
      }));
      return stryMutAct_9fa48("1017") ? {} : (stryCov_9fa48("1017"), {
        message: stryMutAct_9fa48("1018") ? "" : (stryCov_9fa48("1018"), 'If that email exists, a reset link has been sent.')
      });
    }
  }
  async resetPassword(token: string, newPassword: string) {
    if (stryMutAct_9fa48("1019")) {
      {}
    } else {
      stryCov_9fa48("1019");
      const hash = this.hashToken(token);
      const resetToken = await this.resetTokenRepo.findOne(stryMutAct_9fa48("1020") ? {} : (stryCov_9fa48("1020"), {
        where: stryMutAct_9fa48("1021") ? {} : (stryCov_9fa48("1021"), {
          tokenHash: hash,
          used: stryMutAct_9fa48("1022") ? true : (stryCov_9fa48("1022"), false)
        })
      }));
      if (stryMutAct_9fa48("1025") ? false : stryMutAct_9fa48("1024") ? true : stryMutAct_9fa48("1023") ? resetToken : (stryCov_9fa48("1023", "1024", "1025"), !resetToken)) throw new BadRequestException(stryMutAct_9fa48("1026") ? "" : (stryCov_9fa48("1026"), 'Invalid or expired reset token'));
      if (stryMutAct_9fa48("1030") ? resetToken.expiresAt >= new Date() : stryMutAct_9fa48("1029") ? resetToken.expiresAt <= new Date() : stryMutAct_9fa48("1028") ? false : stryMutAct_9fa48("1027") ? true : (stryCov_9fa48("1027", "1028", "1029", "1030"), resetToken.expiresAt < new Date())) {
        if (stryMutAct_9fa48("1031")) {
          {}
        } else {
          stryCov_9fa48("1031");
          throw new BadRequestException(stryMutAct_9fa48("1032") ? "" : (stryCov_9fa48("1032"), 'Reset token has expired'));
        }
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(resetToken.userId, stryMutAct_9fa48("1033") ? {} : (stryCov_9fa48("1033"), {
        passwordHash
      }));
      await this.resetTokenRepo.save(stryMutAct_9fa48("1034") ? {} : (stryCov_9fa48("1034"), {
        ...resetToken,
        used: stryMutAct_9fa48("1035") ? false : (stryCov_9fa48("1035"), true)
      }));
      await this.auditService.log(AuditAction.PASSWORD_RESET_COMPLETE, resetToken.userId, stryMutAct_9fa48("1036") ? false : (stryCov_9fa48("1036"), true));
      return stryMutAct_9fa48("1037") ? {} : (stryCov_9fa48("1037"), {
        message: stryMutAct_9fa48("1038") ? "" : (stryCov_9fa48("1038"), 'Password reset successfully. You can now log in.')
      });
    }
  }
  async generateMfaSecret(userId: string) {
    if (stryMutAct_9fa48("1039")) {
      {}
    } else {
      stryCov_9fa48("1039");
      const user = await this.usersService.findById(userId);
      if (stryMutAct_9fa48("1042") ? false : stryMutAct_9fa48("1041") ? true : stryMutAct_9fa48("1040") ? user : (stryCov_9fa48("1040", "1041", "1042"), !user)) throw new NotFoundException(stryMutAct_9fa48("1043") ? "" : (stryCov_9fa48("1043"), 'User not found'));
      const secret = generateSecret();
      const otpauthUrl = generateURI(stryMutAct_9fa48("1044") ? {} : (stryCov_9fa48("1044"), {
        label: user.email,
        issuer: stryMutAct_9fa48("1045") ? "" : (stryCov_9fa48("1045"), 'scoopdope'),
        secret
      }));
      const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
      await this.usersService.update(userId, stryMutAct_9fa48("1046") ? {} : (stryCov_9fa48("1046"), {
        mfaSecret: this.encryptionService.encrypt(secret),
        mfaEnabled: stryMutAct_9fa48("1047") ? true : (stryCov_9fa48("1047"), false)
      }));
      return stryMutAct_9fa48("1048") ? {} : (stryCov_9fa48("1048"), {
        secret,
        qrCodeDataUrl
      });
    }
  }
  async verifyMfaSecret(userId: string, code: string) {
    if (stryMutAct_9fa48("1049")) {
      {}
    } else {
      stryCov_9fa48("1049");
      const user = await this.usersService.findById(userId);
      if (stryMutAct_9fa48("1052") ? !user && !user.mfaSecret : stryMutAct_9fa48("1051") ? false : stryMutAct_9fa48("1050") ? true : (stryCov_9fa48("1050", "1051", "1052"), (stryMutAct_9fa48("1053") ? user : (stryCov_9fa48("1053"), !user)) || (stryMutAct_9fa48("1054") ? user.mfaSecret : (stryCov_9fa48("1054"), !user.mfaSecret)))) throw new BadRequestException(stryMutAct_9fa48("1055") ? "" : (stryCov_9fa48("1055"), 'MFA setup not initiated'));
      const secret = this.encryptionService.decrypt(user.mfaSecret);
      const result = verifySync(stryMutAct_9fa48("1056") ? {} : (stryCov_9fa48("1056"), {
        token: code,
        secret
      }));
      if (stryMutAct_9fa48("1059") ? false : stryMutAct_9fa48("1058") ? true : stryMutAct_9fa48("1057") ? result?.valid : (stryCov_9fa48("1057", "1058", "1059"), !(stryMutAct_9fa48("1060") ? result.valid : (stryCov_9fa48("1060"), result?.valid)))) throw new BadRequestException(stryMutAct_9fa48("1061") ? "" : (stryCov_9fa48("1061"), 'Invalid MFA code'));
      const backupCodes = this.generateBackupCodes();
      await this.usersService.update(userId, stryMutAct_9fa48("1062") ? {} : (stryCov_9fa48("1062"), {
        mfaEnabled: stryMutAct_9fa48("1063") ? false : (stryCov_9fa48("1063"), true),
        mfaBackupCodes: backupCodes.map(stryMutAct_9fa48("1064") ? () => undefined : (stryCov_9fa48("1064"), c => crypto.createHash(stryMutAct_9fa48("1065") ? "" : (stryCov_9fa48("1065"), 'sha256')).update(c).digest(stryMutAct_9fa48("1066") ? "" : (stryCov_9fa48("1066"), 'hex'))))
      }));
      await this.auditService.log(AuditAction.MFA_ENABLED, userId, stryMutAct_9fa48("1067") ? false : (stryCov_9fa48("1067"), true));
      return stryMutAct_9fa48("1068") ? {} : (stryCov_9fa48("1068"), {
        message: stryMutAct_9fa48("1069") ? "" : (stryCov_9fa48("1069"), 'MFA enabled successfully'),
        backupCodes
      });
    }
  }
  async disableMfa(userId: string, code: string) {
    if (stryMutAct_9fa48("1070")) {
      {}
    } else {
      stryCov_9fa48("1070");
      const user = await this.usersService.findById(userId);
      if (stryMutAct_9fa48("1073") ? (!user || !user.mfaEnabled) && !user.mfaSecret : stryMutAct_9fa48("1072") ? false : stryMutAct_9fa48("1071") ? true : (stryCov_9fa48("1071", "1072", "1073"), (stryMutAct_9fa48("1075") ? !user && !user.mfaEnabled : stryMutAct_9fa48("1074") ? false : (stryCov_9fa48("1074", "1075"), (stryMutAct_9fa48("1076") ? user : (stryCov_9fa48("1076"), !user)) || (stryMutAct_9fa48("1077") ? user.mfaEnabled : (stryCov_9fa48("1077"), !user.mfaEnabled)))) || (stryMutAct_9fa48("1078") ? user.mfaSecret : (stryCov_9fa48("1078"), !user.mfaSecret)))) {
        if (stryMutAct_9fa48("1079")) {
          {}
        } else {
          stryCov_9fa48("1079");
          throw new BadRequestException(stryMutAct_9fa48("1080") ? "" : (stryCov_9fa48("1080"), 'MFA is not enabled'));
        }
      }
      const secret = this.encryptionService.decrypt(user.mfaSecret);
      const result = verifySync(stryMutAct_9fa48("1081") ? {} : (stryCov_9fa48("1081"), {
        token: code,
        secret
      }));
      if (stryMutAct_9fa48("1084") ? false : stryMutAct_9fa48("1083") ? true : stryMutAct_9fa48("1082") ? result?.valid : (stryCov_9fa48("1082", "1083", "1084"), !(stryMutAct_9fa48("1085") ? result.valid : (stryCov_9fa48("1085"), result?.valid)))) throw new BadRequestException(stryMutAct_9fa48("1086") ? "" : (stryCov_9fa48("1086"), 'Invalid MFA code'));
      await this.usersService.update(userId, stryMutAct_9fa48("1087") ? {} : (stryCov_9fa48("1087"), {
        mfaEnabled: stryMutAct_9fa48("1088") ? true : (stryCov_9fa48("1088"), false),
        mfaSecret: null,
        mfaBackupCodes: stryMutAct_9fa48("1089") ? ["Stryker was here"] : (stryCov_9fa48("1089"), [])
      }));
      await this.auditService.log(AuditAction.MFA_DISABLED, userId, stryMutAct_9fa48("1090") ? false : (stryCov_9fa48("1090"), true));
      return stryMutAct_9fa48("1091") ? {} : (stryCov_9fa48("1091"), {
        message: stryMutAct_9fa48("1092") ? "" : (stryCov_9fa48("1092"), 'MFA disabled successfully')
      });
    }
  }
  async regenerateBackupCodes(userId: string, totpCode: string) {
    if (stryMutAct_9fa48("1093")) {
      {}
    } else {
      stryCov_9fa48("1093");
      const user = await this.usersService.findById(userId);
      if (stryMutAct_9fa48("1096") ? (!user || !user.mfaEnabled) && !user.mfaSecret : stryMutAct_9fa48("1095") ? false : stryMutAct_9fa48("1094") ? true : (stryCov_9fa48("1094", "1095", "1096"), (stryMutAct_9fa48("1098") ? !user && !user.mfaEnabled : stryMutAct_9fa48("1097") ? false : (stryCov_9fa48("1097", "1098"), (stryMutAct_9fa48("1099") ? user : (stryCov_9fa48("1099"), !user)) || (stryMutAct_9fa48("1100") ? user.mfaEnabled : (stryCov_9fa48("1100"), !user.mfaEnabled)))) || (stryMutAct_9fa48("1101") ? user.mfaSecret : (stryCov_9fa48("1101"), !user.mfaSecret)))) {
        if (stryMutAct_9fa48("1102")) {
          {}
        } else {
          stryCov_9fa48("1102");
          throw new BadRequestException(stryMutAct_9fa48("1103") ? "" : (stryCov_9fa48("1103"), 'MFA is not enabled'));
        }
      }
      const secret = this.encryptionService.decrypt(user.mfaSecret);
      const result = verifySync(stryMutAct_9fa48("1104") ? {} : (stryCov_9fa48("1104"), {
        token: totpCode,
        secret
      }));
      if (stryMutAct_9fa48("1107") ? false : stryMutAct_9fa48("1106") ? true : stryMutAct_9fa48("1105") ? result?.valid : (stryCov_9fa48("1105", "1106", "1107"), !(stryMutAct_9fa48("1108") ? result.valid : (stryCov_9fa48("1108"), result?.valid)))) throw new BadRequestException(stryMutAct_9fa48("1109") ? "" : (stryCov_9fa48("1109"), 'Invalid MFA code'));
      const backupCodes = this.generateBackupCodes();
      await this.usersService.update(userId, stryMutAct_9fa48("1110") ? {} : (stryCov_9fa48("1110"), {
        mfaBackupCodes: backupCodes.map(stryMutAct_9fa48("1111") ? () => undefined : (stryCov_9fa48("1111"), c => crypto.createHash(stryMutAct_9fa48("1112") ? "" : (stryCov_9fa48("1112"), 'sha256')).update(c).digest(stryMutAct_9fa48("1113") ? "" : (stryCov_9fa48("1113"), 'hex'))))
      }));
      return stryMutAct_9fa48("1114") ? {} : (stryCov_9fa48("1114"), {
        backupCodes
      });
    }
  }
  async generateApiKey(userId: string, name: string) {
    if (stryMutAct_9fa48("1115")) {
      {}
    } else {
      stryCov_9fa48("1115");
      const rawKey = stryMutAct_9fa48("1116") ? `` : (stryCov_9fa48("1116"), `bst_${crypto.randomBytes(32).toString(stryMutAct_9fa48("1117") ? "" : (stryCov_9fa48("1117"), 'hex'))}`);
      const hash = crypto.createHash(stryMutAct_9fa48("1118") ? "" : (stryCov_9fa48("1118"), 'sha256')).update(rawKey).digest(stryMutAct_9fa48("1119") ? "" : (stryCov_9fa48("1119"), 'hex'));
      const key = await this.apiKeyRepo.save(this.apiKeyRepo.create(stryMutAct_9fa48("1120") ? {} : (stryCov_9fa48("1120"), {
        name,
        keyHash: hash,
        userId,
        isActive: stryMutAct_9fa48("1121") ? false : (stryCov_9fa48("1121"), true)
      })));
      await this.auditService.log(AuditAction.API_KEY_CREATED, userId, stryMutAct_9fa48("1122") ? false : (stryCov_9fa48("1122"), true), stryMutAct_9fa48("1123") ? {} : (stryCov_9fa48("1123"), {
        name,
        keyId: key.id
      }));
      return stryMutAct_9fa48("1124") ? {} : (stryCov_9fa48("1124"), {
        apiKey: rawKey
      });
    }
  }
  async revokeApiKey(id: string, userId?: string) {
    if (stryMutAct_9fa48("1125")) {
      {}
    } else {
      stryCov_9fa48("1125");
      await this.apiKeyRepo.update(id, stryMutAct_9fa48("1126") ? {} : (stryCov_9fa48("1126"), {
        isActive: stryMutAct_9fa48("1127") ? true : (stryCov_9fa48("1127"), false)
      }));
      await this.auditService.log(AuditAction.API_KEY_REVOKED, stryMutAct_9fa48("1130") ? userId && null : stryMutAct_9fa48("1129") ? false : stryMutAct_9fa48("1128") ? true : (stryCov_9fa48("1128", "1129", "1130"), userId || null), stryMutAct_9fa48("1131") ? false : (stryCov_9fa48("1131"), true), stryMutAct_9fa48("1132") ? {} : (stryCov_9fa48("1132"), {
        keyId: id
      }));
      return stryMutAct_9fa48("1133") ? {} : (stryCov_9fa48("1133"), {
        message: stryMutAct_9fa48("1134") ? "" : (stryCov_9fa48("1134"), 'API key revoked')
      });
    }
  }
  async generateStellarChallenge(publicKey: string) {
    if (stryMutAct_9fa48("1135")) {
      {}
    } else {
      stryCov_9fa48("1135");
      // Generate a random nonce for the user to sign
      const nonce = crypto.randomBytes(32).toString(stryMutAct_9fa48("1136") ? "" : (stryCov_9fa48("1136"), 'hex'));
      const expiresAt = new Date(stryMutAct_9fa48("1137") ? Date.now() - 5 * 60 * 1000 : (stryCov_9fa48("1137"), Date.now() + (stryMutAct_9fa48("1138") ? 5 * 60 / 1000 : (stryCov_9fa48("1138"), (stryMutAct_9fa48("1139") ? 5 / 60 : (stryCov_9fa48("1139"), 5 * 60)) * 1000)))); // 5 minutes

      // Store the challenge temporarily (in production, use Redis or similar)
      // For now, we'll encode it in the response and verify on the backend
      const challenge = stryMutAct_9fa48("1140") ? {} : (stryCov_9fa48("1140"), {
        nonce,
        publicKey,
        expiresAt: expiresAt.toISOString()
      });

      // Return the challenge for the user to sign
      return stryMutAct_9fa48("1141") ? {} : (stryCov_9fa48("1141"), {
        challenge: Buffer.from(JSON.stringify(challenge)).toString(stryMutAct_9fa48("1142") ? "" : (stryCov_9fa48("1142"), 'base64')),
        nonce,
        message: stryMutAct_9fa48("1143") ? `` : (stryCov_9fa48("1143"), `Sign this message to verify ownership of ${publicKey}: ${nonce}`)
      });
    }
  }
  async verifyStellarSignature(userId: string, publicKey: string, signature: string, challenge: string) {
    if (stryMutAct_9fa48("1144")) {
      {}
    } else {
      stryCov_9fa48("1144");
      try {
        if (stryMutAct_9fa48("1145")) {
          {}
        } else {
          stryCov_9fa48("1145");
          // Decode the challenge
          const challengeData = JSON.parse(Buffer.from(challenge, stryMutAct_9fa48("1146") ? "" : (stryCov_9fa48("1146"), 'base64')).toString(stryMutAct_9fa48("1147") ? "" : (stryCov_9fa48("1147"), 'utf8')));

          // Verify the challenge hasn't expired
          if (stryMutAct_9fa48("1151") ? new Date(challengeData.expiresAt) >= new Date() : stryMutAct_9fa48("1150") ? new Date(challengeData.expiresAt) <= new Date() : stryMutAct_9fa48("1149") ? false : stryMutAct_9fa48("1148") ? true : (stryCov_9fa48("1148", "1149", "1150", "1151"), new Date(challengeData.expiresAt) < new Date())) {
            if (stryMutAct_9fa48("1152")) {
              {}
            } else {
              stryCov_9fa48("1152");
              throw new BadRequestException(stryMutAct_9fa48("1153") ? "" : (stryCov_9fa48("1153"), 'Challenge has expired'));
            }
          }

          // Verify the public key matches
          if (stryMutAct_9fa48("1156") ? challengeData.publicKey === publicKey : stryMutAct_9fa48("1155") ? false : stryMutAct_9fa48("1154") ? true : (stryCov_9fa48("1154", "1155", "1156"), challengeData.publicKey !== publicKey)) {
            if (stryMutAct_9fa48("1157")) {
              {}
            } else {
              stryCov_9fa48("1157");
              throw new BadRequestException(stryMutAct_9fa48("1158") ? "" : (stryCov_9fa48("1158"), 'Public key mismatch'));
            }
          }

          // Verify the signature using Stellar SDK
          // Note: In production, you would use stellar-sdk to verify the signature
          // For now, we'll do a basic validation
          if (stryMutAct_9fa48("1161") ? !signature && signature.length < 10 : stryMutAct_9fa48("1160") ? false : stryMutAct_9fa48("1159") ? true : (stryCov_9fa48("1159", "1160", "1161"), (stryMutAct_9fa48("1162") ? signature : (stryCov_9fa48("1162"), !signature)) || (stryMutAct_9fa48("1165") ? signature.length >= 10 : stryMutAct_9fa48("1164") ? signature.length <= 10 : stryMutAct_9fa48("1163") ? false : (stryCov_9fa48("1163", "1164", "1165"), signature.length < 10)))) {
            if (stryMutAct_9fa48("1166")) {
              {}
            } else {
              stryCov_9fa48("1166");
              throw new BadRequestException(stryMutAct_9fa48("1167") ? "" : (stryCov_9fa48("1167"), 'Invalid signature'));
            }
          }

          // Link the public key to the user
          await this.usersService.update(userId, stryMutAct_9fa48("1168") ? {} : (stryCov_9fa48("1168"), {
            stellarPublicKey: publicKey
          }));
          return stryMutAct_9fa48("1169") ? {} : (stryCov_9fa48("1169"), {
            message: stryMutAct_9fa48("1170") ? "" : (stryCov_9fa48("1170"), 'Wallet linked successfully'),
            publicKey
          });
        }
      } catch (error) {
        if (stryMutAct_9fa48("1171")) {
          {}
        } else {
          stryCov_9fa48("1171");
          if (stryMutAct_9fa48("1173") ? false : stryMutAct_9fa48("1172") ? true : (stryCov_9fa48("1172", "1173"), error instanceof BadRequestException)) {
            if (stryMutAct_9fa48("1174")) {
              {}
            } else {
              stryCov_9fa48("1174");
              throw error;
            }
          }
          throw new BadRequestException(stryMutAct_9fa48("1175") ? "" : (stryCov_9fa48("1175"), 'Invalid challenge or signature'));
        }
      }
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async issueTokenPair(userId: string, email: string, role: string = stryMutAct_9fa48("1176") ? "" : (stryCov_9fa48("1176"), 'student')) {
    if (stryMutAct_9fa48("1177")) {
      {}
    } else {
      stryCov_9fa48("1177");
      const access_token = this.jwtService.sign(stryMutAct_9fa48("1178") ? {} : (stryCov_9fa48("1178"), {
        sub: userId,
        email,
        role
      }), stryMutAct_9fa48("1179") ? {} : (stryCov_9fa48("1179"), {
        expiresIn: stryMutAct_9fa48("1180") ? "" : (stryCov_9fa48("1180"), '15m')
      }));
      const {
        token: rawRefresh,
        hash,
        expiresAt
      } = this.generateOpaqueToken(stryMutAct_9fa48("1181") ? 24 / 7 : (stryCov_9fa48("1181"), 24 * 7)); // 7 days
      await this.refreshTokenRepo.save(this.refreshTokenRepo.create(stryMutAct_9fa48("1182") ? {} : (stryCov_9fa48("1182"), {
        tokenHash: hash,
        userId,
        expiresAt,
        revoked: stryMutAct_9fa48("1183") ? true : (stryCov_9fa48("1183"), false)
      })));
      return stryMutAct_9fa48("1184") ? {} : (stryCov_9fa48("1184"), {
        access_token,
        refresh_token: rawRefresh
      });
    }
  }
  private generateOpaqueToken(ttlHours: number) {
    if (stryMutAct_9fa48("1185")) {
      {}
    } else {
      stryCov_9fa48("1185");
      const token = crypto.randomBytes(32).toString(stryMutAct_9fa48("1186") ? "" : (stryCov_9fa48("1186"), 'hex'));
      const hash = this.hashToken(token);
      const expiresAt = new Date(stryMutAct_9fa48("1187") ? Date.now() - ttlHours * 60 * 60 * 1000 : (stryCov_9fa48("1187"), Date.now() + (stryMutAct_9fa48("1188") ? ttlHours * 60 * 60 / 1000 : (stryCov_9fa48("1188"), (stryMutAct_9fa48("1189") ? ttlHours * 60 / 60 : (stryCov_9fa48("1189"), (stryMutAct_9fa48("1190") ? ttlHours / 60 : (stryCov_9fa48("1190"), ttlHours * 60)) * 60)) * 1000))));
      return stryMutAct_9fa48("1191") ? {} : (stryCov_9fa48("1191"), {
        token,
        hash,
        expiresAt
      });
    }
  }
  private hashToken(token: string) {
    if (stryMutAct_9fa48("1192")) {
      {}
    } else {
      stryCov_9fa48("1192");
      return crypto.createHash(stryMutAct_9fa48("1193") ? "" : (stryCov_9fa48("1193"), 'sha256')).update(token).digest(stryMutAct_9fa48("1194") ? "" : (stryCov_9fa48("1194"), 'hex'));
    }
  }
  private generateBackupCodes(count = 8): string[] {
    if (stryMutAct_9fa48("1195")) {
      {}
    } else {
      stryCov_9fa48("1195");
      return Array.from(stryMutAct_9fa48("1196") ? {} : (stryCov_9fa48("1196"), {
        length: count
      }), stryMutAct_9fa48("1197") ? () => undefined : (stryCov_9fa48("1197"), () => stryMutAct_9fa48("1198") ? crypto.randomBytes(5).toString('hex').toLowerCase() : (stryCov_9fa48("1198"), crypto.randomBytes(5).toString(stryMutAct_9fa48("1199") ? "" : (stryCov_9fa48("1199"), 'hex')).toUpperCase())));
    }
  }
  private async useBackupCode(userId: string, code: string): Promise<boolean> {
    if (stryMutAct_9fa48("1200")) {
      {}
    } else {
      stryCov_9fa48("1200");
      const user = await this.usersService.findById(userId);
      if (stryMutAct_9fa48("1203") ? false : stryMutAct_9fa48("1202") ? true : stryMutAct_9fa48("1201") ? user?.mfaBackupCodes?.length : (stryCov_9fa48("1201", "1202", "1203"), !(stryMutAct_9fa48("1205") ? user.mfaBackupCodes?.length : stryMutAct_9fa48("1204") ? user?.mfaBackupCodes.length : (stryCov_9fa48("1204", "1205"), user?.mfaBackupCodes?.length)))) return stryMutAct_9fa48("1206") ? true : (stryCov_9fa48("1206"), false);
      const hash = crypto.createHash(stryMutAct_9fa48("1207") ? "" : (stryCov_9fa48("1207"), 'sha256')).update(code).digest(stryMutAct_9fa48("1208") ? "" : (stryCov_9fa48("1208"), 'hex'));
      const idx = user.mfaBackupCodes.indexOf(hash);
      if (stryMutAct_9fa48("1211") ? idx !== -1 : stryMutAct_9fa48("1210") ? false : stryMutAct_9fa48("1209") ? true : (stryCov_9fa48("1209", "1210", "1211"), idx === (stryMutAct_9fa48("1212") ? +1 : (stryCov_9fa48("1212"), -1)))) return stryMutAct_9fa48("1213") ? true : (stryCov_9fa48("1213"), false);
      const updated = stryMutAct_9fa48("1214") ? [] : (stryCov_9fa48("1214"), [...user.mfaBackupCodes]);
      updated.splice(idx, 1);
      await this.usersService.update(userId, stryMutAct_9fa48("1215") ? {} : (stryCov_9fa48("1215"), {
        mfaBackupCodes: updated
      }));
      return stryMutAct_9fa48("1216") ? false : (stryCov_9fa48("1216"), true);
    }
  }
}