import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with this email, a reset link has been dispatched.',
        success: true
      }, { status: 200 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const baseUrl = 'https://arpanaisoftware.in';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Attempt sending email via Resend
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await resend.emails.send({
        from: 'Arpan Clinical Assistant <noreply@arpanaisoftware.in>',
        to: [cleanEmail],
        subject: 'Clinical Security Alert: Password Reset Request',
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>table, td {mso-table-lspace: 0pt; mso-table-rspace: 0pt;} img {-ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none;} table {border-collapse: collapse !important;} body {height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;} .button:hover {background-color: #0f766e !important;} .link:hover {text-decoration: underline !important; color: #0f766e !important;}</style></head><body><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6; padding: 40px 10px;"><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;"><tr><td align="left" valign="top" style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;"><table border="0" cellpadding="0" cellspacing="0"><tr><td style="background-color: #ccfbf1; border-radius: 6px; padding: 6px 8px; font-weight: bold; color: #0d9488; font-size: 16px;">&#10022;</td><td style="padding-left: 10px; font-size: 15px; font-weight: 600; color: #1e293b; letter-spacing: -0.2px;">Arpan Clinical Assistant</td></tr></table></td></tr><tr><td align="left" valign="top" style="padding: 32px;"><h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #1e293b; letter-spacing: -0.5px;">Reset your password</h1><p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">Hello Doctor,<br><br>We received a request to reset the password for your clinical account. Click the secure button below to choose a new one. This link will expire in 2 hours for security.</p><table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;"><tr><td align="left"><a href="${resetUrl}" target="_blank" class="button" style="display: inline-block; background-color: #0d9488; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px;">Reset Password</a></td></tr></table><p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.5; color: #64748b;">If the button above does not work, copy and paste this URL directly into your web browser:<br><a href="${resetUrl}" target="_blank" class="link" style="color: #0d9488; text-decoration: none; word-break: break-all;">${resetUrl}</a></p><hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;"><p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;"><strong>Didn't request this change?</strong> You can safely ignore this message; your current credentials remain secure.</p></td></tr><tr><td align="center" valign="top" style="padding: 0 32px 32px 32px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.4;">&copy; 2026 Arpan Clinical Assistant. All patient and medical data remain encrypted.<br>Automated system message. Please do not reply directly to this email.</td></tr></table></td></tr></table></body></html>`,
      });

      if (resendResponse.error) {
        console.error('Resend API Error:', resendResponse.error);
        return NextResponse.json({
          message: 'Failed to dispatch email. If you are using a test Resend API key, you can only send emails to your verified Resend account email address.',
          error: resendResponse.error
        }, { status: 400 });
      }
      emailSent = true;
    } else {
      console.warn('RESEND_API_KEY is missing, email not sent');
    }

    return NextResponse.json({
      message: 'Password reset link generated and sent.',
      success: true,
      resetUrl,
      token: resetToken,
      emailSent
    }, { status: 200 });
  } catch (error: any) {
    console.error('Forgot password error:', error.message);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
