import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Counselling from '@/models/Counselling';

export async function GET(req: Request) {
  try {
    await connectDB();
    const records = await Counselling.find().sort({ createdAt: -1 });
    return NextResponse.json({ data: records }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const existingRecord = await Counselling.findOne({ customId: body.customId });
    if (existingRecord) {
      return NextResponse.json({ message: 'Record with this ID already exists' }, { status: 400 });
    }

    const newRecord = await Counselling.create(body);
    return NextResponse.json({ message: 'Counselling record created', data: newRecord }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
