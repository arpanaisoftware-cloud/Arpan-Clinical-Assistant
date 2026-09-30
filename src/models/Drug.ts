import mongoose from 'mongoose';

const DrugSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    genericName: { type: String, required: true },
    standardDosage: { type: String, required: true },
    alternatives: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        priceSavings: { type: String, required: true },
        efficacy: { type: String, required: true },
        manufacturer: { type: String, required: true },
        notes: { type: String, required: true },
      },
    ],
    contraindications: [{ type: String }],
    interactions: [
      {
        drug: { type: String, required: true },
        severity: { type: String, required: true },
        effect: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Drug || mongoose.model('Drug', DrugSchema);
