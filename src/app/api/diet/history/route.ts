import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DietHistory, { pruneOldDietHistory } from '@/models/DietHistory';
import User from '@/models/User';
import { ensureDefaultDietHistory } from '@/lib/seedDietHistory';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/diet/history
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
    await ensureDefaultDietHistory();

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
        { dietId: { $regex: regex } },
        { planName: { $regex: regex } },
        { dietaryPreference: { $regex: regex } },
        { analysedBy: { $regex: regex } },
      ];
    }

    const totalRecords = await DietHistory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const skip = (page - 1) * limit;

    const records = await DietHistory.find(filter)
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
        id: r.dietId,
        _id: r._id.toString(),
        dietId: r.dietId,
        patientName: r.patientName,
        age: r.age,
        gender: r.gender,
        disease: r.disease,
        dietaryPreference: r.dietaryPreference || 'Vegetarian (Shakahari)',
        targetCalories: r.targetCalories || 1750,
        language: r.language || 'Hindi',
        planName: r.planName || 'Indian Clinical Diet Plan',
        summary: r.summary || '',
        dietPlan: r.dietPlan,
        patientForm: r.patientForm,
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
    console.error('GET /api/diet/history error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch diet history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diet/history
 * Create new Diet & Clinical Nutrition History record in MongoDB.
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

    // Generate unique dietId if not specified
    let dietId = body.dietId || body.id;
    if (!dietId) {
      dietId = `DT-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const existing = await DietHistory.findOne({ dietId });
    if (existing) {
      dietId = `DT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    }

    // Always use the JWT-verified user's name as analysedBy — the real logged-in user.
    const analysedBy = auth.user?.name || body.analysedBy || 'Dr. Yashwant Dubey';

    const newRecord = new DietHistory({
      dietId,
      patientName: body.patientName.trim(),
      age: Number(body.age) || 0,
      gender: body.gender || 'Other',
      disease: body.disease || 'General Nutrition Therapy',
      dietaryPreference: body.dietaryPreference || 'Vegetarian (Shakahari)',
      targetCalories: Number(body.targetCalories) || (body.dietPlan?.targetCalories || 1750),
      language: body.language || 'Hindi',
      planName: body.planName || (body.dietPlan?.planName || 'Indian Clinical Diet Plan'),
      summary: body.summary || (body.dietPlan?.summary || ''),
      dietPlan: body.dietPlan || null,
      patientForm: body.patientForm || null,
      date: body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
      createdBy: body.createdBy || auth.user?.email || auth.user?.id || null,
      analysedBy,
    });

    await newRecord.save();

    // Enforce keeping maximum 2000 latest data in MongoDB and automatically delete older records
    await pruneOldDietHistory();

    const formattedData = {
      id: newRecord.dietId,
      _id: newRecord._id.toString(),
      dietId: newRecord.dietId,
      patientName: newRecord.patientName,
      age: newRecord.age,
      gender: newRecord.gender,
      disease: newRecord.disease,
      dietaryPreference: newRecord.dietaryPreference,
      targetCalories: newRecord.targetCalories,
      language: newRecord.language,
      planName: newRecord.planName,
      summary: newRecord.summary,
      dietPlan: newRecord.dietPlan,
      patientForm: newRecord.patientForm,
      date: newRecord.date,
      analysedBy: newRecord.analysedBy,
      createdAt: newRecord.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Diet plan history saved successfully',
        data: formattedData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/diet/history error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save diet history' },
      { status: 500 }
    );
  }
}
