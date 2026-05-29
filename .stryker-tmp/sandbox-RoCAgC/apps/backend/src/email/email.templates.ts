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
export const emailTemplates = stryMutAct_9fa48("3497") ? {} : (stryCov_9fa48("3497"), {
  enrollment: stryMutAct_9fa48("3498") ? () => undefined : (stryCov_9fa48("3498"), (data: {
    userName: string;
    courseTitle: string;
    courseUrl: string;
    unsubscribeUrl: string;
  }) => stryMutAct_9fa48("3499") ? {} : (stryCov_9fa48("3499"), {
    subject: stryMutAct_9fa48("3500") ? `` : (stryCov_9fa48("3500"), `You're enrolled in "${data.courseTitle}"`),
    html: stryMutAct_9fa48("3501") ? `` : (stryCov_9fa48("3501"), `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Welcome to ${data.courseTitle}!</h2>
        <p>Hi ${data.userName},</p>
        <p>You've successfully enrolled. Start learning now:</p>
        <a href="${data.courseUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Go to Course</a>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`)
  })),
  completion: stryMutAct_9fa48("3502") ? () => undefined : (stryCov_9fa48("3502"), (data: {
    userName: string;
    courseTitle: string;
    credentialUrl: string;
    unsubscribeUrl: string;
  }) => stryMutAct_9fa48("3503") ? {} : (stryCov_9fa48("3503"), {
    subject: stryMutAct_9fa48("3504") ? `` : (stryCov_9fa48("3504"), `Congratulations! You completed "${data.courseTitle}"`),
    html: stryMutAct_9fa48("3505") ? `` : (stryCov_9fa48("3505"), `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>🎉 Course Completed!</h2>
        <p>Hi ${data.userName},</p>
        <p>You've completed <strong>${data.courseTitle}</strong>. Your credential is ready:</p>
        <a href="${data.credentialUrl}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Credential</a>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`)
  })),
  credentialIssued: stryMutAct_9fa48("3506") ? () => undefined : (stryCov_9fa48("3506"), (data: {
    userName: string;
    courseTitle: string;
    txHash: string;
    unsubscribeUrl: string;
  }) => stryMutAct_9fa48("3507") ? {} : (stryCov_9fa48("3507"), {
    subject: stryMutAct_9fa48("3508") ? `` : (stryCov_9fa48("3508"), `Your blockchain credential for "${data.courseTitle}" is ready`),
    html: stryMutAct_9fa48("3509") ? `` : (stryCov_9fa48("3509"), `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>🏆 Credential Issued on Stellar</h2>
        <p>Hi ${data.userName},</p>
        <p>Your credential for <strong>${data.courseTitle}</strong> has been recorded on the Stellar blockchain.</p>
        <p>Transaction: <code>${data.txHash}</code></p>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`)
  })),
  moduleUnlocked: stryMutAct_9fa48("3510") ? () => undefined : (stryCov_9fa48("3510"), (data: {
    userName: string;
    courseTitle: string;
    moduleTitle: string;
    courseUrl: string;
    unsubscribeUrl: string;
  }) => stryMutAct_9fa48("3511") ? {} : (stryCov_9fa48("3511"), {
    subject: stryMutAct_9fa48("3512") ? `` : (stryCov_9fa48("3512"), `New content unlocked in "${data.courseTitle}"`),
    html: stryMutAct_9fa48("3513") ? `` : (stryCov_9fa48("3513"), `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>🔓 New Module Available</h2>
        <p>Hi ${data.userName},</p>
        <p>A new module has just unlocked in <strong>${data.courseTitle}</strong>:</p>
        <p style="font-size:18px;font-weight:bold">${data.moduleTitle}</p>
        <a href="${data.courseUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Start Learning</a>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`)
  }))
});