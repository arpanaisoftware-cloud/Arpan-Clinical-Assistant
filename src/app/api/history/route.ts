import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PrescriptionHistory, { pruneOldPrescriptionHistory } from '@/models/PrescriptionHistory';
import { ensureDefaultPrescriptionHistory } from '@/lib/seedPrescriptionHistory';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/history
 * Pagination API with default 5 data per page and search query support.
 * Protected by Bearer token authentication.
 */
export async function GET(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    await ensureDefaultPrescriptionHistory();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '5', 10)); // Default 5 items per page
    const search = (searchParams.get('search') || '').trim();

    const filter: any = {};
    if (search) {
      // Escape regex special chars
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { patientName: { $regex: regex } },
        { disease: { $regex: regex } },
        { rxId: { $regex: regex } },
      ];
    }

    const totalRecords = await PrescriptionHistory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const skip = (page - 1) * limit;

    const records = await PrescriptionHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = records.map((r: any) => ({
      id: r.rxId,
      _id: r._id.toString(),
      rxId: r.rxId,
      patientName: r.patientName,
      age: r.age,
      gender: r.gender,
      disease: r.disease,
      medCount: r.medCount,
      safetyScore: r.safetyScore,
      risk: r.risk,
      color: r.color,
      date: r.date,
      patientInput: r.patientInput,
      analysisResult: r.analysisResult,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('GET /api/history error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch prescription history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history
 * Create new Prescription Analysis History record in MongoDB.
 * Enforces rule: Keep latest 100 data in MongoDB and automatically delete older records.
 */
export async function POST(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();

    const body = await req.json();

    if (!body.patientName) {
      return NextResponse.json(
        { success: false, message: 'Patient name is required' },
        { status: 400 }
      );
    }

    // Generate unique rxId if not specified
    let rxId = body.rxId || body.id;
    if (!rxId) {
      rxId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Ensure unique rxId
    const existing = await PrescriptionHistory.findOne({ rxId });
    if (existing) {
      rxId = `RX-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    }

    const newRecord = new PrescriptionHistory({
      rxId,
      patientName: body.patientName.trim(),
      age: Number(body.age) || 0,
      gender: body.gender || 'Other',
      disease: body.disease || 'General Diagnosis',
      medCount: Number(body.medCount) || (body.patientInput?.medications?.length || 0),
      safetyScore: Number(body.safetyScore) || (body.analysisResult?.safetyScore || 80),
      risk: body.risk || (body.analysisResult?.riskCategory || 'OPTIMAL / LOW RISK'),
      color: body.color || (body.analysisResult?.statusColor || '#00C9A7'),
      date: body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      patientInput: body.patientInput || null,
      analysisResult: body.analysisResult || null,
      createdBy: body.createdBy || auth.user?.email || auth.user?.id || null,
    });

    await newRecord.save();

    // Enforce keeping maximum 100 latest data in MongoDB and automatically delete older records
    await pruneOldPrescriptionHistory();

    const formattedData = {
      id: newRecord.rxId,
      _id: newRecord._id.toString(),
      rxId: newRecord.rxId,
      patientName: newRecord.patientName,
      age: newRecord.age,
      gender: newRecord.gender,
      disease: newRecord.disease,
      medCount: newRecord.medCount,
      safetyScore: newRecord.safetyScore,
      risk: newRecord.risk,
      color: newRecord.color,
      date: newRecord.date,
      patientInput: newRecord.patientInput,
      analysisResult: newRecord.analysisResult,
      createdAt: newRecord.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Prescription analysis history saved successfully',
        data: formattedData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/history error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save prescription history' },
      { status: 500 }
    );
  }
}

/**
 * Explicitly reject PUT/PATCH: "Dont make edit api"
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
