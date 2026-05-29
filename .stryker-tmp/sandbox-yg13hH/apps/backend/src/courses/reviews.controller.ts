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
import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import { ReviewsService } from './reviews.service';
@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
  @Post('courses/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a review for a completed course enrollment'
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found'
  })
  create(@Param('id')
  courseId: string, @Request()
  req: {
    user: {
      id: string;
    };
  }, @Body()
  dto: CreateReviewDto) {
    if (stryMutAct_9fa48("2948")) {
      {}
    } else {
      stryCov_9fa48("2948");
      return this.reviewsService.create(courseId, req.user.id, dto);
    }
  }
  @Get('courses/:id/reviews')
  @ApiOperation({
    summary: 'List reviews for a course'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results per page (default: 20)'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated course reviews',
    schema: {
      example: {
        data: [],
        total: 0,
        page: 1,
        limit: 20
      }
    }
  })
  findByCourse(@Param('id')
  courseId: string, @Query()
  query: ReviewQueryDto) {
    if (stryMutAct_9fa48("2949")) {
      {}
    } else {
      stryCov_9fa48("2949");
      return this.reviewsService.findByCourse(courseId, query);
    }
  }
}