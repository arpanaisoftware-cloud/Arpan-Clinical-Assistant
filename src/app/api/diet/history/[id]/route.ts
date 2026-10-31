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

/**
 * PUT /api/diet/history/[id]
 * Update single diet plan record by MongoDB _id or dietId
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return updateDietRecord(req, params.id);
}

/**
 * PATCH /api/diet/history/[id]
 * Partially update single diet plan record by MongoDB _id or dietId
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return updateDietRecord(req, params.id);
}

async function updateDietRecord(req: Request, id: string) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    const body = await req.json();

    const record = mongoose.isValidObjectId(id)
      ? await DietHistory.findById(id)
      : await DietHistory.findOne({ dietId: id });

    if (!record) {
      return NextResponse.json(
        { success: false, message: 'Diet history record not found' },
        { status: 404 }
      );
    }

    const analysedBy = auth.user?.name || body.analysedBy || record.analysedBy || 'Dr. Yashwant Dubey';

    if (body.patientName) record.patientName = body.patientName.trim();
    if (body.age !== undefined && body.age !== null) record.age = Number(body.age) || record.age;
    if (body.gender) record.gender = body.gender;
    if (body.disease) record.disease = body.disease.trim();
    if (body.dietaryPreference) record.dietaryPreference = body.dietaryPreference;
    if (body.targetCalories !== undefined && body.targetCalories !== null) {
      record.targetCalories = Number(body.targetCalories) || record.targetCalories;
    }
    if (body.language) record.language = body.language;
    if (body.planName) record.planName = body.planName;
    if (body.summary !== undefined) record.summary = body.summary;
    if (body.dietPlan) {
      record.dietPlan = body.dietPlan;
      record.markModified('dietPlan');
    }
    if (body.patientForm) {
      record.patientForm = body.patientForm;
      record.markModified('patientForm');
    }
    record.analysedBy = analysedBy;
    record.date = body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

    await record.save();

    const formattedData = {
      id: record.dietId,
      _id: record._id.toString(),
      dietId: record.dietId,
      patientName: record.patientName,
      age: record.age,
      gender: record.gender,
      disease: record.disease,
      dietaryPreference: record.dietaryPreference,
      targetCalories: record.targetCalories,
      language: record.language,
      planName: record.planName,
      summary: record.summary,
      dietPlan: record.dietPlan,
      patientForm: record.patientForm,
      date: record.date,
      analysedBy: record.analysedBy,
      createdAt: record.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Diet history record updated successfully',
        data: formattedData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT/PATCH /api/diet/history/[id] error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
