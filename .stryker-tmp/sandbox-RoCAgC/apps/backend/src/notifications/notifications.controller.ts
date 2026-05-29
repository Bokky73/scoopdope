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
import { Controller, Get, Patch, Post, Delete, Param, Request, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushNotificationsService } from './push-notifications.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService, private pushNotificationsService: PushNotificationsService) {}
  @Get()
  @ApiOperation({
    summary: 'Get all notifications for the current user'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user notifications',
    schema: {
      example: [{
        id: 'uuid',
        type: 'enrollment',
        message: 'You enrolled in Course X',
        read: false
      }]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  findAll(@Request()
  req) {
    if (stryMutAct_9fa48("5258")) {
      {}
    } else {
      stryCov_9fa48("5258");
      return this.notificationsService.findByUser(req.user.id);
    }
  }
  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark a notification as read'
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found'
  })
  markAsRead(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("5259")) {
      {}
    } else {
      stryCov_9fa48("5259");
      return this.notificationsService.markAsRead(id);
    }
  }
  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read'
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  markAllAsRead(@Request()
  req) {
    if (stryMutAct_9fa48("5260")) {
      {}
    } else {
      stryCov_9fa48("5260");
      return this.notificationsService.markAllAsRead(req.user.id);
    }
  }
  @Post('subscribe')
  @ApiOperation({
    summary: 'Subscribe to push notifications'
  })
  @ApiBody({
    schema: {
      example: {
        endpoint: 'https://...',
        keys: {
          p256dh: '...',
          auth: '...'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Subscribed successfully'
  })
  subscribe(@Request()
  req, @Body()
  subscription: any) {
    if (stryMutAct_9fa48("5261")) {
      {}
    } else {
      stryCov_9fa48("5261");
      return this.pushNotificationsService.subscribe(req.user.id, subscription);
    }
  }
  @Delete('unsubscribe')
  @ApiOperation({
    summary: 'Unsubscribe from push notifications'
  })
  @ApiBody({
    schema: {
      example: {
        endpoint: 'https://...'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed successfully'
  })
  unsubscribe(@Request()
  req, @Body('endpoint')
  endpoint: string) {
    if (stryMutAct_9fa48("5262")) {
      {}
    } else {
      stryCov_9fa48("5262");
      return this.pushNotificationsService.unsubscribe(req.user.id, endpoint);
    }
  }
  @Patch('preferences')
  @ApiOperation({
    summary: 'Update notification preferences'
  })
  @ApiBody({
    schema: {
      example: {
        courseUpdates: true,
        liveSessions: false,
        tokenRewards: true,
        pushEnabled: true
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully'
  })
  updatePreferences(@Request()
  req, @Body()
  preferences: any) {
    if (stryMutAct_9fa48("5263")) {
      {}
    } else {
      stryCov_9fa48("5263");
      return this.notificationsService.updatePreferences(req.user.id, preferences);
    }
  }
}