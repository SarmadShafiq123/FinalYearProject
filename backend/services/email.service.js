import transporter from "../config/nodemailer.js"

const formatBytes = (bytes) => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB"
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB"
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB"
  return bytes + " B"
}

const planLabel = (plan) => {
  const labels = { free: "Free", starter: "Starter", pro: "Pro", business: "Business" }
  return labels[plan] || plan
}

const emailBase = (content) => `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#09090b;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#18181b;border-radius:8px;padding:40px;">
              <tr><td align="center" style="padding-bottom:30px;"><h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">CloudStore</h1></td></tr>
              ${content}
              <tr><td style="color:#71717a;font-size:12px;line-height:18px;padding-top:20px;border-top:1px solid #27272a;">This is an automated message from CloudStore.</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

const sendOTPEmail = async (email, name, otp) => {
  try {
    await transporter.sendMail({
      from: `"CloudStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your CloudStore account",
      html: emailBase(`
        <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:20px;">Hi ${name},</td></tr>
        <tr><td style="color:#a1a1aa;font-size:14px;line-height:20px;padding-bottom:30px;">Your verification code is:</td></tr>
        <tr><td align="center" style="padding-bottom:30px;">
          <div style="background-color:#27272a;border-radius:8px;padding:20px;display:inline-block;">
            <span style="color:#ffffff;font-size:32px;font-weight:700;letter-spacing:8px;">${otp}</span>
          </div>
        </td></tr>
        <tr><td style="color:#a1a1aa;font-size:14px;line-height:20px;padding-bottom:20px;">This code expires in 10 minutes.</td></tr>
        <tr><td style="color:#71717a;font-size:12px;">If you did not create an account, please ignore this email.</td></tr>
      `),
    })
    console.log(`[EMAIL] OTP email sent successfully to ${email}`)
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP email to ${email}:`, err.message, err.code || "", err.response || "")
    throw err
  }
}

const sendRequestConfirmationEmail = async (email, name, plan) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "CloudStore — Request Received",
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        We received your request for the <strong style="color:#ffffff;">${planLabel(plan)}</strong> plan.
        We'll review it within 24 hours and get back to you.
      </td></tr>
      <tr><td style="color:#71717a;font-size:12px;">This is an automated email. Do not reply.</td></tr>
    `),
  })
}

const sendPaymentConfirmationEmail = async (email, name, plan, amount) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "CloudStore — Payment Successful",
    html: emailBase(`
      <tr><td align="center" style="padding-bottom:24px;">
        <h1 style="color:#22c55e;font-size:22px;font-weight:700;margin:0;">Payment Successful</h1>
      </td></tr>
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        Thank you for your payment! Your <strong style="color:#ffffff;">${planLabel(plan)}</strong> plan
        (${amount > 0 ? `$${amount}/month` : "Free"}) request has been received.
      </td></tr>
      <tr><td style="color:#71717a;font-size:12px;">We'll complete your account setup and send you login details shortly.</td></tr>
    `),
  })
}

const sendPaymentWarningEmail = async (user, daysLeft) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `CloudStore — Renewal in ${daysLeft} days`,
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${user.name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        Your <strong style="color:#ffffff;">${planLabel(user.plan)}</strong> plan expires in
        <strong style="color:#ffffff;">${daysLeft} days</strong>.
        Renew now to keep uninterrupted access to your files.
      </td></tr>
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Renew Plan</a>
      </td></tr>
      <tr><td style="color:#71717a;font-size:12px;">If you have already renewed, ignore this email.</td></tr>
    `),
  })
}

const sendPaymentDueEmail = async (user) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "CloudStore — Your plan expires today",
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${user.name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        Your <strong style="color:#ffffff;">${planLabel(user.plan)}</strong> plan expires today.
        Renew now to avoid losing access to your files.
      </td></tr>
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Renew Now</a>
      </td></tr>
    `),
  })
}

const sendStorageLockedEmail = async (user) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "CloudStore — Your storage has been locked",
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${user.name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        Your <strong style="color:#ffffff;">${planLabel(user.plan)}</strong> plan has expired and your storage has been locked.
        You have 45 days to renew before your files are permanently deleted.
        Renew now to restore access immediately.
      </td></tr>
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Renew Plan</a>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <div style="background-color:#450a0a;border-left:4px solid #dc2626;border-radius:4px;padding:16px;">
          <p style="color:#fca5a5;font-size:13px;margin:0;font-weight:600;">Files will be permanently deleted after 45 days. This cannot be undone.</p>
        </div>
      </td></tr>
    `),
  })
}

const sendGraceEmail = async (user, daysRemaining) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `CloudStore — ${daysRemaining} days to save your files`,
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${user.name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        Your storage is locked. You have <strong style="color:#ffffff;">${daysRemaining} days</strong> remaining
        before your files are permanently deleted.
      </td></tr>
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Renew Now</a>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <div style="background-color:#450a0a;border-left:4px solid #dc2626;border-radius:4px;padding:16px;">
          <p style="color:#fca5a5;font-size:13px;margin:0;">After ${daysRemaining} days, all files will be permanently deleted with no recovery option.</p>
        </div>
      </td></tr>
    `),
  })
}

const sendFinalWarningEmail = async (user, daysLeft) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `⚠️ CloudStore — ${daysLeft} day(s) until permanent deletion`,
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${user.name},</td></tr>
      <tr><td style="color:#fca5a5;font-size:16px;font-weight:700;padding-bottom:16px;">
        URGENT: Your files will be permanently deleted in ${daysLeft} day(s).
      </td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        This is your final warning. After deletion, your files CANNOT be recovered under any circumstances.
      </td></tr>
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#dc2626;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Renew Immediately</a>
      </td></tr>
      <tr><td style="color:#71717a;font-size:12px;">If you choose not to renew, your account will be downgraded to the free plan with 1GB storage.</td></tr>
    `),
  })
}

const sendFilesDeletedEmail = async (user) => {
  await transporter.sendMail({
    from: `"CloudStore" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "CloudStore — Your files have been deleted",
    html: emailBase(`
      <tr><td style="color:#ffffff;font-size:16px;line-height:24px;padding-bottom:16px;">Hi ${user.name},</td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">
        Your 45-day grace period has ended and all your files have been permanently deleted.
        Your account has been downgraded to the free plan with 1GB storage.
      </td></tr>
      <tr><td style="color:#a1a1aa;font-size:14px;line-height:22px;padding-bottom:24px;">To start fresh, select a new plan:</td></tr>
      <tr><td align="center" style="padding-bottom:24px;">
        <a href="${process.env.CLIENT_URL}/pricing" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">Choose a Plan</a>
      </td></tr>
    `),
  })
}

export {
  sendOTPEmail,
  sendRequestConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendPaymentWarningEmail,
  sendPaymentDueEmail,
  sendStorageLockedEmail,
  sendGraceEmail,
  sendFinalWarningEmail,
  sendFilesDeletedEmail,
}
