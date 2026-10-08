import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_arpan_clinical';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const identifier = body.email || body.staffId || body.identifier;
    const { password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Missing email/staff ID or password' }, { status: 400 });
    }

    const cleanId = String(identifier).trim();
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
        { staffId: { $regex: new RegExp(`^${cleanId}$`, 'i') } }
      ]
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials. User not found.' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ message: 'Account has been deactivated. Please contact administrator.' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials. Incorrect password.' }, { status: 401 });
    }

    if (user.activeSessionId) {
      return NextResponse.json(
        { message: 'This account is already logged in on another device or window. Please log out from the active session first.' },
        { status: 403 }
      );
    }

    const sessionId = crypto.randomUUID();
    user.activeSessionId = sessionId;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, staffId: user.staffId, sessionId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          staffId: user.staffId,
          department: user.department,
          role: user.role,
          modulePermissions: user.modulePermissions,
          active: user.active
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login DB error:', error.message);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
