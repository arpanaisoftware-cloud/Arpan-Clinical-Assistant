import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import DietHistory from '@/models/DietHistory';
import User from '@/models/User';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/diet/history/[id]
 * Fetch single diet plan record by MongoDB _id or dietId
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    const id = params.id;

    const record = mongoose.isValidObjectId(id)
      ? await DietHistory.findById(id).lean()
      : await DietHistory.findOne({ dietId: id }).lean();

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Diet history record not found' },
        { status: 404 }
      );
    }

    let analysedBy = (record as any).analysedBy;
    if (!analysedBy && (record as any).createdBy) {
      const creator = await User.findOne({
        $or: [{ email: (record as any).createdBy }, { staffId: (record as any).createdBy }]
      }).select('name').lean();
      analysedBy = creator?.name || ((record as any).createdBy && !(record as any).createdBy.includes('@') ? (record as any).createdBy : 'Dr. Yashwant Dubey');
    }
    if (!analysedBy) analysedBy = 'Dr. Yashwant Dubey';

    const formattedData = {
      id: (record as any).dietId,
      _id: (record as any)._id.toString(),
      dietId: (record as any).dietId,
      patientName: (record as any).patientName,
      age: (record as any).age,
      gender: (record as any).gender,
      disease: (record as any).disease,
      dietaryPreference: (record as any).dietaryPreference || 'Vegetarian (Shakahari)',
      targetCalories: (record as any).targetCalories || 1750,
      language: (record as any).language || 'Hindi',
      planName: (record as any).planName || 'Indian Clinical Diet Plan',
      summary: (record as any).summary || '',
      dietPlan: (record as any).dietPlan,
      patientForm: (record as any).patientForm,
      date: (record as any).date,
      analysedBy,
      createdAt: (record as any).createdAt,
    };

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/diet/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/diet/history/[id]
 * Delete single diet plan record by MongoDB _id or dietId
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    const id = params.id;

    const deleted = mongoose.isValidObjectId(id)
      ? await DietHistory.findByIdAndDelete(id)
      : await DietHistory.findOneAndDelete({ dietId: id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Diet history record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Diet history record deleted successfully',
        id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/diet/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
