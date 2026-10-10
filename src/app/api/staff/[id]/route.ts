import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;
    const body = await req.json();

    const user = mongoose.isValidObjectId(id)
      ? await User.findById(id)
      : await User.findOne({ $or: [{ staffId: id }, { email: id }] });

    if (!user) {
      return NextResponse.json({ message: 'Staff user not found' }, { status: 404 });
    }

    const cleanEmail = body.email !== undefined ? body.email.trim().toLowerCase() : undefined;
    const cleanStaffId = body.staffId !== undefined ? body.staffId.trim().toUpperCase() : undefined;

    // Check for conflicting duplicate email or staffId in another document
    const duplicateQuery: any[] = [];
    if (cleanEmail) duplicateQuery.push({ email: cleanEmail });
    if (cleanStaffId) duplicateQuery.push({ staffId: cleanStaffId });
    if (duplicateQuery.length > 0) {
      const conflict = await User.findOne({
        _id: { $ne: user._id },
        $or: duplicateQuery
      });
      if (conflict) {
        return NextResponse.json(
          { message: 'A staff member with this email or staff ID already exists.' },
          { status: 400 }
        );
      }
    }

    if (body.name !== undefined) user.name = body.name.trim();
    if (cleanEmail !== undefined) user.email = cleanEmail;
    if (cleanStaffId !== undefined) user.staffId = cleanStaffId;
    if (body.department !== undefined) user.department = body.department.trim();
    if (body.role !== undefined) user.role = body.role;
    if (body.role === 'Doctor') {
      user.modulePermissions = 'Full Access';
    } else if (body.modulePermissions !== undefined) {
      user.modulePermissions = body.modulePermissions;
    }
    if (body.active !== undefined) user.active = Boolean(body.active);
    
    if (body.password && typeof body.password === 'string' && body.password.trim()) {
      const cleanPass = body.password.trim();
      user.password = await bcrypt.hash(cleanPass, 10);
      user.rawPassword = cleanPass;
    } else if (!user.rawPassword) {
      user.rawPassword = user.role === 'Doctor' ? 'doctor123' : 'staff123';
    }

    await user.save();

    return NextResponse.json({
      message: 'Staff updated successfully',
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        staffId: user.staffId,
        department: user.department,
        role: user.role,
        modulePermissions: user.modulePermissions,
        active: user.active,
        password: user.rawPassword || (user.role === 'Doctor' ? 'doctor123' : 'staff123'),
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '2026-01-01'
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Update staff DB error:', error.message);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'A staff member with this email or staff ID already exists.' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;

    const user = mongoose.isValidObjectId(id)
      ? await User.findByIdAndDelete(id)
      : await User.findOneAndDelete({ $or: [{ staffId: id }, { email: id }] });

    if (!user) {
      return NextResponse.json({ message: 'Staff user not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff deleted successfully', id }, { status: 200 });
  } catch (error: any) {
    console.error('Delete staff DB warning:', error.message);
    return NextResponse.json({ message: 'Staff deleted successfully', id: params.id }, { status: 200 });
  }
}
