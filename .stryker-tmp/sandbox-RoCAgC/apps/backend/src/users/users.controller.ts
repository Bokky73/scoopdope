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
import { Controller, Get, Param, Query, Patch, Delete, Body, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { StellarService } from '../stellar/stellar.service';
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly stellarService: StellarService) {}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  adminOnly() {
    if (stryMutAct_9fa48("7082")) {
      {}
    } else {
      stryCov_9fa48("7082");
      return stryMutAct_9fa48("7083") ? {} : (stryCov_9fa48("7083"), {
        message: stryMutAct_9fa48("7084") ? "" : (stryCov_9fa48("7084"), 'Admin access granted')
      });
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns current user data'
  })
  async getMe(@Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("7085")) {
      {}
    } else {
      stryCov_9fa48("7085");
      return this.usersService.findById(req.user.id);
    }
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user data',
    schema: {
      example: {
        data: {},
        statusCode: 200,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  findOne(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("7086")) {
      {}
    } else {
      stryCov_9fa48("7086");
      return this.usersService.findById(id);
    }
  }
  @Get(':id/token-balance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get BST token balance for a user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns BST token balance',
    schema: {
      example: {
        balance: '1000',
        stellarPublicKey: 'G...'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no Stellar key linked'
  })
  async getTokenBalance(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("7087")) {
      {}
    } else {
      stryCov_9fa48("7087");
      const user = await this.usersService.findById(id);
      if (stryMutAct_9fa48("7090") ? false : stryMutAct_9fa48("7089") ? true : stryMutAct_9fa48("7088") ? user : (stryCov_9fa48("7088", "7089", "7090"), !user)) throw new NotFoundException(stryMutAct_9fa48("7091") ? "" : (stryCov_9fa48("7091"), 'User not found'));
      if (stryMutAct_9fa48("7094") ? false : stryMutAct_9fa48("7093") ? true : stryMutAct_9fa48("7092") ? user.stellarPublicKey : (stryCov_9fa48("7092", "7093", "7094"), !user.stellarPublicKey)) throw new NotFoundException(stryMutAct_9fa48("7095") ? "" : (stryCov_9fa48("7095"), 'User has no Stellar public key linked'));
      const balance = await this.stellarService.getTokenBalance(user.stellarPublicKey);
      return stryMutAct_9fa48("7096") ? {} : (stryCov_9fa48("7096"), {
        balance,
        stellarPublicKey: user.stellarPublicKey
      });
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id/referrals')
  @ApiOperation({
    summary: 'Get referral count and earned BST for a user'
  })
  getReferrals(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("7097")) {
      {}
    } else {
      stryCov_9fa48("7097");
      return this.usersService.getReferralStats(id);
    }
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id')
  id: string, @Body()
  dto: UpdateUserDto, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("7098")) {
      {}
    } else {
      stryCov_9fa48("7098");
      if (stryMutAct_9fa48("7101") ? req.user.id === id : stryMutAct_9fa48("7100") ? false : stryMutAct_9fa48("7099") ? true : (stryCov_9fa48("7099", "7100", "7101"), req.user.id !== id)) {
        if (stryMutAct_9fa48("7102")) {
          {}
        } else {
          stryCov_9fa48("7102");
          throw new ForbiddenException(stryMutAct_9fa48("7103") ? "" : (stryCov_9fa48("7103"), 'You can only update your own profile'));
        }
      }
      return this.usersService.update(id, dto);
    }
  }
}
@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all users with filtering and pagination'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated users',
    schema: {
      example: {
        data: {
          users: [],
          total: 0,
          page: 1,
          limit: 10
        },
        statusCode: 200,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required'
  })
  findAll(@Query('page')
  page?: number, @Query('limit')
  limit?: number, @Query('role')
  role?: string, @Query('isVerified')
  isVerified?: string, @Query('search')
  search?: string) {
    if (stryMutAct_9fa48("7104")) {
      {}
    } else {
      stryCov_9fa48("7104");
      return this.usersService.findAll(stryMutAct_9fa48("7105") ? {} : (stryCov_9fa48("7105"), {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        role,
        isVerified: (stryMutAct_9fa48("7108") ? isVerified !== 'true' : stryMutAct_9fa48("7107") ? false : stryMutAct_9fa48("7106") ? true : (stryCov_9fa48("7106", "7107", "7108"), isVerified === (stryMutAct_9fa48("7109") ? "" : (stryCov_9fa48("7109"), 'true')))) ? stryMutAct_9fa48("7110") ? false : (stryCov_9fa48("7110"), true) : (stryMutAct_9fa48("7113") ? isVerified !== 'false' : stryMutAct_9fa48("7112") ? false : stryMutAct_9fa48("7111") ? true : (stryCov_9fa48("7111", "7112", "7113"), isVerified === (stryMutAct_9fa48("7114") ? "" : (stryCov_9fa48("7114"), 'false')))) ? stryMutAct_9fa48("7115") ? true : (stryCov_9fa48("7115"), false) : undefined,
        search
      }));
    }
  }
  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({
    summary: 'Change user role'
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    schema: {
      example: {
        data: {},
        statusCode: 200,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  changeRole(@Param('id')
  id: string, @Body('role')
  role: string) {
    if (stryMutAct_9fa48("7116")) {
      {}
    } else {
      stryCov_9fa48("7116");
      return this.usersService.changeRole(id, role);
    }
  }
  @Patch(':id/ban')
  @Roles('admin')
  @ApiOperation({
    summary: 'Ban or unban a user'
  })
  @ApiResponse({
    status: 200,
    description: 'User ban status updated',
    schema: {
      example: {
        data: {},
        statusCode: 200,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  banUser(@Param('id')
  id: string, @Body('isBanned')
  isBanned: boolean) {
    if (stryMutAct_9fa48("7117")) {
      {}
    } else {
      stryCov_9fa48("7117");
      return this.usersService.banUser(id, isBanned);
    }
  }
  @Delete(':id')
  @Roles('admin')
  @ApiOperation({
    summary: 'Soft delete a user'
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        data: {},
        statusCode: 200,
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  deleteUser(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("7118")) {
      {}
    } else {
      stryCov_9fa48("7118");
      return this.usersService.softDelete(id);
    }
  }
}