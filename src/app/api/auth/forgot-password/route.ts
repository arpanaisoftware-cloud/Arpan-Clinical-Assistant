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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Attempt sending email via Resend
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Arpan Clinical Assistant <onboarding@resend.dev>',
        to: [cleanEmail],
        subject: 'Clinical Security Alert: Password Reset Request',
        html: `
          <h2>Arpan Clinical Assistant Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>A request was received to reset the login credentials for your staff account (<strong>${user.staffId}</strong>).</p>
          <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#00C9A7;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">Reset My Password</a></p>
          <p>Or visit: <a href="${resetUrl}">${resetUrl}</a></p>
          <p>This security token expires in 60 minutes.</p>
        `,
      });
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
