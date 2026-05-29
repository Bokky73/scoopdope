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
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1')
export class NotesController {
  constructor(private service: NotesService) {}
  @Get('lessons/:lessonId/notes')
  @ApiOperation({
    summary: 'Get notes for a lesson'
  })
  @ApiQuery({
    name: 'search',
    required: false
  })
  getByLesson(@Param('lessonId')
  lessonId: string, @Query('search')
  search: string, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("5216")) {
      {}
    } else {
      stryCov_9fa48("5216");
      return this.service.findByLesson(user.id, lessonId, search);
    }
  }
  @Get('notes')
  @ApiOperation({
    summary: 'Get all notes for the current user'
  })
  @ApiQuery({
    name: 'search',
    required: false
  })
  getAll(@Query('search')
  search: string, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("5217")) {
      {}
    } else {
      stryCov_9fa48("5217");
      return this.service.findByUser(user.id, search);
    }
  }
  @Post('lessons/:lessonId/notes')
  @ApiOperation({
    summary: 'Create a note'
  })
  create(@Param('lessonId')
  lessonId: string, @Body()
  dto: CreateNoteDto, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("5218")) {
      {}
    } else {
      stryCov_9fa48("5218");
      return this.service.create(user.id, lessonId, dto);
    }
  }
  @Patch('notes/:id')
  @ApiOperation({
    summary: 'Update a note'
  })
  update(@Param('id')
  id: string, @Body()
  dto: UpdateNoteDto, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("5219")) {
      {}
    } else {
      stryCov_9fa48("5219");
      return this.service.update(id, user.id, dto);
    }
  }
  @Delete('notes/:id')
  @ApiOperation({
    summary: 'Delete a note'
  })
  remove(@Param('id')
  id: string, @CurrentUser()
  user: any) {
    if (stryMutAct_9fa48("5220")) {
      {}
    } else {
      stryCov_9fa48("5220");
      return this.service.remove(id, user.id);
    }
  }
}