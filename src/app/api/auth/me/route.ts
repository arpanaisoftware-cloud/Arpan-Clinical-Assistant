import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_arpan_clinical';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized, token missing' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.active) {
      return NextResponse.json({ message: 'Account is deactivated' }, { status: 403 });
    }

    if (!decoded.sessionId || (user.activeSessionId && user.activeSessionId !== decoded.sessionId)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session expired. Your account has been logged in on another device.',
          sessionExpired: true,
          loggedOutByOtherDevice: true
        },
        { status: 401 }
      );
    }

    if (!user.activeSessionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Session terminated. You have been logged out.',
          sessionExpired: true,
          loggedOutByOtherDevice: true
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
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
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
