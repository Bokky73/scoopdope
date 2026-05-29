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
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Assignment, RubricCriterion } from './assignment.entity';
import { AssignmentSubmission } from './submission.entity';
import { PeerReview, RubricScore } from './peer-review.entity';
@Injectable()
export class AssignmentsService {
  constructor(@InjectRepository(Assignment)
  private assignmentRepo: Repository<Assignment>, @InjectRepository(AssignmentSubmission)
  private submissionRepo: Repository<AssignmentSubmission>, @InjectRepository(PeerReview)
  private peerReviewRepo: Repository<PeerReview>) {}
  async getAssignmentsByCourse(courseId: string) {
    if (stryMutAct_9fa48("531")) {
      {}
    } else {
      stryCov_9fa48("531");
      return this.assignmentRepo.find(stryMutAct_9fa48("532") ? {} : (stryCov_9fa48("532"), {
        where: stryMutAct_9fa48("533") ? {} : (stryCov_9fa48("533"), {
          lesson: stryMutAct_9fa48("534") ? {} : (stryCov_9fa48("534"), {
            module: stryMutAct_9fa48("535") ? {} : (stryCov_9fa48("535"), {
              courseId
            })
          })
        }),
        relations: stryMutAct_9fa48("536") ? [] : (stryCov_9fa48("536"), [stryMutAct_9fa48("537") ? "" : (stryCov_9fa48("537"), 'lesson'), stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), 'lesson.module')])
      }));
    }
  }
  async getAssignmentsByLesson(lessonId: string) {
    if (stryMutAct_9fa48("539")) {
      {}
    } else {
      stryCov_9fa48("539");
      return this.assignmentRepo.find(stryMutAct_9fa48("540") ? {} : (stryCov_9fa48("540"), {
        where: stryMutAct_9fa48("541") ? {} : (stryCov_9fa48("541"), {
          lessonId
        })
      }));
    }
  }
  async createAssignment(data: Partial<Assignment>) {
    if (stryMutAct_9fa48("542")) {
      {}
    } else {
      stryCov_9fa48("542");
      const assignment = this.assignmentRepo.create(data);
      return this.assignmentRepo.save(assignment);
    }
  }
  async getAssignment(id: string) {
    if (stryMutAct_9fa48("543")) {
      {}
    } else {
      stryCov_9fa48("543");
      const assignment = await this.assignmentRepo.findOne(stryMutAct_9fa48("544") ? {} : (stryCov_9fa48("544"), {
        where: stryMutAct_9fa48("545") ? {} : (stryCov_9fa48("545"), {
          id
        }),
        relations: stryMutAct_9fa48("546") ? [] : (stryCov_9fa48("546"), [stryMutAct_9fa48("547") ? "" : (stryCov_9fa48("547"), 'lesson')])
      }));
      if (stryMutAct_9fa48("550") ? false : stryMutAct_9fa48("549") ? true : stryMutAct_9fa48("548") ? assignment : (stryCov_9fa48("548", "549", "550"), !assignment)) throw new NotFoundException(stryMutAct_9fa48("551") ? "" : (stryCov_9fa48("551"), 'Assignment not found'));
      return assignment;
    }
  }
  async submitAssignment(userId: string, assignmentId: string, fileUrl: string) {
    if (stryMutAct_9fa48("552")) {
      {}
    } else {
      stryCov_9fa48("552");
      const assignment = await this.getAssignment(assignmentId);
      if (stryMutAct_9fa48("556") ? new Date() <= assignment.dueDate : stryMutAct_9fa48("555") ? new Date() >= assignment.dueDate : stryMutAct_9fa48("554") ? false : stryMutAct_9fa48("553") ? true : (stryCov_9fa48("553", "554", "555", "556"), new Date() > assignment.dueDate)) {
        if (stryMutAct_9fa48("557")) {
          {}
        } else {
          stryCov_9fa48("557");
          throw new BadRequestException(stryMutAct_9fa48("558") ? "" : (stryCov_9fa48("558"), 'Assignment due date has passed'));
        }
      }
      let submission = await this.submissionRepo.findOne(stryMutAct_9fa48("559") ? {} : (stryCov_9fa48("559"), {
        where: stryMutAct_9fa48("560") ? {} : (stryCov_9fa48("560"), {
          userId,
          assignmentId
        })
      }));
      if (stryMutAct_9fa48("562") ? false : stryMutAct_9fa48("561") ? true : (stryCov_9fa48("561", "562"), submission)) {
        if (stryMutAct_9fa48("563")) {
          {}
        } else {
          stryCov_9fa48("563");
          submission.fileUrl = fileUrl;
          submission.submittedAt = new Date();
        }
      } else {
        if (stryMutAct_9fa48("564")) {
          {}
        } else {
          stryCov_9fa48("564");
          submission = this.submissionRepo.create(stryMutAct_9fa48("565") ? {} : (stryCov_9fa48("565"), {
            userId,
            assignmentId,
            fileUrl
          }));
        }
      }
      return this.submissionRepo.save(submission);
    }
  }
  async getSubmission(id: string) {
    if (stryMutAct_9fa48("566")) {
      {}
    } else {
      stryCov_9fa48("566");
      const submission = await this.submissionRepo.findOne(stryMutAct_9fa48("567") ? {} : (stryCov_9fa48("567"), {
        where: stryMutAct_9fa48("568") ? {} : (stryCov_9fa48("568"), {
          id
        }),
        relations: stryMutAct_9fa48("569") ? [] : (stryCov_9fa48("569"), [stryMutAct_9fa48("570") ? "" : (stryCov_9fa48("570"), 'assignment'), stryMutAct_9fa48("571") ? "" : (stryCov_9fa48("571"), 'peerReviews'), stryMutAct_9fa48("572") ? "" : (stryCov_9fa48("572"), 'peerReviews.reviewer')])
      }));
      if (stryMutAct_9fa48("575") ? false : stryMutAct_9fa48("574") ? true : stryMutAct_9fa48("573") ? submission : (stryCov_9fa48("573", "574", "575"), !submission)) throw new NotFoundException(stryMutAct_9fa48("576") ? "" : (stryCov_9fa48("576"), 'Submission not found'));
      return submission;
    }
  }
  async getSubmissionByUser(userId: string, assignmentId: string) {
    if (stryMutAct_9fa48("577")) {
      {}
    } else {
      stryCov_9fa48("577");
      return this.submissionRepo.findOne(stryMutAct_9fa48("578") ? {} : (stryCov_9fa48("578"), {
        where: stryMutAct_9fa48("579") ? {} : (stryCov_9fa48("579"), {
          userId,
          assignmentId
        }),
        relations: stryMutAct_9fa48("580") ? [] : (stryCov_9fa48("580"), [stryMutAct_9fa48("581") ? "" : (stryCov_9fa48("581"), 'peerReviews'), stryMutAct_9fa48("582") ? "" : (stryCov_9fa48("582"), 'peerReviews.reviewer')])
      }));
    }
  }

  /**
   * Assigns 3 peer reviewers to each submission for a given assignment.
   * Uses a circular assignment strategy to ensure balance.
   */
  async assignReviewers(assignmentId: string) {
    if (stryMutAct_9fa48("583")) {
      {}
    } else {
      stryCov_9fa48("583");
      const submissions = await this.submissionRepo.find(stryMutAct_9fa48("584") ? {} : (stryCov_9fa48("584"), {
        where: stryMutAct_9fa48("585") ? {} : (stryCov_9fa48("585"), {
          assignmentId
        }),
        order: stryMutAct_9fa48("586") ? {} : (stryCov_9fa48("586"), {
          submittedAt: stryMutAct_9fa48("587") ? "" : (stryCov_9fa48("587"), 'ASC')
        })
      }));
      if (stryMutAct_9fa48("591") ? submissions.length >= 4 : stryMutAct_9fa48("590") ? submissions.length <= 4 : stryMutAct_9fa48("589") ? false : stryMutAct_9fa48("588") ? true : (stryCov_9fa48("588", "589", "590", "591"), submissions.length < 4)) {
        if (stryMutAct_9fa48("592")) {
          {}
        } else {
          stryCov_9fa48("592");
          throw new BadRequestException(stryMutAct_9fa48("593") ? "" : (stryCov_9fa48("593"), 'Not enough submissions to assign 3 reviewers (minimum 4 required)'));
        }
      }
      const n = submissions.length;
      const assignments: Partial<PeerReview>[] = stryMutAct_9fa48("594") ? ["Stryker was here"] : (stryCov_9fa48("594"), []);
      for (let i = 0; stryMutAct_9fa48("597") ? i >= n : stryMutAct_9fa48("596") ? i <= n : stryMutAct_9fa48("595") ? false : (stryCov_9fa48("595", "596", "597"), i < n); stryMutAct_9fa48("598") ? i-- : (stryCov_9fa48("598"), i++)) {
        if (stryMutAct_9fa48("599")) {
          {}
        } else {
          stryCov_9fa48("599");
          // User i will review submissions (i+1)%n, (i+2)%n, (i+3)%n
          for (let offset = 1; stryMutAct_9fa48("602") ? offset > 3 : stryMutAct_9fa48("601") ? offset < 3 : stryMutAct_9fa48("600") ? false : (stryCov_9fa48("600", "601", "602"), offset <= 3); stryMutAct_9fa48("603") ? offset-- : (stryCov_9fa48("603"), offset++)) {
            if (stryMutAct_9fa48("604")) {
              {}
            } else {
              stryCov_9fa48("604");
              const submissionToReview = submissions[stryMutAct_9fa48("605") ? (i + offset) * n : (stryCov_9fa48("605"), (stryMutAct_9fa48("606") ? i - offset : (stryCov_9fa48("606"), i + offset)) % n)];
              assignments.push(stryMutAct_9fa48("607") ? {} : (stryCov_9fa48("607"), {
                reviewerId: submissions[i].userId,
                submissionId: submissionToReview.id
              }));
            }
          }
        }
      }

      // Clear existing assignments if any (or just skip duplicates)
      // For simplicity, we'll use save which handles updates if we had IDs, 
      // but here we just want to create new ones.
      // Better to check for existence or clear first.
      // Let's clear unsubmitted peer reviews for this assignment's submissions.
      const submissionIds = submissions.map(stryMutAct_9fa48("608") ? () => undefined : (stryCov_9fa48("608"), s => s.id));
      await this.peerReviewRepo.delete(stryMutAct_9fa48("609") ? {} : (stryCov_9fa48("609"), {
        submissionId: In(submissionIds),
        isSubmitted: stryMutAct_9fa48("610") ? true : (stryCov_9fa48("610"), false)
      }));
      return this.peerReviewRepo.save(this.peerReviewRepo.create(assignments));
    }
  }
  async submitPeerReview(reviewerId: string, submissionId: string, scores: RubricScore[], overallFeedback: string) {
    if (stryMutAct_9fa48("611")) {
      {}
    } else {
      stryCov_9fa48("611");
      const review = await this.peerReviewRepo.findOne(stryMutAct_9fa48("612") ? {} : (stryCov_9fa48("612"), {
        where: stryMutAct_9fa48("613") ? {} : (stryCov_9fa48("613"), {
          reviewerId,
          submissionId
        })
      }));
      if (stryMutAct_9fa48("616") ? false : stryMutAct_9fa48("615") ? true : stryMutAct_9fa48("614") ? review : (stryCov_9fa48("614", "615", "616"), !review)) {
        if (stryMutAct_9fa48("617")) {
          {}
        } else {
          stryCov_9fa48("617");
          throw new NotFoundException(stryMutAct_9fa48("618") ? "" : (stryCov_9fa48("618"), 'Peer review assignment not found'));
        }
      }
      review.scores = scores;
      review.overallFeedback = overallFeedback;
      review.isSubmitted = stryMutAct_9fa48("619") ? false : (stryCov_9fa48("619"), true);
      await this.peerReviewRepo.save(review);

      // After a review is submitted, check if we can calculate the final grade
      await this.calculateFinalGrade(submissionId);
      return review;
    }
  }
  async calculateFinalGrade(submissionId: string) {
    if (stryMutAct_9fa48("620")) {
      {}
    } else {
      stryCov_9fa48("620");
      const submission = await this.submissionRepo.findOne(stryMutAct_9fa48("621") ? {} : (stryCov_9fa48("621"), {
        where: stryMutAct_9fa48("622") ? {} : (stryCov_9fa48("622"), {
          id: submissionId
        }),
        relations: stryMutAct_9fa48("623") ? [] : (stryCov_9fa48("623"), [stryMutAct_9fa48("624") ? "" : (stryCov_9fa48("624"), 'peerReviews'), stryMutAct_9fa48("625") ? "" : (stryCov_9fa48("625"), 'assignment')])
      }));
      if (stryMutAct_9fa48("628") ? false : stryMutAct_9fa48("627") ? true : stryMutAct_9fa48("626") ? submission : (stryCov_9fa48("626", "627", "628"), !submission)) return;

      // If instructor has set a grade, that's the final grade (override)
      if (stryMutAct_9fa48("631") ? submission.instructorGrade !== null || submission.instructorGrade !== undefined : stryMutAct_9fa48("630") ? false : stryMutAct_9fa48("629") ? true : (stryCov_9fa48("629", "630", "631"), (stryMutAct_9fa48("633") ? submission.instructorGrade === null : stryMutAct_9fa48("632") ? true : (stryCov_9fa48("632", "633"), submission.instructorGrade !== null)) && (stryMutAct_9fa48("635") ? submission.instructorGrade === undefined : stryMutAct_9fa48("634") ? true : (stryCov_9fa48("634", "635"), submission.instructorGrade !== undefined)))) {
        if (stryMutAct_9fa48("636")) {
          {}
        } else {
          stryCov_9fa48("636");
          submission.finalGrade = submission.instructorGrade;
          return this.submissionRepo.save(submission);
        }
      }
      const completedReviews = stryMutAct_9fa48("637") ? submission.peerReviews : (stryCov_9fa48("637"), submission.peerReviews.filter(stryMutAct_9fa48("638") ? () => undefined : (stryCov_9fa48("638"), r => r.isSubmitted)));
      if (stryMutAct_9fa48("641") ? completedReviews.length !== 0 : stryMutAct_9fa48("640") ? false : stryMutAct_9fa48("639") ? true : (stryCov_9fa48("639", "640", "641"), completedReviews.length === 0)) return;

      // Calculate average score from peer reviews
      let totalPeerScore = 0;
      for (const review of completedReviews) {
        if (stryMutAct_9fa48("642")) {
          {}
        } else {
          stryCov_9fa48("642");
          const reviewScore = review.scores.reduce(stryMutAct_9fa48("643") ? () => undefined : (stryCov_9fa48("643"), (sum, s) => stryMutAct_9fa48("644") ? sum - s.score : (stryCov_9fa48("644"), sum + s.score)), 0);
          stryMutAct_9fa48("645") ? totalPeerScore -= reviewScore : (stryCov_9fa48("645"), totalPeerScore += reviewScore);
        }
      }
      const averageScore = stryMutAct_9fa48("646") ? totalPeerScore * completedReviews.length : (stryCov_9fa48("646"), totalPeerScore / completedReviews.length);
      submission.finalGrade = averageScore;
      return this.submissionRepo.save(submission);
    }
  }
  async instructorOverride(submissionId: string, grade: number, feedback: string) {
    if (stryMutAct_9fa48("647")) {
      {}
    } else {
      stryCov_9fa48("647");
      const submission = await this.submissionRepo.findOne(stryMutAct_9fa48("648") ? {} : (stryCov_9fa48("648"), {
        where: stryMutAct_9fa48("649") ? {} : (stryCov_9fa48("649"), {
          id: submissionId
        })
      }));
      if (stryMutAct_9fa48("652") ? false : stryMutAct_9fa48("651") ? true : stryMutAct_9fa48("650") ? submission : (stryCov_9fa48("650", "651", "652"), !submission)) throw new NotFoundException(stryMutAct_9fa48("653") ? "" : (stryCov_9fa48("653"), 'Submission not found'));
      submission.instructorGrade = grade;
      submission.instructorFeedback = feedback;
      submission.finalGrade = grade;
      return this.submissionRepo.save(submission);
    }
  }
  async getReviewsForUser(userId: string) {
    if (stryMutAct_9fa48("654")) {
      {}
    } else {
      stryCov_9fa48("654");
      return this.peerReviewRepo.find(stryMutAct_9fa48("655") ? {} : (stryCov_9fa48("655"), {
        where: stryMutAct_9fa48("656") ? {} : (stryCov_9fa48("656"), {
          reviewerId: userId
        }),
        relations: stryMutAct_9fa48("657") ? [] : (stryCov_9fa48("657"), [stryMutAct_9fa48("658") ? "" : (stryCov_9fa48("658"), 'submission'), stryMutAct_9fa48("659") ? "" : (stryCov_9fa48("659"), 'submission.assignment')])
      }));
    }
  }
}