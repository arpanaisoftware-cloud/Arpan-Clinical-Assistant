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
    const cleanStaffId = body.staffId ? String(body.staffId).trim() : '';
    const cleanEmail = body.email ? String(body.email).trim() : '';
    const cleanIdentifier = body.identifier ? String(body.identifier).trim() : '';
    const { password } = body;

    if ((!cleanStaffId && !cleanEmail && !cleanIdentifier) || !password) {
      return NextResponse.json({ message: 'Missing email/staff ID or password' }, { status: 400 });
    }

    const orConditions: any[] = [];
    if (cleanStaffId) {
      orConditions.push({ staffId: { $regex: new RegExp(`^${cleanStaffId}$`, 'i') } });
    }
    if (cleanEmail) {
      orConditions.push({ email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') } });
    }
    if (cleanIdentifier) {
      orConditions.push(
        { email: { $regex: new RegExp(`^${cleanIdentifier}$`, 'i') } },
        { staffId: { $regex: new RegExp(`^${cleanIdentifier}$`, 'i') } }
      );
    }

    const user = await User.findOne({ $or: orConditions });

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

    // Always generate a fresh sessionId upon login to supersede any prior active device session
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
