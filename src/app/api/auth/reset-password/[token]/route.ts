import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    await connectDB();
    const { password } = await req.json();
    const { token } = params;

    if (!token || !password) {
      return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      // Fallback: check unhashed token if stored directly or demo token
      user = await User.findOne({
        resetPasswordToken: token.trim(),
        resetPasswordExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired password reset token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // We should probably also invalidate active sessions here so they have to login again
    user.activeSessionId = null;
    await user.save();

    return NextResponse.json({
      message: 'Password has been successfully updated. You can now login with your new credentials.',
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        staffId: user.staffId,
        email: user.email
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Reset password warning:', error.message);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
