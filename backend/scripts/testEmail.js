
import "dotenv/config";
import dns from "dns";
import nodemailer from "nodemailer";
import net from "net";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const recipient = process.argv[2] || process.env.EMAIL_USER;

const ok  = (msg) => console.log(`\x1b[32m  ✓ ${msg}\x1b[0m`);
const fail = (msg) => console.log(`\x1b[31m  ✗ ${msg}\x1b[0m`);
const info = (msg) => console.log(`\x1b[36m  ℹ ${msg}\x1b[0m`);
const head = (msg) => console.log(`\n\x1b[1m${msg}\x1b[0m`);
const line = () => console.log("─".repeat(60));

// ── Check C: TCP reachability of smtp.gmail.com:587 ──────────────────────────
const checkTcpPort = (host, port, timeoutMs = 5000) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    const done = (result) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };
    socket.setTimeout(timeoutMs);
    socket.connect(port, host, () => done(true));
    socket.on("error", () => done(false));
    socket.on("timeout", () => done(false));
  });

const run = async () => {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║        CloudStore — Email Diagnostic Script              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`  Sending test email to: ${recipient || "(not set)"}\n`);

  // ── A: Environment variables ───────────────────────────────────────────────
  head("A. Environment variables");
  line();
  const hasUser = !!process.env.EMAIL_USER;
  const hasPass = !!process.env.EMAIL_PASS;
  hasUser ? ok(`EMAIL_USER is set (${process.env.EMAIL_USER})`) : fail("EMAIL_USER is NOT set");
  hasPass ? ok("EMAIL_PASS is set (value hidden)") : fail("EMAIL_PASS is NOT set");
  info(`EMAIL_PASS length: ${process.env.EMAIL_PASS?.length ?? 0} chars`);

  if (process.env.EMAIL_PASS) {
    const passNoSpaces = process.env.EMAIL_PASS.replace(/\s/g, "");
    if (passNoSpaces.length === 16) {
      ok("EMAIL_PASS is 16 chars (correct App Password length when spaces stripped)");
    } else {
      fail(`EMAIL_PASS is ${passNoSpaces.length} chars after stripping spaces — expected 16 for a Gmail App Password`);
    }
    if (process.env.EMAIL_PASS.includes(" ")) {
      info("EMAIL_PASS contains spaces — Nodemailer accepts this for Gmail App Passwords");
    }
  }

  if (!hasUser || !hasPass) {
    fail("Cannot continue — credentials missing. Set EMAIL_USER and EMAIL_PASS in .env");
    process.exit(1);
  }

  // ── B: Transporter config ──────────────────────────────────────────────────
  head("B. Transporter configuration");
  line();
  info("Using: service: 'gmail'  (resolves to host: smtp.gmail.com, port: 587, secure: false + STARTTLS)");

  // ── C: Network / port reachability ────────────────────────────────────────
  head("C. Network — TCP reachability of smtp.gmail.com");
  line();

  const port587 = await checkTcpPort("smtp.gmail.com", 587);
  const port465 = await checkTcpPort("smtp.gmail.com", 465);

  port587 ? ok("Port 587 reachable (STARTTLS — used by Nodemailer service:'gmail')") 
          : fail("Port 587 BLOCKED — this host cannot reach smtp.gmail.com:587");
  port465 ? ok("Port 465 reachable (SSL)")
          : info("Port 465 not reachable (not required for service:'gmail')");

  if (!port587) {
    fail("CRITICAL: Port 587 is blocked. This is the cause of delivery failure.");
    fail("On Render/hosting: check outbound firewall rules, or switch to port 465 / a transactional provider.");
  }

  // ── D: transporter.verify() ────────────────────────────────────────────────
  head("D. Nodemailer transporter.verify() — auth + SMTP handshake");
  line();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    ok("transporter.verify() passed — SMTP auth and connection succeeded");
  } catch (verifyErr) {
    fail(`transporter.verify() FAILED`);
    fail(`  Error code   : ${verifyErr.code || "(none)"}`);
    fail(`  Error message: ${verifyErr.message}`);
    if (verifyErr.response) fail(`  SMTP response: ${verifyErr.response}`);

    console.log("\n\x1b[33m  Diagnosis:\x1b[0m");
    if (verifyErr.code === "EAUTH" || verifyErr.message?.includes("535") || verifyErr.message?.includes("Username and Password not accepted")) {
      fail("  → CREDENTIALS REJECTED by Gmail");
      info("  → Fix: Go to myaccount.google.com/apppasswords, revoke old password, generate a new 16-char App Password");
      info("  → Ensure 2-Step Verification is ON on the Gmail account");
      info("  → Paste the new App Password (with or without spaces) into EMAIL_PASS in .env and Render");
    } else if (verifyErr.code === "ECONNECTION" || verifyErr.code === "ETIMEDOUT" || verifyErr.code === "ECONNREFUSED") {
      fail("  → NETWORK/PORT BLOCKED — cannot reach smtp.gmail.com");
      info("  → This is common on Render's free tier and some cloud hosts");
      info("  → Fix: switch to a transactional email provider (see end of report)");
    } else if (verifyErr.message?.includes("454") || verifyErr.message?.includes("Temporary")) {
      fail("  → TEMPORARY Gmail block — too many auth attempts or suspicious activity");
      info("  → Fix: wait 1 hour, or check the Gmail account for security alerts");
    }

    // Still attempt the send to capture the full error
  }

  // ── E: Actual sendMail attempt ─────────────────────────────────────────────
  head("E. Actual sendMail() attempt — test OTP email");
  line();

  const testOtp = "847291";
  const mailOptions = {
    from: `"CloudStore Test" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `[TEST] CloudStore OTP Verification — ${new Date().toISOString()}`,
    html: `
      <div style="background:#18181b;padding:40px;font-family:sans-serif;">
        <h2 style="color:#fff;">CloudStore — Email Diagnostic Test</h2>
        <p style="color:#a1a1aa;">This is a test email from the diagnostic script.</p>
        <p style="color:#a1a1aa;">Your test OTP would be:</p>
        <div style="background:#27272a;border-radius:8px;padding:20px;display:inline-block;margin:16px 0;">
          <span style="color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;">${testOtp}</span>
        </div>
        <p style="color:#71717a;font-size:12px;">Sent at: ${new Date().toISOString()}</p>
      </div>
    `,
    text: `CloudStore OTP Test. Your test code: ${testOtp}`,
  };

  try {
    info(`Sending to: ${recipient} ...`);
    const result = await transporter.sendMail(mailOptions);

    ok(`sendMail() resolved — no error thrown`);
    ok(`  messageId  : ${result.messageId}`);
    ok(`  accepted   : ${JSON.stringify(result.accepted)}`);

    if (result.rejected && result.rejected.length > 0) {
      fail(`  rejected   : ${JSON.stringify(result.rejected)}  ← DELIVERY FAILURE`);
      fail("  These recipients were rejected by the SMTP server");
    } else {
      ok(`  rejected   : [] (none)`);
    }

    if (result.response) {
      ok(`  SMTP resp  : ${result.response}`);
    }

    info("\n  ► Email was ACCEPTED by Gmail's SMTP server.");
    info("  ► Check inbox AND spam/junk/promotions folder within 2 minutes.");
    info(`  ► Sent to: ${recipient}`);
    info("  ► If it appears in spam: add the sender to contacts to allowlist it.");

  } catch (sendErr) {
    fail(`sendMail() THREW an error:`);
    fail(`  code   : ${sendErr.code || "(none)"}`);
    fail(`  message: ${sendErr.message}`);
    if (sendErr.response) fail(`  SMTP   : ${sendErr.response}`);
    if (sendErr.responseCode) fail(`  code#  : ${sendErr.responseCode}`);
  }

  // ── F: Summary & recommendation ───────────────────────────────────────────
  head("F. Summary");
  line();
  info("After running this script:");
  info("  1. Check the logs above for any ✗ failures");
  info("  2. Check your inbox AND spam folder for the test email");
  info("  3. If verify() failed with EAUTH → regenerate Gmail App Password");
  info("  4. If port 587 blocked → the hosting platform blocks outbound SMTP");
  info("");
  info("If Gmail SMTP is fundamentally unreliable in your environment,");
  info("consider switching to a transactional provider:");
  info("  • Resend     — resend.com          (free: 3k emails/month)");
  info("  • Brevo      — brevo.com           (free: 300 emails/day)");
  info("  • SendGrid   — sendgrid.com        (free: 100 emails/day)");
  info("  • Postmark   — postmarkapp.com     (paid, very reliable)");
  console.log("\n" + "─".repeat(60) + "\n");
};

run().catch((e) => {
  console.error("[FATAL]", e.message);
  process.exit(1);
});
