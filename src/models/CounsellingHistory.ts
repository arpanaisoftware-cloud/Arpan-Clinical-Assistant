import mongoose, { Schema, Document } from 'mongoose';
import { RiskAssessmentItem } from '@/types/clinical';

export interface ICounsellingHistory extends Document {
  counsellingId: string;
  patientName: string;
  age: number;
  gender: string;
  disease: string;
  sbp?: string;
  dbp?: string;
  hba1c?: string;
  egfr?: string;
  sensationLoss?: string;
  footGrade?: string;
  riskFactors: RiskAssessmentItem[];
  highRiskCount: number;
  moderateRiskCount: number;
  riskCount: number;
  overallRiskLevel: string;
  color: string;
  date: string;
  createdBy?: string;
  analysedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CounsellingHistorySchema = new Schema<ICounsellingHistory>(
  {
    counsellingId: {
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
    sbp: {
      type: String,
      default: '',
    },
    dbp: {
      type: String,
      default: '',
    },
    hba1c: {
      type: String,
      default: '',
    },
    egfr: {
      type: String,
      default: '',
    },
    sensationLoss: {
      type: String,
      default: '',
    },
    footGrade: {
      type: String,
      default: '',
    },
    riskFactors: {
      type: Schema.Types.Mixed,
      default: [],
    },
    highRiskCount: {
      type: Number,
      default: 0,
    },
    moderateRiskCount: {
      type: Number,
      default: 0,
    },
    riskCount: {
      type: Number,
      default: 0,
    },
    overallRiskLevel: {
      type: String,
      default: 'OPTIMAL / LOW',
    },
    color: {
      type: String,
      default: '#00C9A7',
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

CounsellingHistorySchema.index({ patientName: 'text', disease: 'text', counsellingId: 'text' });

/**
 * Prune helper: keeps the 2000 most recent records and deletes older ones automatically.
 */
export async function pruneOldCounsellingHistory() {
  const MAX_RECORDS = 2000;
  try {
    const totalCount = await CounsellingHistory.countDocuments();
    if (totalCount > MAX_RECORDS) {
      const recordsToPrune = await CounsellingHistory.find()
        .sort({ createdAt: -1 })
        .skip(MAX_RECORDS)
        .select('_id')
        .lean();

      if (recordsToPrune.length > 0) {
        const idsToDelete = recordsToPrune.map((r: any) => r._id);
        const result = await CounsellingHistory.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`[MongoDB Maintenance] Automatically pruned ${result.deletedCount} old counselling history records. Kept latest 2000.`);
      }
    }
  } catch (err: any) {
    console.error('Error auto-pruning counselling history:', err.message);
  }
}

if (mongoose.models.CounsellingHistory && !mongoose.models.CounsellingHistory.schema?.paths['analysedBy']) {
  delete mongoose.models.CounsellingHistory;
}

const CounsellingHistory =
  mongoose.models.CounsellingHistory ||
  mongoose.model<ICounsellingHistory>('CounsellingHistory', CounsellingHistorySchema);

export default CounsellingHistory;

