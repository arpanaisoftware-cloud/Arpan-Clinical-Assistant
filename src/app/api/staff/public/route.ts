import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const staffMembers = await User.find().select('name email role department staffId active modulePermissions rawPassword createdAt').sort({ createdAt: -1 });
    
    const formattedStaff = staffMembers.map((u) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      staffId: u.staffId,
      modulePermissions: u.modulePermissions || (u.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
      active: u.active,
      password: u.rawPassword || (u.role === 'Doctor' ? 'doctor123' : 'staff123'),
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01'
    }));

    return NextResponse.json({ staff: formattedStaff }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch public staff DB error:', error.message);
    return NextResponse.json({ message: 'Server error', staff: [] }, { status: 500 });
  }
}
