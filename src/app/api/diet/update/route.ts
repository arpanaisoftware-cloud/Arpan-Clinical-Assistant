import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import DietHistory, { pruneOldDietHistory } from '@/models/DietHistory';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  return handleDietUpdate(req);
}

export async function PUT(req: Request) {
  return handleDietUpdate(req);
}

export async function PATCH(req: Request) {
  return handleDietUpdate(req);
}

async function handleDietUpdate(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    const body = await req.json();
    const id = body.dietId || body.id || body._id;

    let record = null;
    if (id) {
      record = mongoose.isValidObjectId(id)
        ? await DietHistory.findById(id)
        : await DietHistory.findOne({ dietId: id });
    }

    // If not found by ID, attempt to find latest matching patient record
    if (!record && body.patientName) {
      record = await DietHistory.findOne({
        patientName: body.patientName.trim(),
        ...(body.disease ? { disease: body.disease.trim() } : {}),
      }).sort({ createdAt: -1 });
    }

    const analysedBy = auth.user?.name || body.analysedBy || 'Dr. Yashwant Dubey';

    if (record) {
      // Update existing record
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
          message: 'Diet plan updated successfully',
          data: formattedData,
        },
        { status: 200 }
      );
    } else {
      // Create new record if no existing record found
      let dietId = body.dietId || body.id;
      if (!dietId) {
        dietId = `DT-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      const newRecord = new DietHistory({
        dietId,
        patientName: (body.patientName || 'Patient').trim(),
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
          message: 'Diet plan created and updated successfully',
          data: formattedData,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Diet update error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error while updating diet plan' },
      { status: 500 }
    );
  }
}

