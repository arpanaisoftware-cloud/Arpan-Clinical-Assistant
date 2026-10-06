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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      staffId: cleanStaffId,
      department: department.trim(),
      role: role || 'Staff',
      modulePermissions: modulePermissions || (role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
      active: true,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email, staffId: newUser.staffId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id.toString(),
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          staffId: newUser.staffId,
          department: newUser.department,
          role: newUser.role,
          modulePermissions: newUser.modulePermissions,
          active: newUser.active
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
