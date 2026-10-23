import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CounsellingHistory, { pruneOldCounsellingHistory } from '@/models/CounsellingHistory';
import User from '@/models/User';
import { ensureDefaultCounsellingHistory } from '@/lib/seedCounsellingHistory';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/counselling/history
 * Pagination API with default 5 data per page and search query support.
 * Retains up to 2000 latest records in MongoDB.
 * Protected by Bearer token authentication.
 */
export async function GET(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    await ensureDefaultCounsellingHistory();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '5', 10));
    const search = (searchParams.get('search') || '').trim();

    const filter: any = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [
        { patientName: { $regex: regex } },
        { disease: { $regex: regex } },
        { counsellingId: { $regex: regex } },
        { analysedBy: { $regex: regex } },
      ];
    }

    const totalRecords = await CounsellingHistory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const skip = (page - 1) * limit;

    const records = await CounsellingHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const allUsers = await User.find({}).select('email staffId name').lean();
    const userMap = new Map<string, string>();
    allUsers.forEach((u: any) => {
      if (u.email) userMap.set(u.email.toLowerCase(), u.name);
      if (u.staffId) userMap.set(u.staffId.toLowerCase(), u.name);
    });

    const data = records.map((r: any) => {
      const fallbackName = (r.createdBy && userMap.get(r.createdBy.toLowerCase())) || (r.createdBy && !r.createdBy.includes('@') ? r.createdBy : 'Dr. Yashwant Dubey');
      return {
        id: r.counsellingId,
        _id: r._id.toString(),
        counsellingId: r.counsellingId,
        patientName: r.patientName,
        age: r.age,
        gender: r.gender,
        disease: r.disease,
        sbp: r.sbp,
        dbp: r.dbp,
        hba1c: r.hba1c,
        egfr: r.egfr,
        sensationLoss: r.sensationLoss,
        footGrade: r.footGrade,
        riskFactors: r.riskFactors || [],
        highRiskCount: r.highRiskCount || 0,
        moderateRiskCount: r.moderateRiskCount || 0,
        riskCount: r.riskCount || 0,
        overallRiskLevel: r.overallRiskLevel || 'OPTIMAL / LOW',
        color: r.color || '#00C9A7',
        date: r.date,
        analysedBy: r.analysedBy || fallbackName,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
      };
    });

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
    console.error('GET /api/counselling/history error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch counselling history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/counselling/history
 * Create new Chronic Risk Counselling History record in MongoDB.
 * Enforces rule: Keep latest 2000 data in MongoDB and automatically delete older records.
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

    // Generate unique counsellingId if not specified
    let counsellingId = body.counsellingId || body.id;
    if (!counsellingId) {
      counsellingId = `CNS-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const existing = await CounsellingHistory.findOne({ counsellingId });
    if (existing) {
      counsellingId = `CNS-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    }

    // Calculate risk counts
    const riskFactors = Array.isArray(body.riskFactors) ? body.riskFactors : [];
    const highRisks = riskFactors.filter((rf: any) => (rf.riskLevel || '').toUpperCase().includes('HIGH'));
    const modRisks = riskFactors.filter((rf: any) => (rf.riskLevel || '').toUpperCase().includes('MODERATE'));

    const highCount = body.highRiskCount !== undefined ? Number(body.highRiskCount) : highRisks.length;
    const modCount = body.moderateRiskCount !== undefined ? Number(body.moderateRiskCount) : modRisks.length;
    const totalRiskCount = body.riskCount !== undefined ? Number(body.riskCount) : (highCount + modCount);

    let overallRiskLevel = body.overallRiskLevel;
    let color = body.color;
    if (!overallRiskLevel) {
      if (highCount > 0) {
        overallRiskLevel = 'HIGH RISK';
        color = '#FF4D6D';
      } else if (modCount > 0) {
        overallRiskLevel = 'MODERATE CAUTION';
        color = '#FFB703';
      } else {
        overallRiskLevel = 'OPTIMAL / LOW';
        color = '#00C9A7';
      }
    }

    // Always use the JWT-verified user's name as analysedBy — the real logged-in user.
    const analysedBy = auth.user?.name || body.analysedBy || 'Dr. Yashwant Dubey';

    const newRecord = new CounsellingHistory({
      counsellingId,
      patientName: body.patientName.trim(),
      age: Number(body.age) || 0,
      gender: body.gender || 'Other',
      disease: body.disease || 'General Chronic Assessment',
      sbp: String(body.sbp || ''),
      dbp: String(body.dbp || ''),
      hba1c: String(body.hba1c || ''),
      egfr: String(body.egfr || ''),
      sensationLoss: body.sensationLoss || 'no',
      footGrade: body.footGrade || 'grade_0',
      riskFactors,
      highRiskCount: highCount,
      moderateRiskCount: modCount,
      riskCount: totalRiskCount,
      overallRiskLevel,
      color: color || '#00C9A7',
      date: body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      createdBy: body.createdBy || auth.user?.email || auth.user?.id || null,
      analysedBy,
    });

    await newRecord.save();

    // Enforce keeping maximum 2000 latest data in MongoDB and automatically delete older records
    await pruneOldCounsellingHistory();

    const formattedData = {
      id: newRecord.counsellingId,
      _id: newRecord._id.toString(),
      counsellingId: newRecord.counsellingId,
      patientName: newRecord.patientName,
      age: newRecord.age,
      gender: newRecord.gender,
      disease: newRecord.disease,
      sbp: newRecord.sbp,
      dbp: newRecord.dbp,
      hba1c: newRecord.hba1c,
      egfr: newRecord.egfr,
      sensationLoss: newRecord.sensationLoss,
      footGrade: newRecord.footGrade,
      riskFactors: newRecord.riskFactors,
      highRiskCount: newRecord.highRiskCount,
      moderateRiskCount: newRecord.moderateRiskCount,
      riskCount: newRecord.riskCount,
      overallRiskLevel: newRecord.overallRiskLevel,
      color: newRecord.color,
      date: newRecord.date,
      analysedBy: newRecord.analysedBy,
      createdAt: newRecord.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Counselling analysis history saved successfully',
        data: formattedData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/counselling/history error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save counselling history' },
      { status: 500 }
    );
  }
}
