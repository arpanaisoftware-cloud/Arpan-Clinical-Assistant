import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_arpan_clinical';

export async function POST(req: Request) {
  try {
    await connectDB();

    let targetUserId: string | null = null;
    let targetEmail: string | null = null;
    let targetStaffId: string | null = null;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded?.id) targetUserId = String(decoded.id);
        if (decoded?.email) targetEmail = String(decoded.email);
        if (decoded?.staffId) targetStaffId = String(decoded.staffId);
      } catch (err: any) {
        // Even if token expired, decode payload without verification to retrieve user identity
        const unverified: any = jwt.decode(token);
        if (unverified?.id) targetUserId = String(unverified.id);
        if (unverified?.email) targetEmail = String(unverified.email);
        if (unverified?.staffId) targetStaffId = String(unverified.staffId);
      }
    }

    // 2. Check JSON body payload (provides fallback if token is expired or absent)
    try {
      const body = await req.json();
      if (body) {
        if (body.userId || body.id || body._id) {
          targetUserId = String(body.userId || body.id || body._id);
        }
        if (body.email) targetEmail = String(body.email);
        if (body.staffId) targetStaffId = String(body.staffId);
        if (body.identifier) {
          const cleanIdent = String(body.identifier).trim();
          if (cleanIdent.includes('@')) {
            targetEmail = cleanIdent;
          } else {
            targetStaffId = cleanIdent;
          }
        }
      }
    } catch {
      // Body is optional
    }

    if (!targetUserId && !targetEmail && !targetStaffId) {
      return NextResponse.json(
        { success: false, message: 'Missing token or user credentials for logout' },
        { status: 400 }
      );
    }

    // Build lookup query
    const orConditions: any[] = [];
    if (targetUserId && mongoose.isValidObjectId(targetUserId)) {
      orConditions.push({ _id: new mongoose.Types.ObjectId(targetUserId) });
    }
    if (targetEmail) {
      orConditions.push({ email: { $regex: new RegExp(`^${targetEmail.trim()}$`, 'i') } });
    }
    if (targetStaffId) {
      orConditions.push({ staffId: { $regex: new RegExp(`^${targetStaffId.trim()}$`, 'i') } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid user lookup parameters' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ $or: orConditions });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Ensure activeSessionId is set to null in MongoDB
    user.activeSessionId = null;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully. Active session cleared.',
        user: { id: user._id.toString(), email: user.email, staffId: user.staffId }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Logout API error:', error.message);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 });
  }
}
