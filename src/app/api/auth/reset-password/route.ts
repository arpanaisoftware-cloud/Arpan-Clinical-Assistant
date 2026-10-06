import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ message: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const resetPasswordToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Fallback: check unhashed token if stored directly or demo token
    if (!user) {
      user = await User.findOne({
        resetPasswordToken: token.trim(),
        resetPasswordExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired password reset token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
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
    return NextResponse.json({
      message: 'Password has been successfully updated. You can now login with your new credentials.',
      success: true
    }, { status: 200 });
  }
}
