import mongoose from 'mongoose';

const DietSchema = new mongoose.Schema(
  {
    customId: { type: String, required: true, unique: true }, // Mapped from 'id' in DietPlanItem
    name: { type: String, required: true },
    diseaseCategory: { type: String, required: true },
    calories: { type: Number, required: true },
    bmiCategory: { type: String, required: true },
    macroBreakdown: {
      carbs: { type: String, required: true },
      protein: { type: String, required: true },
      fats: { type: String, required: true },
      fiber: { type: String, required: true },
    },
    electrolyteLimits: {
      sodium: { type: String, required: true },
      potassium: { type: String, required: true },
      phosphorus: { type: String, required: true },
      calcium: { type: String, required: true },
    },
    mealFrequency: {
      frequency: { type: String, required: true },
      schedule: [
        {
          time: { type: String, required: true },
          mealName: { type: String, required: true },
          portion: { type: String, required: true },
          focus: { type: String, required: true },
        },
      ],
    },
    recommendedFoods: [{ type: String }],
    foodsToAvoid: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Diet || mongoose.model('Diet', DietSchema);
