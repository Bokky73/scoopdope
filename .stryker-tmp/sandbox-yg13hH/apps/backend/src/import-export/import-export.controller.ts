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
import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ImportExportService } from './import-export.service';
const MAX_FILE_SIZE = stryMutAct_9fa48("3701") ? 50 * 1024 / 1024 : (stryCov_9fa48("3701"), (stryMutAct_9fa48("3702") ? 50 / 1024 : (stryCov_9fa48("3702"), 50 * 1024)) * 1024); // 50 MB

@ApiTags('import-export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor', 'admin')
@Controller('courses')
export class ImportExportController {
  constructor(private readonly service: ImportExportService) {}
  @Get(':id/export')
  @ApiOperation({
    summary: 'Export a course as JSON'
  })
  async exportCourse(@Param('id')
  id: string, @Res()
  res: Response) {
    if (stryMutAct_9fa48("3703")) {
      {}
    } else {
      stryCov_9fa48("3703");
      const data = await this.service.exportCourse(id);
      res.setHeader(stryMutAct_9fa48("3704") ? "" : (stryCov_9fa48("3704"), 'Content-Type'), stryMutAct_9fa48("3705") ? "" : (stryCov_9fa48("3705"), 'application/json')).setHeader(stryMutAct_9fa48("3706") ? "" : (stryCov_9fa48("3706"), 'Content-Disposition'), stryMutAct_9fa48("3707") ? `` : (stryCov_9fa48("3707"), `attachment; filename="course-${id}.json"`)).send(JSON.stringify(data, null, 2));
    }
  }
  @Post('import/json')
  @ApiOperation({
    summary: 'Import a course from JSON file'
  })
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
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: MAX_FILE_SIZE
    }
  }))
  importJson(@UploadedFile()
  file: Express.Multer.File, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3708")) {
      {}
    } else {
      stryCov_9fa48("3708");
      if (stryMutAct_9fa48("3711") ? false : stryMutAct_9fa48("3710") ? true : stryMutAct_9fa48("3709") ? file : (stryCov_9fa48("3709", "3710", "3711"), !file)) throw new BadRequestException(stryMutAct_9fa48("3712") ? "" : (stryCov_9fa48("3712"), 'No file uploaded'));
      return this.service.importJson(file.buffer, req.user.id);
    }
  }
  @Post('import/scorm')
  @ApiOperation({
    summary: 'Import a course from SCORM 1.2 or 2004 ZIP package'
  })
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
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: MAX_FILE_SIZE
    }
  }))
  importScorm(@UploadedFile()
  file: Express.Multer.File, @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3713")) {
      {}
    } else {
      stryCov_9fa48("3713");
      if (stryMutAct_9fa48("3716") ? false : stryMutAct_9fa48("3715") ? true : stryMutAct_9fa48("3714") ? file : (stryCov_9fa48("3714", "3715", "3716"), !file)) throw new BadRequestException(stryMutAct_9fa48("3717") ? "" : (stryCov_9fa48("3717"), 'No file uploaded'));
      return this.service.importScorm(file.buffer, req.user.id);
    }
  }
  @Post('import/bulk')
  @ApiOperation({
    summary: 'Bulk import multiple courses (JSON or SCORM ZIP). Returns a job ID for progress tracking.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary'
          }
        }
      }
    }
  })
  @UseInterceptors(FilesInterceptor('files', 20, {
    limits: {
      fileSize: MAX_FILE_SIZE
    }
  }))
  bulkImport(@UploadedFiles()
  files: Express.Multer.File[], @Request()
  req: {
    user: {
      id: string;
    };
  }) {
    if (stryMutAct_9fa48("3718")) {
      {}
    } else {
      stryCov_9fa48("3718");
      if (stryMutAct_9fa48("3721") ? false : stryMutAct_9fa48("3720") ? true : stryMutAct_9fa48("3719") ? files?.length : (stryCov_9fa48("3719", "3720", "3721"), !(stryMutAct_9fa48("3722") ? files.length : (stryCov_9fa48("3722"), files?.length)))) throw new BadRequestException(stryMutAct_9fa48("3723") ? "" : (stryCov_9fa48("3723"), 'No files uploaded'));
      const buffers = files.map(stryMutAct_9fa48("3724") ? () => undefined : (stryCov_9fa48("3724"), f => stryMutAct_9fa48("3725") ? {} : (stryCov_9fa48("3725"), {
        name: f.originalname,
        data: f.buffer
      })));
      return this.service.startBulkImport(buffers, req.user.id);
    }
  }
  @Get('import/jobs/:jobId')
  @ApiOperation({
    summary: 'Get progress/status of a bulk import job'
  })
  getJobStatus(@Param('jobId')
  jobId: string) {
    if (stryMutAct_9fa48("3726")) {
      {}
    } else {
      stryCov_9fa48("3726");
      return this.service.getJobStatus(jobId);
    }
  }
}