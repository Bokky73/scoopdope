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
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ModulesService } from './modules.service';
import { LessonsService } from './lessons.service';
import { TranscribeService } from './transcribe.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
@ApiTags('modules')
@Controller()
export class ModulesController {
  constructor(private modulesService: ModulesService, private lessonsService: LessonsService, private transcribeService: TranscribeService) {}

  // ── Modules ──────────────────────────────────────────────────────────────

  @Get('courses/:courseId/modules')
  @ApiOperation({
    summary: 'Get all modules for a course'
  })
  @ApiResponse({
    status: 200,
    description: 'List of modules',
    schema: {
      example: [{
        id: 'uuid',
        title: 'Module 1',
        order: 1
      }]
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found'
  })
  getModules(@Param('courseId')
  courseId: string) {
    if (stryMutAct_9fa48("2722")) {
      {}
    } else {
      stryCov_9fa48("2722");
      return this.modulesService.findByCourse(courseId);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Post('courses/:courseId/modules')
  @ApiOperation({
    summary: 'Create a module in a course'
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Module 1',
        description: 'Intro module',
        order: 1
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Module created',
    schema: {
      example: {
        id: 'uuid',
        title: 'Module 1'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  createModule(@Param('courseId')
  courseId: string, @Body()
  dto: CreateModuleDto) {
    if (stryMutAct_9fa48("2723")) {
      {}
    } else {
      stryCov_9fa48("2723");
      return this.modulesService.create(courseId, dto);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Patch('modules/:id')
  @ApiOperation({
    summary: 'Update a module'
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Updated title',
        order: 2
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Module updated'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found'
  })
  updateModule(@Param('id')
  id: string, @Body()
  dto: Partial<CreateModuleDto>) {
    if (stryMutAct_9fa48("2724")) {
      {}
    } else {
      stryCov_9fa48("2724");
      return this.modulesService.update(id, dto);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Delete('modules/:id')
  @ApiOperation({
    summary: 'Delete a module'
  })
  @ApiResponse({
    status: 200,
    description: 'Module deleted'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found'
  })
  deleteModule(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2725")) {
      {}
    } else {
      stryCov_9fa48("2725");
      return this.modulesService.remove(id);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('modules/:id/unlock')
  @ApiOperation({
    summary: 'Admin override: unlock a module immediately by clearing its release date'
  })
  @ApiResponse({
    status: 200,
    description: 'Module unlocked',
    schema: {
      example: {
        id: 'uuid',
        title: 'Module 1',
        isLocked: false
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found'
  })
  unlockModule(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2726")) {
      {}
    } else {
      stryCov_9fa48("2726");
      return this.modulesService.unlockNow(id);
    }
  }

  // ── Lessons ───────────────────────────────────────────────────────────────

  @Get('modules/:moduleId/lessons')
  @ApiOperation({
    summary: 'Get all lessons for a module'
  })
  @ApiResponse({
    status: 200,
    description: 'List of lessons',
    schema: {
      example: [{
        id: 'uuid',
        title: 'Lesson 1',
        order: 1
      }]
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Module not found'
  })
  getLessons(@Param('moduleId')
  moduleId: string) {
    if (stryMutAct_9fa48("2727")) {
      {}
    } else {
      stryCov_9fa48("2727");
      return this.lessonsService.findByModule(moduleId);
    }
  }
  @Get('lessons/:id')
  @ApiOperation({
    summary: 'Get a lesson by id'
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson found'
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found'
  })
  getLesson(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2728")) {
      {}
    } else {
      stryCov_9fa48("2728");
      return this.lessonsService.findOne(id);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Post('modules/:moduleId/lessons')
  @ApiOperation({
    summary: 'Create a lesson in a module'
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Lesson 1',
        content: 'Content here',
        order: 1
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson created',
    schema: {
      example: {
        id: 'uuid',
        title: 'Lesson 1'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  createLesson(@Param('moduleId')
  moduleId: string, @Body()
  dto: CreateLessonDto) {
    if (stryMutAct_9fa48("2729")) {
      {}
    } else {
      stryCov_9fa48("2729");
      return this.lessonsService.create(moduleId, dto);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Patch('lessons/:id')
  @ApiOperation({
    summary: 'Update a lesson'
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Updated title',
        content: 'New content'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found'
  })
  updateLesson(@Param('id')
  id: string, @Body()
  dto: Partial<CreateLessonDto>) {
    if (stryMutAct_9fa48("2730")) {
      {}
    } else {
      stryCov_9fa48("2730");
      return this.lessonsService.update(id, dto);
    }
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('instructor', 'admin')
  @Delete('lessons/:id')
  @ApiOperation({
    summary: 'Delete a lesson'
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden'
  })
  @ApiResponse({
    status: 404,
    description: 'Lesson not found'
  })
  deleteLesson(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2731")) {
      {}
    } else {
      stryCov_9fa48("2731");
      return this.lessonsService.remove(id);
    }
  }
  @Get('lessons/:id/transcript/srt')
  @ApiOperation({
    summary: 'Download lesson transcript as SRT'
  })
  async downloadSrt(@Param('id')
  id: string, @Res()
  res: Response) {
    if (stryMutAct_9fa48("2732")) {
      {}
    } else {
      stryCov_9fa48("2732");
      const lesson = await this.lessonsService.findOne(id);
      if (stryMutAct_9fa48("2735") ? !lesson && !lesson.transcriptSrt : stryMutAct_9fa48("2734") ? false : stryMutAct_9fa48("2733") ? true : (stryCov_9fa48("2733", "2734", "2735"), (stryMutAct_9fa48("2736") ? lesson : (stryCov_9fa48("2736"), !lesson)) || (stryMutAct_9fa48("2737") ? lesson.transcriptSrt : (stryCov_9fa48("2737"), !lesson.transcriptSrt)))) throw new NotFoundException(stryMutAct_9fa48("2738") ? "" : (stryCov_9fa48("2738"), 'Transcript not found'));
      res.set(stryMutAct_9fa48("2739") ? {} : (stryCov_9fa48("2739"), {
        'Content-Type': stryMutAct_9fa48("2740") ? "" : (stryCov_9fa48("2740"), 'text/plain'),
        'Content-Disposition': stryMutAct_9fa48("2741") ? `` : (stryCov_9fa48("2741"), `attachment; filename="lesson-${id}.srt"`)
      }));
      res.send(lesson.transcriptSrt);
    }
  }
  @Get('lessons/:id/transcript/pdf')
  @ApiOperation({
    summary: 'Download lesson transcript as PDF'
  })
  async downloadPdf(@Param('id')
  id: string, @Res()
  res: Response) {
    if (stryMutAct_9fa48("2742")) {
      {}
    } else {
      stryCov_9fa48("2742");
      const lesson = await this.lessonsService.findOne(id);
      if (stryMutAct_9fa48("2745") ? !lesson && !lesson.transcript : stryMutAct_9fa48("2744") ? false : stryMutAct_9fa48("2743") ? true : (stryCov_9fa48("2743", "2744", "2745"), (stryMutAct_9fa48("2746") ? lesson : (stryCov_9fa48("2746"), !lesson)) || (stryMutAct_9fa48("2747") ? lesson.transcript : (stryCov_9fa48("2747"), !lesson.transcript)))) throw new NotFoundException(stryMutAct_9fa48("2748") ? "" : (stryCov_9fa48("2748"), 'Transcript not found'));
      const pdfBuffer = this.transcribeService.generateTranscriptPdf(lesson);
      res.set(stryMutAct_9fa48("2749") ? {} : (stryCov_9fa48("2749"), {
        'Content-Type': stryMutAct_9fa48("2750") ? "" : (stryCov_9fa48("2750"), 'application/pdf'),
        'Content-Disposition': stryMutAct_9fa48("2751") ? `` : (stryCov_9fa48("2751"), `attachment; filename="lesson-${id}.pdf"`)
      }));
      res.send(pdfBuffer);
    }
  }
}