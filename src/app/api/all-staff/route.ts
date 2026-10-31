import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

import { isSuperAdminAccount } from '@/types/clinical';

export async function GET(req: Request) {
  try {
    // 1. Enforce Token-based Authentication
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();

    const forwardedHost = req.headers.get('x-forwarded-host') || '';
    const directHost = req.headers.get('host') || '';
    const referer = req.headers.get('referer') || '';
    const hostToCheck = (forwardedHost || directHost || referer).toLowerCase();

    const isLocalhost =
      (hostToCheck.includes('localhost') || hostToCheck.includes('127.0.0.1') || hostToCheck.includes('0.0.0.0')) &&
      !hostToCheck.includes('arpanaisoftware.in');
    const isLive = !isLocalhost || process.env.NODE_ENV === 'production' || hostToCheck.includes('arpanaisoftware.in');

    const isCallerSuperAdmin = isSuperAdminAccount(auth.user);

    const staffMembers = await User.find()
      .select('name email role department staffId active modulePermissions rawPassword createdAt')
      .sort({ createdAt: -1 });

    const formattedStaff = staffMembers
      .filter((u) => {
        // If caller is NOT a super admin, NEVER return Admin accounts in their table!
        if (!isCallerSuperAdmin) {
          return !isSuperAdminAccount(u);
        }
        // If caller is super admin, in live production hide admin accounts from directory table
        return !isLive || !isSuperAdminAccount(u);
      })
      .map((u) => ({
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        staffId: u.staffId,
        department: u.department,
        role: u.role,
        modulePermissions: u.modulePermissions || (u.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
        active: u.active,
        password: u.rawPassword || (u.role === 'Doctor' ? 'doctor123' : 'staff123'),
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
      }));

    return NextResponse.json({ success: true, staff: formattedStaff }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch all-staff DB error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve staff roster', error: error.message },
      { status: 500 }
    );
  }
}
