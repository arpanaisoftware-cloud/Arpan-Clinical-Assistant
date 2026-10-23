import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import PrescriptionHistory from '@/models/PrescriptionHistory';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history/[id]
 * Fetch a single prescription analysis history record by MongoDB _id or rxId
 * Protected by Bearer token authentication.
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
      ? await PrescriptionHistory.findById(id).lean()
      : await PrescriptionHistory.findOne({ rxId: id }).lean();

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Prescription history record not found' },
        { status: 404 }
      );
    }

    const formattedData = {
      id: (record as any).rxId,
      _id: (record as any)._id.toString(),
      rxId: (record as any).rxId,
      patientName: (record as any).patientName,
      age: (record as any).age,
      gender: (record as any).gender,
      disease: (record as any).disease,
      medCount: (record as any).medCount,
      safetyScore: (record as any).safetyScore,
      risk: (record as any).risk,
      color: (record as any).color,
      date: (record as any).date,
      analysedBy: (record as any).analysedBy || ((record as any).createdBy && !(record as any).createdBy.includes('@') ? (record as any).createdBy : 'Dr. Yashwant Dubey'),
      patientInput: (record as any).patientInput,
      analysisResult: (record as any).analysisResult,
      createdAt: (record as any).createdAt,
    };

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history/[id]
 * Delete a prescription history record by MongoDB _id or rxId
 * Protected by Bearer token authentication.
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
      ? await PrescriptionHistory.findByIdAndDelete(id)
      : await PrescriptionHistory.findOneAndDelete({ rxId: id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Prescription history record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Prescription history record deleted successfully',
        id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * Reject PUT/PATCH: "Dont make edit api"
 */
export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Editing prescription history records is not permitted.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, message: 'Editing prescription history records is not permitted.' },
    { status: 405 }
  );
}
