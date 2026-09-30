import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;
    const body = await req.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (body.active !== undefined) user.active = body.active;
    if (body.modulePermissions !== undefined) user.modulePermissions = body.modulePermissions;
    if (body.role !== undefined) user.role = body.role;
    if (body.department !== undefined) user.department = body.department;

    await user.save();

    return NextResponse.json({ message: 'Staff updated successfully', user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const id = params.id;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Staff deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
