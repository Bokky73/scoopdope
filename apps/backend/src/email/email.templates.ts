/**
 * Helper to strip HTML tags and convert entities for plain text version
 */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Base email template structure with HTML and plain text versions
 */
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export const emailTemplates = {
  /**
   * Welcome email sent after user registration
   */
  welcome: (data: { userName: string; verificationUrl: string; logo?: string }): EmailTemplate => {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${data.logo ? `<img src="${data.logo}" alt="Logo" style="height: 40px; margin-bottom: 30px;">` : ''}
          <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #111827;">Welcome to scoopdope!</h1>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
            Hi ${data.userName},
          </p>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
            Thank you for signing up! We're excited to have you join our learning community.
            To get started, please verify your email address by clicking the button below.
          </p>
          <a href="${data.verificationUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
            Verify Email Address
          </a>
          <p style="margin: 30px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
            This link will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          scoopdope • Blockchain Education Platform
        </p>
      </div>
    `;
    
    return {
      subject: 'Welcome to scoopdope - Verify Your Email',
      html,
      text: `Welcome to scoopdope!\n\nHi ${data.userName},\n\nThank you for signing up! Please verify your email by visiting this link:\n${data.verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create this account, you can safely ignore this email.\n\nscoopdope • Blockchain Education Platform`,
    };
  },

  /**
   * Password reset email with unique reset link
   */
  passwordReset: (data: { userName: string; resetUrl: string; expiresIn: string; logo?: string }): EmailTemplate => {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${data.logo ? `<img src="${data.logo}" alt="Logo" style="height: 40px; margin-bottom: 30px;">` : ''}
          <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #111827;">Reset Your Password</h1>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
            Hi ${data.userName},
          </p>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <a href="${data.resetUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
            Reset Password
          </a>
          <p style="margin: 20px 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
            This link will expire in ${data.expiresIn}. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
            For security reasons, never share this link with anyone.
          </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          scoopdope • Blockchain Education Platform
        </p>
      </div>
    `;
    
    return {
      subject: 'Reset Your scoopdope Password',
      html,
      text: `Reset Your Password\n\nHi ${data.userName},\n\nWe received a request to reset your password. Click the link below:\n${data.resetUrl}\n\nThis link will expire in ${data.expiresIn}.\n\nIf you didn't request this, you can safely ignore this email.\n\nFor security, never share this link with anyone.\n\nscoopdope • Blockchain Education Platform`,
    };
  },

  /**
   * Certificate issuance notification with on-chain details
   */
  certificateIssued: (data: { userName: string; courseTitle: string; certificateUrl: string; txHash: string; logo?: string }): EmailTemplate => {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${data.logo ? `<img src="${data.logo}" alt="Logo" style="height: 40px; margin-bottom: 30px;">` : ''}
          <h1 style="margin: 0 0 20px 0; font-size: 28px; color: #111827;">🎉 Certificate Issued!</h1>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
            Hi ${data.userName},
          </p>
          <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.6;">
            Congratulations! Your certificate for <strong>${data.courseTitle}</strong> has been issued and recorded on the Stellar blockchain.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #166534; font-weight: 500;">Transaction ID</p>
            <p style="margin: 5px 0 0 0; color: #4b5563; font-family: monospace; font-size: 12px; word-break: break-all;">${data.txHash}</p>
          </div>
          <a href="${data.certificateUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 20px 0;">
            View Certificate
          </a>
          <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
            Your credential is tamper-proof and verifiable on the Stellar network. You can share this certificate with employers and educational institutions.
          </p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          scoopdope • Blockchain Education Platform
        </p>
      </div>
    `;
    
    return {
      subject: `Your Certificate for "${data.courseTitle}" is Ready`,
      html,
      text: `Certificate Issued!\n\nHi ${data.userName},\n\nCongratulations! Your certificate for ${data.courseTitle} has been issued and recorded on the Stellar blockchain.\n\nTransaction ID: ${data.txHash}\n\nView your certificate: ${data.certificateUrl}\n\nYour credential is tamper-proof and verifiable on the Stellar network.\n\nscoopdope • Blockchain Education Platform`,
    };
  },

  enrollment: (data: { userName: string; courseTitle: string; courseUrl: string; unsubscribeUrl: string }): EmailTemplate => {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>Welcome to ${data.courseTitle}!</h2>
        <p>Hi ${data.userName},</p>
        <p>You've successfully enrolled. Start learning now:</p>
        <a href="${data.courseUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Go to Course</a>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`;
    
    return {
      subject: `You're enrolled in "${data.courseTitle}"`,
      html,
      text: htmlToPlainText(html),
    };
  },

  completion: (data: { userName: string; courseTitle: string; credentialUrl: string; unsubscribeUrl: string }): EmailTemplate => {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>🎉 Course Completed!</h2>
        <p>Hi ${data.userName},</p>
        <p>You've completed <strong>${data.courseTitle}</strong>. Your credential is ready:</p>
        <a href="${data.credentialUrl}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Credential</a>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`;
    
    return {
      subject: `Congratulations! You completed "${data.courseTitle}"`,
      html,
      text: htmlToPlainText(html),
    };
  },

  credentialIssued: (data: { userName: string; courseTitle: string; txHash: string; unsubscribeUrl: string }): EmailTemplate => {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>🏆 Credential Issued on Stellar</h2>
        <p>Hi ${data.userName},</p>
        <p>Your credential for <strong>${data.courseTitle}</strong> has been recorded on the Stellar blockchain.</p>
        <p>Transaction: <code>${data.txHash}</code></p>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`;
    
    return {
      subject: `Your blockchain credential for "${data.courseTitle}" is ready`,
      html,
      text: htmlToPlainText(html),
    };
  },

  moduleUnlocked: (data: { userName: string; courseTitle: string; moduleTitle: string; courseUrl: string; unsubscribeUrl: string }): EmailTemplate => {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>🔓 New Module Available</h2>
        <p>Hi ${data.userName},</p>
        <p>A new module has just unlocked in <strong>${data.courseTitle}</strong>:</p>
        <p style="font-size:18px;font-weight:bold">${data.moduleTitle}</p>
        <a href="${data.courseUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Start Learning</a>
        <p style="margin-top:40px;font-size:12px;color:#999">
          <a href="${data.unsubscribeUrl}">Unsubscribe</a>
        </p>
      </div>`;
    
    return {
      subject: `New content unlocked in "${data.courseTitle}"`,
      html,
      text: htmlToPlainText(html),
    };
  },

  liveSessionReminder: (data: { userName: string; sessionTitle: string; date: string; timeLabel: string; joinUrl: string; sessionUrl: string }): EmailTemplate => {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>⏰ Session starting in ${data.timeLabel}</h2>
        <p>Hi ${data.userName},</p>
        <p><strong>${data.sessionTitle}</strong> starts in ${data.timeLabel}.</p>
        <ul>
          <li><strong>Date:</strong> ${data.date}</li>
          ${data.joinUrl ? `<li><strong>Join:</strong> <a href="${data.joinUrl}">${data.joinUrl}</a></li>` : ''}
        </ul>
        <a href="${data.joinUrl || data.sessionUrl}" style="background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Join Now</a>
      </div>`;
    
    return {
      subject: `⏰ Reminder: "${data.sessionTitle}" starts in ${data.timeLabel}`,
      html,
      text: htmlToPlainText(html),
    };
  },

  calendarInvite: (data: { userName: string; sessionTitle: string; date: string; duration: number; joinUrl?: string; sessionUrl: string }): EmailTemplate => {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2>📅 You're invited to a live session</h2>
        <p>Hi ${data.userName},</p>
        <p><strong>${data.sessionTitle}</strong> has been scheduled.</p>
        <ul>
          <li><strong>Date:</strong> ${data.date}</li>
          <li><strong>Duration:</strong> ${data.duration} minutes</li>
          ${data.joinUrl ? `<li><strong>Join:</strong> <a href="${data.joinUrl}">${data.joinUrl}</a></li>` : ''}
        </ul>
        <p>Add to your calendar using the attached .ics file.</p>
        <a href="${data.sessionUrl}" style="background:#4F46E5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Session</a>
      </div>`;
    
    return {
      subject: `📅 Live Session: ${data.sessionTitle}`,
      html,
      text: htmlToPlainText(html),
    };
  },
};
