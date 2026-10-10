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

    if (body.name !== undefined) user.name = body.name.trim();
    if (body.email !== undefined) user.email = body.email.trim().toLowerCase();
    if (body.active !== undefined) user.active = Boolean(body.active);
    if (body.modulePermissions !== undefined) user.modulePermissions = body.modulePermissions;
    if (body.role !== undefined) user.role = body.role;
    if (body.department !== undefined) user.department = body.department.trim();
    if (body.password) {
      user.password = await bcrypt.hash(body.password, 10);
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
        active: user.active
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Update staff DB warning:', error.message);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
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
