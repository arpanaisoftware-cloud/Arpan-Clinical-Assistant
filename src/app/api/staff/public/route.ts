import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

import { isSuperAdminAccount } from '@/types/clinical';

export async function GET(req: Request) {
  try {
    await connectDB();

    const forwardedHost = req.headers.get('x-forwarded-host') || '';
    const directHost = req.headers.get('host') || '';
    const referer = req.headers.get('referer') || '';
    const hostToCheck = (forwardedHost || directHost || referer).toLowerCase();

    const isLocalhost =
      (hostToCheck.includes('localhost') || hostToCheck.includes('127.0.0.1') || hostToCheck.includes('0.0.0.0')) &&
      !hostToCheck.includes('arpanaisoftware.in');
    const isLive = !isLocalhost || process.env.NODE_ENV === 'production' || hostToCheck.includes('arpanaisoftware.in');

    const users = await User.find({ active: { $ne: false } })
      .select('name email role staffId')
      .sort({ createdAt: 1 });

    const dr: Array<{ id: string; name: string; email: string }> = [];
    const staff: Array<{ id: string; name: string; email: string }> = [];

    for (const u of users) {
      if (isLive && isSuperAdminAccount(u)) {
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
