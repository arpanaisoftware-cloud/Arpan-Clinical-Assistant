import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Drug from '@/models/Drug';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const record = await Drug.findById(params.id);
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
    const updatedRecord = await Drug.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedRecord) return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ message: 'Drug record updated', data: updatedRecord }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deletedRecord = await Drug.findByIdAndDelete(params.id);
    if (!deletedRecord) return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    return NextResponse.json({ message: 'Drug record deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
