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
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Note } from './note.entity';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
@Injectable()
export class NotesService {
  constructor(@InjectRepository(Note)
  private repo: Repository<Note>) {}
  findByLesson(userId: string, lessonId: string, search?: string): Promise<Note[]> {
    if (stryMutAct_9fa48("5221")) {
      {}
    } else {
      stryCov_9fa48("5221");
      return this.repo.find(stryMutAct_9fa48("5222") ? {} : (stryCov_9fa48("5222"), {
        where: stryMutAct_9fa48("5223") ? {} : (stryCov_9fa48("5223"), {
          userId,
          lessonId,
          ...(search ? stryMutAct_9fa48("5224") ? {} : (stryCov_9fa48("5224"), {
            content: ILike(stryMutAct_9fa48("5225") ? `` : (stryCov_9fa48("5225"), `%${search}%`))
          }) : {})
        }),
        order: stryMutAct_9fa48("5226") ? {} : (stryCov_9fa48("5226"), {
          timestamp: stryMutAct_9fa48("5227") ? "" : (stryCov_9fa48("5227"), 'ASC')
        })
      }));
    }
  }
  findByUser(userId: string, search?: string): Promise<Note[]> {
    if (stryMutAct_9fa48("5228")) {
      {}
    } else {
      stryCov_9fa48("5228");
      return this.repo.find(stryMutAct_9fa48("5229") ? {} : (stryCov_9fa48("5229"), {
        where: stryMutAct_9fa48("5230") ? {} : (stryCov_9fa48("5230"), {
          userId,
          ...(search ? stryMutAct_9fa48("5231") ? {} : (stryCov_9fa48("5231"), {
            content: ILike(stryMutAct_9fa48("5232") ? `` : (stryCov_9fa48("5232"), `%${search}%`))
          }) : {})
        }),
        order: stryMutAct_9fa48("5233") ? {} : (stryCov_9fa48("5233"), {
          createdAt: stryMutAct_9fa48("5234") ? "" : (stryCov_9fa48("5234"), 'DESC')
        })
      }));
    }
  }
  create(userId: string, lessonId: string, dto: CreateNoteDto): Promise<Note> {
    if (stryMutAct_9fa48("5235")) {
      {}
    } else {
      stryCov_9fa48("5235");
      return this.repo.save(this.repo.create(stryMutAct_9fa48("5236") ? {} : (stryCov_9fa48("5236"), {
        userId,
        lessonId,
        ...dto
      })));
    }
  }
  async update(id: string, userId: string, dto: UpdateNoteDto): Promise<Note> {
    if (stryMutAct_9fa48("5237")) {
      {}
    } else {
      stryCov_9fa48("5237");
      const note = await this.repo.findOne(stryMutAct_9fa48("5238") ? {} : (stryCov_9fa48("5238"), {
        where: stryMutAct_9fa48("5239") ? {} : (stryCov_9fa48("5239"), {
          id
        })
      }));
      if (stryMutAct_9fa48("5242") ? false : stryMutAct_9fa48("5241") ? true : stryMutAct_9fa48("5240") ? note : (stryCov_9fa48("5240", "5241", "5242"), !note)) throw new NotFoundException(stryMutAct_9fa48("5243") ? "" : (stryCov_9fa48("5243"), 'Note not found'));
      if (stryMutAct_9fa48("5246") ? note.userId === userId : stryMutAct_9fa48("5245") ? false : stryMutAct_9fa48("5244") ? true : (stryCov_9fa48("5244", "5245", "5246"), note.userId !== userId)) throw new ForbiddenException();
      return this.repo.save(stryMutAct_9fa48("5247") ? {} : (stryCov_9fa48("5247"), {
        ...note,
        ...dto
      }));
    }
  }
  async remove(id: string, userId: string): Promise<void> {
    if (stryMutAct_9fa48("5248")) {
      {}
    } else {
      stryCov_9fa48("5248");
      const note = await this.repo.findOne(stryMutAct_9fa48("5249") ? {} : (stryCov_9fa48("5249"), {
        where: stryMutAct_9fa48("5250") ? {} : (stryCov_9fa48("5250"), {
          id
        })
      }));
      if (stryMutAct_9fa48("5253") ? false : stryMutAct_9fa48("5252") ? true : stryMutAct_9fa48("5251") ? note : (stryCov_9fa48("5251", "5252", "5253"), !note)) throw new NotFoundException(stryMutAct_9fa48("5254") ? "" : (stryCov_9fa48("5254"), 'Note not found'));
      if (stryMutAct_9fa48("5257") ? note.userId === userId : stryMutAct_9fa48("5256") ? false : stryMutAct_9fa48("5255") ? true : (stryCov_9fa48("5255", "5256", "5257"), note.userId !== userId)) throw new ForbiddenException();
      await this.repo.remove(note);
    }
  }
}