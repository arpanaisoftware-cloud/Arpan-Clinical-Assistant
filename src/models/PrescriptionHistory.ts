import mongoose, { Schema, Document } from 'mongoose';
import { AnalysisResult, PatientInput } from '@/types/clinical';

export interface IPrescriptionHistory extends Document {
  rxId: string;
  patientName: string;
  age: number;
  gender: string;
  disease: string;
  medCount: number;
  safetyScore: number;
  risk: string;
  color: string;
  date: string;
  patientInput?: PatientInput;
  analysisResult?: AnalysisResult;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionHistorySchema = new Schema<IPrescriptionHistory>(
  {
    rxId: {
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
    medCount: {
      type: Number,
      default: 0,
    },
    safetyScore: {
      type: Number,
      default: 80,
    },
    risk: {
      type: String,
      default: 'OPTIMAL / LOW RISK',
    },
    color: {
      type: String,
      default: '#00C9A7',
    },
    date: {
      type: String,
      required: true,
    },
    patientInput: {
      type: Schema.Types.Mixed,
      default: null,
    },
    analysisResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    createdBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text/search indexing
PrescriptionHistorySchema.index({ patientName: 'text', disease: 'text', rxId: 'text' });

/**
 * Prune helper: keeps the 100 most recent records and deletes older ones automatically.
 */
export async function pruneOldPrescriptionHistory() {
  const MAX_RECORDS = 100;
  try {
    const totalCount = await PrescriptionHistory.countDocuments();
    if (totalCount > MAX_RECORDS) {
      const recordsToPrune = await PrescriptionHistory.find()
        .sort({ createdAt: -1 })
        .skip(MAX_RECORDS)
        .select('_id')
        .lean();

      if (recordsToPrune.length > 0) {
        const idsToDelete = recordsToPrune.map((r: any) => r._id);
        const result = await PrescriptionHistory.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`[MongoDB Maintenance] Automatically pruned ${result.deletedCount} old prescription history records. Kept latest 100.`);
      }
    }
  } catch (err: any) {
    console.error('Error auto-pruning prescription history:', err.message);
  }
}

const PrescriptionHistory =
  mongoose.models.PrescriptionHistory ||
  mongoose.model<IPrescriptionHistory>('PrescriptionHistory', PrescriptionHistorySchema);

export default PrescriptionHistory;
