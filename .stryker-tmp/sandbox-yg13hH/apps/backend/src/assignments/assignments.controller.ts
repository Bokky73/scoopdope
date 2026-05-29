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
import { Controller, Get, Post, Patch, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RubricScore } from './peer-review.entity';
@ApiTags('assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new assignment'
  })
  createAssignment(@Body()
  data: any) {
    if (stryMutAct_9fa48("521")) {
      {}
    } else {
      stryCov_9fa48("521");
      return this.assignmentsService.createAssignment(data);
    }
  }
  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get assignments for a course'
  })
  getAssignmentsByCourse(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("522")) {
      {}
    } else {
      stryCov_9fa48("522");
      return this.assignmentsService.getAssignmentsByCourse(courseId);
    }
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get assignment details'
  })
  getAssignment(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("523")) {
      {}
    } else {
      stryCov_9fa48("523");
      return this.assignmentsService.getAssignment(id);
    }
  }
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Submit an assignment'
  })
  async submitAssignment(@CurrentUser()
  user: any, @Param('id')
  id: string, @UploadedFile()
  file: Express.Multer.File) {
    if (stryMutAct_9fa48("524")) {
      {}
    } else {
      stryCov_9fa48("524");
      // In a real app, you would upload the file to S3/CDN here.
      // For this implementation, we'll simulate it by using the filename or a mock URL.
      const fileUrl = stryMutAct_9fa48("525") ? `` : (stryCov_9fa48("525"), `https://cdn.scoopdope.com/submissions/${user.id}/${file.originalname}`);
      return this.assignmentsService.submitAssignment(user.id, id, fileUrl);
    }
  }
  @Get(':id/my-submission')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user submission for an assignment'
  })
  getMySubmission(@CurrentUser()
  user: any, @Param('id')
  id: string) {
    if (stryMutAct_9fa48("526")) {
      {}
    } else {
      stryCov_9fa48("526");
      return this.assignmentsService.getSubmissionByUser(user.id, id);
    }
  }
  @Post(':id/assign-reviewers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Trigger reviewer assignment for an assignment'
  })
  assignReviewers(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("527")) {
      {}
    } else {
      stryCov_9fa48("527");
      return this.assignmentsService.assignReviewers(id);
    }
  }
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get peer reviews assigned to the current user'
  })
  getMyReviews(@CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("528")) {
      {}
    } else {
      stryCov_9fa48("528");
      return this.assignmentsService.getReviewsForUser(user.id);
    }
  }
  @Post('reviews/:submissionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Submit a peer review'
  })
  submitReview(@CurrentUser()
  user: any, @Param('submissionId')
  submissionId: string, @Body()
  data: {
    scores: RubricScore[];
    overallFeedback: string;
  }) {
    if (stryMutAct_9fa48("529")) {
      {}
    } else {
      stryCov_9fa48("529");
      return this.assignmentsService.submitPeerReview(user.id, submissionId, data.scores, data.overallFeedback);
    }
  }
  @Patch('submissions/:id/override')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Instructor override for submission grade'
  })
  instructorOverride(@Param('id')
  id: string, @Body()
  data: {
    grade: number;
    feedback: string;
  }) {
    if (stryMutAct_9fa48("530")) {
      {}
    } else {
      stryCov_9fa48("530");
      return this.assignmentsService.instructorOverride(id, data.grade, data.feedback);
    }
  }
}