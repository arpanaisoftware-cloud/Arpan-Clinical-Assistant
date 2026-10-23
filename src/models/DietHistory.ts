import mongoose, { Schema, Document } from 'mongoose';

export interface IDietHistory extends Document {
  dietId: string;
  patientName: string;
  age: number;
  gender: string;
  disease: string;
  dietaryPreference: string;
  targetCalories: number;
  language: string;
  planName: string;
  summary: string;
  dietPlan: any;
  patientForm: any;
  date: string;
  analysedBy?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DietHistorySchema = new Schema<IDietHistory>(
  {
    dietId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      default: 0,
    },
    gender: {
      type: String,
      required: true,
      default: 'Other',
    },
    disease: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    dietaryPreference: {
      type: String,
      default: 'Vegetarian (Shakahari)',
    },
    targetCalories: {
      type: Number,
      default: 1750,
    },
    language: {
      type: String,
      default: 'Hindi',
    },
    planName: {
      type: String,
      default: 'Indian Clinical Diet Plan',
    },
    summary: {
      type: String,
      default: '',
    },
    dietPlan: {
      type: Schema.Types.Mixed,
      default: null,
    },
    patientForm: {
      type: Schema.Types.Mixed,
      default: null,
    },
    date: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: null,
    },
    analysedBy: {
      type: String,
      default: 'Dr. Yashwant Dubey',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

DietHistorySchema.index({ patientName: 'text', disease: 'text', dietId: 'text', planName: 'text' });

/**
 * Prune helper: keeps the 2000 most recent records and deletes older ones automatically.
 */
export async function pruneOldDietHistory() {
  const MAX_RECORDS = 2000;
  try {
    const totalCount = await DietHistory.countDocuments();
    if (totalCount > MAX_RECORDS) {
      const recordsToPrune = await DietHistory.find()
        .sort({ createdAt: -1 })
        .skip(MAX_RECORDS)
        .select('_id')
        .lean();

      if (recordsToPrune.length > 0) {
        const idsToDelete = recordsToPrune.map((r: any) => r._id);
        const result = await DietHistory.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`[MongoDB Maintenance] Automatically pruned ${result.deletedCount} old diet history records. Kept latest 2000.`);
      }
    }
  } catch (err: any) {
    console.error('Error auto-pruning diet history:', err.message);
  }
}

if (mongoose.models.DietHistory && !mongoose.models.DietHistory.schema?.paths['analysedBy']) {
  delete mongoose.models.DietHistory;
}

const DietHistory =
  mongoose.models.DietHistory ||
  mongoose.model<IDietHistory>('DietHistory', DietHistorySchema);

export default DietHistory;

