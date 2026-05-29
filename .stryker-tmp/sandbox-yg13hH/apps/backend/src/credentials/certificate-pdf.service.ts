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
import { Injectable } from '@nestjs/common';
import { Credential } from './credential.entity';
@Injectable()
export class CertificatePdfService {
  generateCertificatePdf(credential: Credential) {
    if (stryMutAct_9fa48("3188")) {
      {}
    } else {
      stryCov_9fa48("3188");
      const recipient = stryMutAct_9fa48("3191") ? (credential.user?.username || credential.user?.email) && credential.userId : stryMutAct_9fa48("3190") ? false : stryMutAct_9fa48("3189") ? true : (stryCov_9fa48("3189", "3190", "3191"), (stryMutAct_9fa48("3193") ? credential.user?.username && credential.user?.email : stryMutAct_9fa48("3192") ? false : (stryCov_9fa48("3192", "3193"), (stryMutAct_9fa48("3194") ? credential.user.username : (stryCov_9fa48("3194"), credential.user?.username)) || (stryMutAct_9fa48("3195") ? credential.user.email : (stryCov_9fa48("3195"), credential.user?.email)))) || credential.userId);
      const courseTitle = stryMutAct_9fa48("3198") ? credential.course?.title && credential.courseId : stryMutAct_9fa48("3197") ? false : stryMutAct_9fa48("3196") ? true : (stryCov_9fa48("3196", "3197", "3198"), (stryMutAct_9fa48("3199") ? credential.course.title : (stryCov_9fa48("3199"), credential.course?.title)) || credential.courseId);
      const issuedAt = stryMutAct_9fa48("3200") ? credential.issuedAt.toISOString() : (stryCov_9fa48("3200"), credential.issuedAt.toISOString().slice(0, 10));
      const verificationRef = stryMutAct_9fa48("3203") ? credential.txHash && credential.id : stryMutAct_9fa48("3202") ? false : stryMutAct_9fa48("3201") ? true : (stryCov_9fa48("3201", "3202", "3203"), credential.txHash || credential.id);
      const lines = stryMutAct_9fa48("3204") ? [] : (stryCov_9fa48("3204"), [stryMutAct_9fa48("3205") ? {} : (stryCov_9fa48("3205"), {
        size: 26,
        x: 140,
        y: 730,
        text: stryMutAct_9fa48("3206") ? "" : (stryCov_9fa48("3206"), 'Certificate of Completion')
      }), stryMutAct_9fa48("3207") ? {} : (stryCov_9fa48("3207"), {
        size: 14,
        x: 72,
        y: 670,
        text: stryMutAct_9fa48("3208") ? "" : (stryCov_9fa48("3208"), 'This certifies that')
      }), stryMutAct_9fa48("3209") ? {} : (stryCov_9fa48("3209"), {
        size: 22,
        x: 72,
        y: 635,
        text: recipient
      }), stryMutAct_9fa48("3210") ? {} : (stryCov_9fa48("3210"), {
        size: 14,
        x: 72,
        y: 595,
        text: stryMutAct_9fa48("3211") ? "" : (stryCov_9fa48("3211"), 'has successfully completed the course')
      }), stryMutAct_9fa48("3212") ? {} : (stryCov_9fa48("3212"), {
        size: 20,
        x: 72,
        y: 560,
        text: courseTitle
      }), stryMutAct_9fa48("3213") ? {} : (stryCov_9fa48("3213"), {
        size: 12,
        x: 72,
        y: 500,
        text: stryMutAct_9fa48("3214") ? `` : (stryCov_9fa48("3214"), `Issued: ${issuedAt}`)
      }), stryMutAct_9fa48("3215") ? {} : (stryCov_9fa48("3215"), {
        size: 12,
        x: 72,
        y: 478,
        text: stryMutAct_9fa48("3216") ? `` : (stryCov_9fa48("3216"), `Credential ID: ${credential.id}`)
      }), stryMutAct_9fa48("3217") ? {} : (stryCov_9fa48("3217"), {
        size: 12,
        x: 72,
        y: 456,
        text: stryMutAct_9fa48("3218") ? `` : (stryCov_9fa48("3218"), `Verification Ref: ${verificationRef}`)
      }), stryMutAct_9fa48("3219") ? {} : (stryCov_9fa48("3219"), {
        size: 12,
        x: 72,
        y: 415,
        text: stryMutAct_9fa48("3220") ? "" : (stryCov_9fa48("3220"), 'Scan target / verify payload:')
      }), stryMutAct_9fa48("3221") ? {} : (stryCov_9fa48("3221"), {
        size: 10,
        x: 72,
        y: 392,
        text: stryMutAct_9fa48("3222") ? `` : (stryCov_9fa48("3222"), `scoopdope://credentials/${credential.id}/verify`)
      })]);
      const stream = (stryMutAct_9fa48("3223") ? [] : (stryCov_9fa48("3223"), [stryMutAct_9fa48("3224") ? "" : (stryCov_9fa48("3224"), 'BT'), stryMutAct_9fa48("3225") ? "" : (stryCov_9fa48("3225"), '/F1 18 Tf'), ...lines.map(stryMutAct_9fa48("3226") ? () => undefined : (stryCov_9fa48("3226"), ({
        size,
        x,
        y,
        text
      }) => stryMutAct_9fa48("3227") ? `` : (stryCov_9fa48("3227"), `BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${this.escapePdfText(text)}) Tj ET`))), stryMutAct_9fa48("3228") ? "" : (stryCov_9fa48("3228"), 'ET')])).join(stryMutAct_9fa48("3229") ? "" : (stryCov_9fa48("3229"), '\n'));
      return this.buildPdf(stream);
    }
  }
  private buildPdf(content: string) {
    if (stryMutAct_9fa48("3230")) {
      {}
    } else {
      stryCov_9fa48("3230");
      const objects = stryMutAct_9fa48("3231") ? [] : (stryCov_9fa48("3231"), [stryMutAct_9fa48("3232") ? "" : (stryCov_9fa48("3232"), '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj'), stryMutAct_9fa48("3233") ? "" : (stryCov_9fa48("3233"), '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj'), stryMutAct_9fa48("3234") ? "" : (stryCov_9fa48("3234"), '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj'), stryMutAct_9fa48("3235") ? "" : (stryCov_9fa48("3235"), '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'), stryMutAct_9fa48("3236") ? `` : (stryCov_9fa48("3236"), `5 0 obj\n<< /Length ${Buffer.byteLength(content, stryMutAct_9fa48("3237") ? "" : (stryCov_9fa48("3237"), 'utf8'))} >>\nstream\n${content}\nendstream\nendobj`)]);
      let pdf = stryMutAct_9fa48("3238") ? "" : (stryCov_9fa48("3238"), '%PDF-1.4\n');
      const offsets = stryMutAct_9fa48("3239") ? [] : (stryCov_9fa48("3239"), [0]);
      for (const object of objects) {
        if (stryMutAct_9fa48("3240")) {
          {}
        } else {
          stryCov_9fa48("3240");
          offsets.push(Buffer.byteLength(pdf, stryMutAct_9fa48("3241") ? "" : (stryCov_9fa48("3241"), 'utf8')));
          pdf += stryMutAct_9fa48("3242") ? `` : (stryCov_9fa48("3242"), `${object}\n`);
        }
      }
      const xrefOffset = Buffer.byteLength(pdf, stryMutAct_9fa48("3243") ? "" : (stryCov_9fa48("3243"), 'utf8'));
      pdf += stryMutAct_9fa48("3244") ? `` : (stryCov_9fa48("3244"), `xref\n0 ${stryMutAct_9fa48("3245") ? objects.length - 1 : (stryCov_9fa48("3245"), objects.length + 1)}\n`);
      pdf += stryMutAct_9fa48("3246") ? "" : (stryCov_9fa48("3246"), '0000000000 65535 f \n');
      for (let index = 1; stryMutAct_9fa48("3249") ? index >= offsets.length : stryMutAct_9fa48("3248") ? index <= offsets.length : stryMutAct_9fa48("3247") ? false : (stryCov_9fa48("3247", "3248", "3249"), index < offsets.length); stryMutAct_9fa48("3250") ? index -= 1 : (stryCov_9fa48("3250"), index += 1)) {
        if (stryMutAct_9fa48("3251")) {
          {}
        } else {
          stryCov_9fa48("3251");
          pdf += stryMutAct_9fa48("3252") ? `` : (stryCov_9fa48("3252"), `${offsets[index].toString().padStart(10, stryMutAct_9fa48("3253") ? "" : (stryCov_9fa48("3253"), '0'))} 00000 n \n`);
        }
      }
      pdf += stryMutAct_9fa48("3254") ? `` : (stryCov_9fa48("3254"), `trailer\n<< /Size ${stryMutAct_9fa48("3255") ? objects.length - 1 : (stryCov_9fa48("3255"), objects.length + 1)} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
      return Buffer.from(pdf, stryMutAct_9fa48("3256") ? "" : (stryCov_9fa48("3256"), 'utf8'));
    }
  }
  private escapePdfText(value: string) {
    if (stryMutAct_9fa48("3257")) {
      {}
    } else {
      stryCov_9fa48("3257");
      return value.replace(/\\/g, stryMutAct_9fa48("3258") ? "" : (stryCov_9fa48("3258"), '\\\\')).replace(/\(/g, stryMutAct_9fa48("3259") ? "" : (stryCov_9fa48("3259"), '\\(')).replace(/\)/g, stryMutAct_9fa48("3260") ? "" : (stryCov_9fa48("3260"), '\\)'));
    }
  }
}