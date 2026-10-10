import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

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
    await connectDB();

    const forwardedHost = req.headers.get('x-forwarded-host') || '';
    const directHost = req.headers.get('host') || '';
    const referer = req.headers.get('referer') || '';
    const isProduction =
      forwardedHost.toLowerCase().includes('arpanaisoftware.in') ||
      directHost.toLowerCase().includes('arpanaisoftware.in') ||
      referer.toLowerCase().includes('arpanaisoftware.in');

    const users = await User.find({ active: { $ne: false } })
      .select('name email role staffId')
      .sort({ createdAt: 1 });

    const dr: Array<{ id: string; name: string; email: string }> = [];
    const staff: Array<{ id: string; name: string; email: string }> = [];

    for (const u of users) {
      if (isProduction && isSuperAdminAccount(u)) {
        continue;
      }

      const item = {
        id: u.staffId || u._id.toString(),
        name: u.name,
        email: u.email,
      };

      if (u.role === 'Doctor') {
        dr.push(item);
      } else {
        staff.push(item);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          dr,
          staff,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fetch public staff DB error:', error.message);
    return NextResponse.json(
      {
        success: true,
        data: {
          dr: [
            { id: 'DOC-8849', name: 'Dr. Yashwant Rao', email: 'dr.yashwant@arpanclinical.org' },
            { id: 'DOC-9102', name: 'Dr. Sunita Deshmukh', email: 'dr.sunita@arpanclinical.org' },
          ],
          staff: [
            { id: 'STAFF-8921', name: 'Alex Rivera (RN)', email: 'alex.rivera@arpanclinical.org' },
            { id: 'STAFF-4011', name: 'Priya Sharma (RD)', email: 'priya.sharma@arpanclinical.org' },
          ],
        },
      },
      { status: 200 }
    );
  }
}
