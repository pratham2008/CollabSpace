import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailFrom = process.env.EMAIL_FROM || "CollabSpace <noreply@collabspace.dev>";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for email verification
export async function sendVerificationOTP(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `${otp} is your CollabSpace verification code`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; text-align: center;">
                
                <!-- Logo -->
                <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600;">
                  <span style="background: linear-gradient(135deg, #38bdf8, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">CollabSpace</span>
                </h1>
                <p style="margin: 0 0 32px 0; color: rgba(148, 163, 184, 0.9); font-size: 14px;">
                  Find the right teammates for your projects
                </p>

                <!-- Main content -->
                <h2 style="margin: 0 0 16px 0; color: #f1f5f9; font-size: 20px; font-weight: 600;">
                  Verify your email
                </h2>
                <p style="margin: 0 0 24px 0; color: rgba(203, 213, 225, 0.9); font-size: 15px; line-height: 1.6;">
                  Enter this code to verify your email address:
                </p>

                <!-- OTP Code -->
                <div style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(167, 139, 250, 0.15) 100%); border: 2px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 20px; margin: 0 0 24px 0;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f1f5f9; font-family: 'Courier New', monospace;">${otp}</span>
                </div>

                <p style="margin: 0 0 0 0; color: rgba(100, 116, 139, 0.8); font-size: 13px;">
                  This code expires in 24 hours.
                </p>
                <p style="margin: 8px 0 0 0; color: rgba(100, 116, 139, 0.8); font-size: 12px;">
                  If you didn't create a CollabSpace account, you can safely ignore this email.
                </p>
              </div>

              <p style="margin: 24px 0 0 0; text-align: center; color: rgba(100, 116, 139, 0.6); font-size: 11px;">
                © ${new Date().getFullYear()} CollabSpace. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send verification OTP:", error);
    return { success: false, error };
  }
}

// Send OTP for password reset
export async function sendPasswordResetOTP(email: string, otp: string) {
  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: `${otp} is your CollabSpace password reset code`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px; text-align: center;">
                
                <h1 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #f1f5f9;">
                  Reset your password
                </h1>
                
                <p style="margin: 0 0 24px 0; color: rgba(203, 213, 225, 0.9); font-size: 15px;">
                  Enter this code to reset your password:
                </p>

                <div style="background: rgba(245, 158, 11, 0.15); border: 2px solid rgba(245, 158, 11, 0.3); border-radius: 16px; padding: 20px; margin: 0 0 24px 0;">
                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #f1f5f9; font-family: 'Courier New', monospace;">${otp}</span>
                </div>

                <p style="margin: 0; color: rgba(100, 116, 139, 0.8); font-size: 12px;">
                  This code expires in 24 hours. If you didn't request this, ignore this email.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset OTP:", error);
    return { success: false, error };
  }
}

export async function sendJoinRequestNotification(
  ownerEmail: string,
  projectTitle: string,
  requesterName: string
) {
  try {
    await resend.emails.send({
      from: emailFrom,
      to: ownerEmail,
      subject: `New join request for ${projectTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 40px;">
                
                <h1 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #f1f5f9;">
                  New Join Request 🎉
                </h1>
                
                <p style="margin: 0 0 16px 0; color: rgba(203, 213, 225, 0.9); font-size: 15px; line-height: 1.6;">
                  <strong style="color: #67e8f9;">${requesterName}</strong> wants to join your project <strong style="color: #a78bfa;">${projectTitle}</strong>.
                </p>

                <a href="${appUrl}/app/projects" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%); color: #0f172a; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 9999px;">
                  View Request
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error };
  }
}
