import mongoose from 'mongoose';

const CounsellingSchema = new mongoose.Schema(
  {
    customId: { type: String, required: true, unique: true }, // Mapped from 'id' in frontend RiskAssessmentItem
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ['OPTIMAL / LOW', 'MODERATE CAUTION', 'HIGH RISK'],
      required: true,
    },
    score: { type: Number, required: true },
    color: { type: String, required: true },
    keyIndicators: [{ type: String }],
    clinicalGuidance: [{ type: String }],
    patientAdvice: [{ type: String }],
    screeningSchedule: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Counselling || mongoose.model('Counselling', CounsellingSchema);
