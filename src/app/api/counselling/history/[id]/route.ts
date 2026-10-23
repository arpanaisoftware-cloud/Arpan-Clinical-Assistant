import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import CounsellingHistory from '@/models/CounsellingHistory';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/counselling/history/[id]
 * Fetch single counselling record by MongoDB _id or counsellingId
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
      ? await CounsellingHistory.findById(id).lean()
      : await CounsellingHistory.findOne({ counsellingId: id }).lean();

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Counselling history record not found' },
        { status: 404 }
      );
    }

    const formattedData = {
      id: (record as any).counsellingId,
      _id: (record as any)._id.toString(),
      counsellingId: (record as any).counsellingId,
      patientName: (record as any).patientName,
      age: (record as any).age,
      gender: (record as any).gender,
      disease: (record as any).disease,
      sbp: (record as any).sbp,
      dbp: (record as any).dbp,
      hba1c: (record as any).hba1c,
      egfr: (record as any).egfr,
      sensationLoss: (record as any).sensationLoss,
      footGrade: (record as any).footGrade,
      riskFactors: (record as any).riskFactors || [],
      highRiskCount: (record as any).highRiskCount || 0,
      moderateRiskCount: (record as any).moderateRiskCount || 0,
      riskCount: (record as any).riskCount || 0,
      overallRiskLevel: (record as any).overallRiskLevel || 'OPTIMAL / LOW',
      color: (record as any).color || '#00C9A7',
      date: (record as any).date,
      analysedBy: (record as any).analysedBy || ((record as any).createdBy && !(record as any).createdBy.includes('@') ? (record as any).createdBy : 'Dr. Yashwant Dubey'),
      createdAt: (record as any).createdAt,
    };

    return NextResponse.json({ success: true, data: formattedData }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/counselling/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/counselling/history/[id]
 * Delete single counselling record by MongoDB _id or counsellingId
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
      ? await CounsellingHistory.findByIdAndDelete(id)
      : await CounsellingHistory.findOneAndDelete({ counsellingId: id });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Counselling history record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Counselling history record deleted successfully',
        id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/counselling/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
