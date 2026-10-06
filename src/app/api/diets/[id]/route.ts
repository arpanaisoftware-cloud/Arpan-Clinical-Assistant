import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Diet from '@/models/Diet';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const record = await Diet.findById(params.id);
    if (!record) return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ data: record }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await req.json();
    const updatedRecord = await Diet.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedRecord) return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ message: 'Diet plan updated', data: updatedRecord }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedRecord = await Diet.findByIdAndDelete(params.id);
    if (!deletedRecord) return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ message: 'Diet plan deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
