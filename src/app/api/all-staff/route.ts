import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const isSuperAdminAccount = (u: any) => {
  const name = (u.name || '').toLowerCase().trim();
  const staffId = (u.staffId || '').toLowerCase().trim();
  const email = (u.email || '').toLowerCase().trim();

  return (
    name.includes('super admin') ||
    name.includes('superadmin') ||
    name.includes('admin 1') ||
    name.includes('admin 2') ||
    staffId === 'admin' ||
    staffId === 'stf005' ||
    email === 'arpanaisoftware@gmail.com' ||
    email === 'dikshajain9907580417@gmail.com'
  );
};

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
    const isProduction =
      forwardedHost.toLowerCase().includes('arpanaisoftware.in') ||
      directHost.toLowerCase().includes('arpanaisoftware.in') ||
      referer.toLowerCase().includes('arpanaisoftware.in');

    const staffMembers = await User.find()
      .select('name email role department staffId active modulePermissions rawPassword createdAt')
      .sort({ createdAt: -1 });

    const formattedStaff = staffMembers
      .filter((u) => !isProduction || !isSuperAdminAccount(u))
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
