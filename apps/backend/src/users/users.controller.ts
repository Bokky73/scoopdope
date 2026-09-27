import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Patch,
  Delete,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  ForbiddenException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { BulkDeleteUserDto } from './dto/bulk-delete-user.dto';
import { StellarService } from '../stellar/stellar.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly stellarService: StellarService,
    private readonly auditService: AuditService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  @ApiOperation({ summary: 'Admin-only test endpoint' })
  @ApiResponse({ status: 200, description: 'Admin access confirmed' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  adminOnly() {
    return { message: 'Admin access granted' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Returns current user data' })
  async getMe(@Request() req: { user: { id: string } }) {
    return this.usersService.findById(req.user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description:
      'Returns user profile (id, username, role, createdAt, enrollment/completion stats; ' +
      'email only for the profile owner; bio and coursesTaught for instructors)',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @Request() req: { user?: { id: string } }) {
    return this.usersService.getPublicProfile(id, req.user?.id);
  }

  @Get(':id/token-balance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get BST token balance for a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Returns BST token balance',
    schema: { example: { balance: '1000', stellarPublicKey: 'G...' } },
  })
  @ApiResponse({ status: 404, description: 'User not found or no Stellar key linked' })
  async getTokenBalance(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!user.stellarPublicKey)
      throw new NotFoundException('User has no Stellar public key linked');
    const balance = await this.stellarService.getTokenBalance(user.stellarPublicKey);
    return { balance, stellarPublicKey: user.stellarPublicKey };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/referrals')
  @ApiOperation({ summary: 'Get referral count and earned BST for a user' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getReferrals(@Param('id') id: string) {
    return this.usersService.getReferralStats(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  @UsePipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )
  @ApiOperation({ summary: 'Assign or change a user role (admin only)' })
  @ApiResponse({ status: 200, description: 'Role updated; returns the updated user object' })
  @ApiResponse({ status: 400, description: 'Invalid role value' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required, or admin attempting to change own role',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @Req() req: { user: { id: string }; ip?: string; headers?: Record<string, string> },
  ) {
    // Prevent an admin from demoting/locking themselves out of the platform.
    if (req.user.id === id) {
      throw new ForbiddenException('Administrators cannot change their own role');
    }

    const updated = await this.usersService.changeRole(id, dto.role);

    await this.auditService.log(
      AuditAction.ROLE_CHANGED,
      req.user.id,
      true,
      { affectedId: id, newRole: dto.role },
      req.ip,
      req.headers?.['user-agent'],
    );

    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: { user: { id: string } }
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/export')
  @ApiOperation({ summary: 'Export all personal data (GDPR)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Returns all user data in JSON format' })
  async exportData(@Request() req: { user: { id: string } }) {
    const data = await this.usersService.exportUserData(req.user.id);
    await this.auditService.log('gdpr.data_export', req.user.id, true);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/account')
  @ApiOperation({ summary: 'Delete account and anonymize personal data (GDPR)' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 200, description: 'Account deletion initiated' })
  async deleteAccount(@Request() req: { user: { id: string } }) {
    await this.usersService.anonymizeUser(req.user.id);
    await this.auditService.log('gdpr.account_deletion', req.user.id, true);
    return { message: 'Account deletion initiated. Your personal data has been anonymized.' };
  }
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated users',
    schema: {
      example: {
        data: { users: [], total: 0, page: 1, limit: 10 },
        statusCode: 200,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('isVerified') isVerified?: string,
    @Query('search') search?: string
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      role,
      status: status as any,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      search,
    });
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async changeRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const { user, previousRole } = await this.usersService.changeRole(id, role);

    await this.auditService.log(
      AuditAction.ROLE_CHANGED,
      req.user.id,
      true,
      {
        resourceType: 'user',
        resourceId: id,
        changes: { role: { from: previousRole, to: role } },
        metadata: { affectedId: id },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return user;
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Set user status (active / suspended / deactivated)' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    if (req.user.id === id) {
      throw new ForbiddenException('Administrators cannot change their own role');
    }

    const updated = await this.usersService.changeRole(id, role);

    await this.auditService.log(
      AuditAction.ROLE_CHANGED,
      req.user.id,
      true,
      { affectedId: id, newRole: role },
      req.ip,
      req.headers?.['user-agent'],
    );

    return updated;
  }

  @Patch(':id/ban')
  @Roles('admin')
  @ApiOperation({ summary: 'Ban or unban a user' })
  @ApiResponse({ status: 200, description: 'User ban status updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async banUser(
    @Param('id') id: string,
    @Body('isBanned') isBanned: boolean,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const user = await this.usersService.banUser(id, isBanned);

    await this.auditService.log(
      AuditAction.USER_BANNED,
      req.user.id,
      true,
      {
        resourceType: 'user',
        resourceId: id,
        changes: { isBanned: { from: !isBanned, to: isBanned } },
        metadata: { affectedId: id },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return user;
  }

  @Delete('bulk')
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk soft delete users with audit logging' })
  @ApiResponse({ status: 200, description: 'Bulk deletion completed with audit trail' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async bulkDeleteUsers(
    @Body() dto: BulkDeleteUserDto,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const results = await this.usersService.bulkSoftDelete(dto.ids);

    // Log a per-user audit entry for each successfully deleted user
    for (const deletedId of results.deleted) {
      await this.auditService.log(
        AuditAction.USER_DELETED,
        req.user.id,
        true,
        {
          resourceType: 'user',
          resourceId: deletedId,
          metadata: { affectedId: deletedId, operation: 'bulk' },
          ipAddress: req.ip,
          userAgent: req.headers?.['user-agent'],
        },
      );
    }

    // Log a summary audit entry for the bulk operation
    await this.auditService.log(
      AuditAction.USER_BULK_DELETED,
      req.user.id,
      true,
      {
        metadata: {
          affectedIds: results.deleted,
          failedIds: results.failed.map((f) => f.id),
          totalRequested: dto.ids.length,
        },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return {
      message: `Bulk deletion completed: ${results.deleted.length} deleted, ${results.failed.length} failed`,
      results,
    };
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUser(
    @Param('id') id: string,
    @Req() req: { user: { id: string }; ip: string; headers: Record<string, string> },
  ) {
    const result = await this.usersService.softDelete(id);

    await this.auditService.log(
      AuditAction.USER_DELETED,
      req.user.id,
      true,
      {
        resourceType: 'user',
        resourceId: id,
        metadata: { affectedId: id },
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      },
    );

    return result;
  }
}
