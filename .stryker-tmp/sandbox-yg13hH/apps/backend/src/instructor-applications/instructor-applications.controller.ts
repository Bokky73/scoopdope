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
import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InstructorApplicationsService } from './instructor-applications.service';
import { CreateInstructorApplicationDto, ReviewApplicationDto } from './dto/instructor-application.dto';
@ApiTags('instructor-applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('instructor-applications')
export class InstructorApplicationsController {
  constructor(private readonly service: InstructorApplicationsService) {}
  @Post()
  @ApiOperation({
    summary: 'Submit an instructor application'
  })
  @ApiResponse({
    status: 201,
    description: 'Application submitted'
  })
  @ApiResponse({
    status: 400,
    description: 'Agreement not accepted or validation error'
  })
  @ApiResponse({
    status: 409,
    description: 'Pending application already exists'
  })
  apply(@Body()
  dto: CreateInstructorApplicationDto, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3926")) {
      {}
    } else {
      stryCov_9fa48("3926");
      return this.service.apply(req.user.id, dto);
    }
  }
  @Get('me')
  @ApiOperation({
    summary: 'Get my instructor application status'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the most recent application'
  })
  getMyApplication(@Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3927")) {
      {}
    } else {
      stryCov_9fa48("3927");
      return this.service.findMyApplication(req.user.id);
    }
  }
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all instructor applications (admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of applications'
  })
  findAll(@Query('status')
  status?: string) {
    if (stryMutAct_9fa48("3928")) {
      {}
    } else {
      stryCov_9fa48("3928");
      return this.service.findAll(status);
    }
  }
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Approve or reject an instructor application (admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed; user role updated if approved'
  })
  @ApiResponse({
    status: 400,
    description: 'Already reviewed'
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found'
  })
  review(@Param('id')
  id: string, @Body()
  dto: ReviewApplicationDto, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3929")) {
      {}
    } else {
      stryCov_9fa48("3929");
      return this.service.review(id, req.user.id, dto);
    }
  }
}