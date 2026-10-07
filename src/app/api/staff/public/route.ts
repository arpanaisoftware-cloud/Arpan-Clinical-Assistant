import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const staffMembers = await User.find().select('name email role department staffId active').sort({ createdAt: -1 });
    
    const formattedStaff = staffMembers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      staffId: u.staffId,
      active: u.active
    }));

    return NextResponse.json({ staff: formattedStaff }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch public staff DB error:', error.message);
    return NextResponse.json({ message: 'Server error', staff: [] }, { status: 500 });
  }
}
