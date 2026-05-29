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
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CourseQueryDto } from './dto/course-query.dto';
import { ScheduleCourseDto } from './dto/schedule-course.dto';
@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}
  @Get()
  @ApiOperation({
    summary: 'Get all published courses'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by title or description (ILIKE)'
  })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Filter by level'
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by BCP-47 language code (e.g. "en", "es", "fr", "ar")'
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
    description: 'Returns paginated published courses',
    schema: {
      example: {
        data: [],
        total: 0,
        page: 1,
        limit: 20
      }
    }
  })
  findAll(@Query()
  query: CourseQueryDto) {
    if (stryMutAct_9fa48("2403")) {
      {}
    } else {
      stryCov_9fa48("2403");
      return this.coursesService.findAll(query);
    }
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get a course by ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a single course',
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
    description: 'Course not found'
  })
  findOne(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2404")) {
      {}
    } else {
      stryCov_9fa48("2404");
      return this.coursesService.findOne(id);
    }
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new course'
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Intro to Stellar',
        description: 'Learn Stellar basics',
        level: 'beginner'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    schema: {
      example: {
        data: {},
        statusCode: 201,
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
    description: 'Forbidden - insufficient permissions'
  })
  create(@Body()
  data: any) {
    if (stryMutAct_9fa48("2405")) {
      {}
    } else {
      stryCov_9fa48("2405");
      return this.coursesService.create(data);
    }
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a course'
  })
  @ApiBody({
    schema: {
      example: {
        title: 'Updated title',
        description: 'Updated description'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
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
    description: 'Forbidden - insufficient permissions'
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found'
  })
  update(@Param('id')
  id: string, @Body()
  data: any) {
    if (stryMutAct_9fa48("2406")) {
      {}
    } else {
      stryCov_9fa48("2406");
      return this.coursesService.update(id, data);
    }
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a course'
  })
  @ApiResponse({
    status: 200,
    description: 'Course deleted successfully',
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
    description: 'Forbidden - insufficient permissions'
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found'
  })
  delete(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2407")) {
      {}
    } else {
      stryCov_9fa48("2407");
      return this.coursesService.delete(id);
    }
  }
  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Schedule a course for future publication'
  })
  @ApiBody({
    type: ScheduleCourseDto
  })
  @ApiResponse({
    status: 200,
    description: 'Course scheduled'
  })
  @ApiResponse({
    status: 400,
    description: 'scheduledAt must be in the future'
  })
  schedule(@Param('id')
  id: string, @Body()
  dto: ScheduleCourseDto) {
    if (stryMutAct_9fa48("2408")) {
      {}
    } else {
      stryCov_9fa48("2408");
      const scheduledAt = resolveScheduledAt(dto.scheduledAt, dto.timezone);
      return this.coursesService.scheduleCourse(id, scheduledAt);
    }
  }
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Immediately publish a course'
  })
  @ApiResponse({
    status: 200,
    description: 'Course published'
  })
  publishNow(@Param('id')
  id: string) {
    if (stryMutAct_9fa48("2409")) {
      {}
    } else {
      stryCov_9fa48("2409");
      return this.coursesService.publishNow(id);
    }
  }
}

/**
 * Converts an ISO datetime string to a UTC Date, optionally interpreting it
 * in the given IANA timezone (e.g. "America/New_York").
 *
 * If the input already carries a UTC offset (e.g. "2026-05-01T10:00:00-05:00")
 * the timezone parameter is ignored — the offset in the string takes precedence.
 */
function resolveScheduledAt(isoString: string, timezone?: string): Date {
  if (stryMutAct_9fa48("2410")) {
    {}
  } else {
    stryCov_9fa48("2410");
    // If the string already has an explicit offset, parse it directly.
    if (stryMutAct_9fa48("2412") ? false : stryMutAct_9fa48("2411") ? true : (stryCov_9fa48("2411", "2412"), (stryMutAct_9fa48("2419") ? /[+-]\d{2}:\d{2}$|Z/ : stryMutAct_9fa48("2418") ? /[+-]\d{2}:\D{2}$|Z$/ : stryMutAct_9fa48("2417") ? /[+-]\d{2}:\d$|Z$/ : stryMutAct_9fa48("2416") ? /[+-]\D{2}:\d{2}$|Z$/ : stryMutAct_9fa48("2415") ? /[+-]\d:\d{2}$|Z$/ : stryMutAct_9fa48("2414") ? /[^+-]\d{2}:\d{2}$|Z$/ : stryMutAct_9fa48("2413") ? /[+-]\d{2}:\d{2}|Z$/ : (stryCov_9fa48("2413", "2414", "2415", "2416", "2417", "2418", "2419"), /[+-]\d{2}:\d{2}$|Z$/)).test(isoString))) {
      if (stryMutAct_9fa48("2420")) {
        {}
      } else {
        stryCov_9fa48("2420");
        return new Date(isoString);
      }
    }
    if (stryMutAct_9fa48("2423") ? false : stryMutAct_9fa48("2422") ? true : stryMutAct_9fa48("2421") ? timezone : (stryCov_9fa48("2421", "2422", "2423"), !timezone)) {
      if (stryMutAct_9fa48("2424")) {
        {}
      } else {
        stryCov_9fa48("2424");
        return new Date(isoString);
      }
    }

    // Use Intl to find the UTC offset for the given timezone at the requested moment.
    const naive = new Date(isoString);
    const formatter = new Intl.DateTimeFormat(stryMutAct_9fa48("2425") ? "" : (stryCov_9fa48("2425"), 'en-US'), stryMutAct_9fa48("2426") ? {} : (stryCov_9fa48("2426"), {
      timeZone: timezone,
      year: stryMutAct_9fa48("2427") ? "" : (stryCov_9fa48("2427"), 'numeric'),
      month: stryMutAct_9fa48("2428") ? "" : (stryCov_9fa48("2428"), '2-digit'),
      day: stryMutAct_9fa48("2429") ? "" : (stryCov_9fa48("2429"), '2-digit'),
      hour: stryMutAct_9fa48("2430") ? "" : (stryCov_9fa48("2430"), '2-digit'),
      minute: stryMutAct_9fa48("2431") ? "" : (stryCov_9fa48("2431"), '2-digit'),
      second: stryMutAct_9fa48("2432") ? "" : (stryCov_9fa48("2432"), '2-digit'),
      hour12: stryMutAct_9fa48("2433") ? true : (stryCov_9fa48("2433"), false)
    }));

    // Re-parse the formatted local time back to UTC via the offset trick.
    const parts = formatter.formatToParts(naive);
    const get = stryMutAct_9fa48("2434") ? () => undefined : (stryCov_9fa48("2434"), (() => {
      const get = (type: string) => Number(stryMutAct_9fa48("2435") ? parts.find(p => p.type === type)?.value && 0 : (stryCov_9fa48("2435"), (stryMutAct_9fa48("2436") ? parts.find(p => p.type === type).value : (stryCov_9fa48("2436"), parts.find(stryMutAct_9fa48("2437") ? () => undefined : (stryCov_9fa48("2437"), p => stryMutAct_9fa48("2440") ? p.type !== type : stryMutAct_9fa48("2439") ? false : stryMutAct_9fa48("2438") ? true : (stryCov_9fa48("2438", "2439", "2440"), p.type === type)))?.value)) ?? 0));
      return get;
    })());
    const localDate = new Date(Date.UTC(get(stryMutAct_9fa48("2441") ? "" : (stryCov_9fa48("2441"), 'year')), stryMutAct_9fa48("2442") ? get('month') + 1 : (stryCov_9fa48("2442"), get(stryMutAct_9fa48("2443") ? "" : (stryCov_9fa48("2443"), 'month')) - 1), get(stryMutAct_9fa48("2444") ? "" : (stryCov_9fa48("2444"), 'day')), get(stryMutAct_9fa48("2445") ? "" : (stryCov_9fa48("2445"), 'hour')), get(stryMutAct_9fa48("2446") ? "" : (stryCov_9fa48("2446"), 'minute')), get(stryMutAct_9fa48("2447") ? "" : (stryCov_9fa48("2447"), 'second'))));
    const offsetMs = stryMutAct_9fa48("2448") ? localDate.getTime() + naive.getTime() : (stryCov_9fa48("2448"), localDate.getTime() - naive.getTime());
    return new Date(stryMutAct_9fa48("2449") ? naive.getTime() + offsetMs : (stryCov_9fa48("2449"), naive.getTime() - offsetMs));
  }
}