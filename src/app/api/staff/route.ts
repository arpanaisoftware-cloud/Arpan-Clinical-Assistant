import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();

    const staffMembers = await User.find().select('name email role department staffId active modulePermissions rawPassword createdAt').sort({ createdAt: -1 });

    const formattedStaff = staffMembers.map((u) => ({
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

    return NextResponse.json({ staff: formattedStaff }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch staff DB error (serving default roster):', error.message);
    return NextResponse.json({ staff: [], isFallback: true }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, password, staffId, department, role, modulePermissions } = body;

    if (!name || !email || !password || !staffId || !department) {
      return NextResponse.json({ message: 'Missing required fields (name, email, password, staffId, department)' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStaffId = staffId.trim().toUpperCase();

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { staffId: cleanStaffId }]
    });

    if (existingUser) {
      return NextResponse.json({ message: 'A staff member with this email or staff ID already exists' }, { status: 400 });
    }

    const cleanPass = password.trim();
    const hashedPassword = await bcrypt.hash(cleanPass, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      rawPassword: cleanPass,
      staffId: cleanStaffId,
      department: department.trim(),
      role: role || 'Staff',
      modulePermissions: modulePermissions || (role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
      active: true,
    });

    return NextResponse.json(
      {
        message: 'Staff member created successfully',
        user: {
          id: newUser._id.toString(),
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          staffId: newUser.staffId,
          department: newUser.department,
          role: newUser.role,
          modulePermissions: newUser.modulePermissions,
          active: newUser.active,
          password: newUser.rawPassword || cleanPass,
          createdAt: new Date().toISOString().split('T')[0]
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create staff DB warning:', error.message);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
