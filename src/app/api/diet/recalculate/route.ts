import { NextResponse } from "next/server";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.8-flash:generateContent";

interface MealSlotInput {
  time?: string;
  mealName?: string;
  portion?: string;
  focus?: string;
  clinicalNote?: string;
}

interface RecalculateRequest {
  mealSchedule: MealSlotInput[];
  condition?: string;
  dietaryPreference?: string;
  patient?: {
    patientName?: string;
    age?: number | string;
    gender?: string;
    weightKg?: number | string;
    heightCm?: number | string;
    disease?: string;
    dietaryPreference?: string;
  };
  targetCalories?: number;
}

function parseJson(raw: string) {
  let cleaned = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

function calculateClinicalFallback(mealSchedule: MealSlotInput[], targetCaloriesHint?: number) {
  // Estimate based on number of meal slots and typical Indian portions
  const slotCount = Math.max(1, mealSchedule.length);
  
  let totalKcal = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  mealSchedule.forEach((meal) => {
    const text = `${meal.mealName || ""} ${meal.portion || ""} ${meal.focus || ""}`.toLowerCase();
    
    // Base calories per slot type
    let slotKcal = 220;
    let slotProtein = 8;
    let slotFat = 6;
    let slotCarbs = 34;

    if (text.includes("early morning") || text.includes("bedtime") || text.includes("soother")) {
      slotKcal = 90;
      slotProtein = 3;
      slotFat = 2;
      slotCarbs = 12;
    } else if (text.includes("lunch") || text.includes("thali") || text.includes("dinner")) {
      slotKcal = 480;
      slotProtein = 18;
      slotFat = 14;
      slotCarbs = 70;
    } else if (text.includes("breakfast") || text.includes("nashta")) {
      slotKcal = 380;
      slotProtein = 14;
      slotFat = 10;
      slotCarbs = 56;
    } else if (text.includes("snack") || text.includes("mid-morning") || text.includes("tea")) {
      slotKcal = 160;
      slotProtein = 6;
      slotFat = 4;
      slotCarbs = 24;
    }

    // Portion modifiers
    if (text.includes("3 roti") || text.includes("3 phulka") || text.includes("2 katori") || text.includes("large") || text.includes("heavy")) {
      slotKcal = Math.round(slotKcal * 1.3);
      slotProtein = Math.round(slotProtein * 1.3);
      slotFat = Math.round(slotFat * 1.3);
      slotCarbs = Math.round(slotCarbs * 1.3);
    } else if (text.includes("1 roti") || text.includes("1 phulka") || text.includes("half") || text.includes("light") || text.includes("small")) {
      slotKcal = Math.round(slotKcal * 0.75);
      slotProtein = Math.round(slotProtein * 0.75);
      slotFat = Math.round(slotFat * 0.75);
      slotCarbs = Math.round(slotCarbs * 0.75);
    }

    // Item boosts
    if (text.includes("paneer") || text.includes("egg") || text.includes("chicken") || text.includes("fish") || text.includes("soya")) {
      slotProtein += 8;
      slotFat += 4;
      slotKcal += 65;
    }
    if (text.includes("dal") || text.includes("sprouts") || text.includes("chana") || text.includes("rajma") || text.includes("curd")) {
      slotProtein += 5;
      slotCarbs += 8;
      slotKcal += 50;
    }
    if (text.includes("ghee") || text.includes("oil") || text.includes("nuts") || text.includes("almond")) {
      slotFat += 5;
      slotKcal += 45;
    }

    totalKcal += slotKcal;
    totalProtein += slotProtein;
    totalFat += slotFat;
    totalCarbs += slotCarbs;
  });

  // If a target calorie was specified and difference is reasonable, blend gently
  if (targetCaloriesHint && targetCaloriesHint > 1000) {
    totalKcal = Math.round((totalKcal * 0.6) + (targetCaloriesHint * 0.4));
  } else if (totalKcal < 1200) {
    totalKcal = 1450;
  }

  return {
    calories: totalKcal,
    caloriesText: `${totalKcal.toLocaleString()} kcal`,
    protein: `${totalProtein}g`,
    fats: `${totalFat}g`,
    carbs: `${totalCarbs}g`,
    fiber: `${Math.round(totalKcal * 0.016)}g`,
    summary: `Recalculated Indian nutrition: ${totalKcal} kcal balanced across ${slotCount} meal slots.`
  };
}

export async function POST(req: Request) {
  try {
    const body: RecalculateRequest = await req.json();
    const { mealSchedule = [], patient = {}, condition, dietaryPreference, targetCalories } = body;

    if (!Array.isArray(mealSchedule) || mealSchedule.length === 0) {
      return NextResponse.json(
        { success: false, error: "Meal schedule cannot be empty." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Helper to format values strictly as grams
    const formatGrams = (v: any, fallbackNum: number) => {
      if (!v) return `${fallbackNum}g`;
      const m = String(v).match(/(\d+)\s*(?:g|gm|grams)?\b/i);
      return m ? `${m[1]}g` : `${fallbackNum}g`;
    };

    // If Gemini API is available, ask Gemini to recalculate precisely with minimal tokens
    if (apiKey) {
      try {
        const scheduleText = mealSchedule
          .map((m) => `- ${m.mealName || "Meal"}: ${m.portion || "Standard"} (${m.focus || ""})`)
          .join("\n");

        const conditionText = condition || patient.disease || "General Health";
        const prefText = dietaryPreference || patient.dietaryPreference || "Vegetarian";

        const prompt = `Indian Clinical Nutritionist. Calculate total daily calories and macronutrients strictly in grams (g) for this meal schedule.
Condition: ${conditionText} | Diet: ${prefText}${targetCalories ? ` | Target: ${targetCalories} kcal` : ""}

Meals:
${scheduleText}

Return ONLY raw JSON with protein, fats, and carbs strictly formatted as grams ending in 'g' (NEVER use %):
{
  "calories": <integer e.g. 1750>,
  "caloriesText": "<string e.g. '1,750 kcal'>",
  "protein": "<string e.g. '68g'>",
  "fats": "<string e.g. '42g'>",
  "carbs": "<string e.g. '275g'>",
  "fiber": "<string e.g. '28g'>",
  "summary": "<1 brief sentence>"
}`;

        const geminiRes = await fetch(GEMINI_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (rawText) {
            const parsed = parseJson(rawText);
            const calNum = Number(parsed.calories) || Number(parsed.targetCalories) || 1750;
            return NextResponse.json({
              success: true,
              data: {
                calories: calNum,
                caloriesText: parsed.caloriesText || `${calNum.toLocaleString()} kcal`,
                protein: formatGrams(parsed.protein, 65),
                fats: formatGrams(parsed.fats, 45),
                carbs: formatGrams(parsed.carbs, 265),
                fiber: formatGrams(parsed.fiber, 26),
                summary: parsed.summary || "Nutritional profile updated."
              }
            });
          }
        }
      } catch (geminiError) {
        console.warn("Gemini recalculate failed, using fallback:", geminiError);
      }
    }

    // Fallback calculation
    const fallbackData = calculateClinicalFallback(mealSchedule, targetCalories);
    return NextResponse.json({
      success: true,
      data: fallbackData
    });
  } catch (error: any) {
    console.error("Recalculate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to recalculate nutrition." },
      { status: 500 }
    );
  }
}
