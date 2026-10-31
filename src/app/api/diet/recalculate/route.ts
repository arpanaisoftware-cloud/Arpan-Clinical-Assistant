import { NextResponse } from "next/server";
import { generateClinicalJsonAnalysis } from "@/lib/aiProvider";

interface MealSlotInput {
  time?: string;
  mealName?: string;
  portion?: string;
  focus?: string;
  clinicalNote?: string;
}

interface PatientInput {
  patientName?: string;
  age?: number | string;
  gender?: string;
  weightKg?: number | string;
  heightCm?: number | string;
  disease?: string;
  condition?: string;
  dietaryPreference?: string;
  allergies?: string;
  comorbidities?: string;
  bmi?: number | string;
  hba1c?: number | string;
  fastingGlucose?: number | string;
  creatinine?: number | string;
  egfr?: number | string;
  bpSystolic?: number | string;
  bpDiastolic?: number | string;
  language?: string;
  customCalories?: number | string;
}

interface RecalculateRequest {
  mealSchedule: MealSlotInput[];
  condition?: string;
  dietaryPreference?: string;
  targetCalories?: number;
  patient?: PatientInput;
}

/**
 * Standard clinical percentage contributions for Indian meal slots:
 * - Early Morning: 5% (0.05)
 * - Breakfast: 23% (0.23)
 * - Mid-Morning Snack: 5% (0.05)
 * - Lunch: 32% (0.32)
 * - Evening Snack: 10% (0.10)
 * - Dinner: 25% (0.25)
 * - Bedtime Drink: 5% (0.05)
 */
function getStandardMealSlotWeight(name: string): number {
  const lower = (name || "").toLowerCase().trim();
  if (!lower) return 0;

  if (lower.includes("early morning") || lower.includes("सुबह की शुरुआत") || (lower.includes("morning") && !lower.includes("mid") && !lower.includes("breakfast"))) {
    return 0.05;
  }
  if (lower.includes("breakfast") || lower.includes("नाश्ता") || lower.includes("nashta")) {
    return 0.23;
  }
  if (lower.includes("mid-morning") || lower.includes("हल्का नाश्ता") || lower.includes("refreshment")) {
    return 0.05;
  }
  if (lower.includes("lunch") || lower.includes("दोपहर") || lower.includes("thali") || lower.includes("dopahar")) {
    return 0.32;
  }
  if (lower.includes("evening") || lower.includes("शाम") || lower.includes("tea time") || lower.includes("snack")) {
    return 0.10;
  }
  if (lower.includes("dinner") || lower.includes("रात") || lower.includes("ratri")) {
    return 0.25;
  }
  if (lower.includes("bedtime") || lower.includes("सोने से पहले") || lower.includes("haldi doodh") || lower.includes("soother")) {
    return 0.05;
  }
  // Custom slot default:
  return 0.10;
}

/**
 * Multiplier based on user portion wording:
 * Heavy portions -> 1.25x
 * Light portions -> 0.85x
 * Normal -> 1.0x
 */
function getPortionMultiplier(portionText: string, focusText: string): number {
  const combined = `${portionText} ${focusText}`.toLowerCase();
  if (
    combined.includes("4 phulka") ||
    combined.includes("4 रोटी") ||
    combined.includes("4 परांठे") ||
    combined.includes("2 बड़ी कटोरी") ||
    combined.includes("बड़ी थाली") ||
    combined.includes("heavy") ||
    combined.includes("double")
  ) {
    return 1.25;
  }
  if (
    combined.includes("1 पतली") ||
    combined.includes("1/2 कटोरी") ||
    combined.includes("half") ||
    combined.includes("आधा") ||
    combined.includes("छोटा") ||
    combined.includes("small") ||
    combined.includes("light")
  ) {
    return 0.85;
  }
  return 1.0;
}

/**
 * Derives balanced Indian macronutrients for a given energy target.
 * Matches EXACTLY the calculation in /api/diet/generate/route.ts.
 * Guarantees: (protein * 4) + (fats * 9) + (carbs * 4) === safeKcal with ZERO drift.
 */
function balanceMacronutrients(safeKcal: number, conditionStr: string = "", hba1cVal?: number, creatinineVal?: number) {
  const cond = conditionStr.toLowerCase();
  const isCKD = cond.includes("renal") || cond.includes("ckd") || cond.includes("kidney") || (creatinineVal !== undefined && creatinineVal >= 1.4);
  const isDiabetes = cond.includes("diabet") || (hba1cVal !== undefined && hba1cVal > 6.5);

  const targetRemainder = ((safeKcal % 4) + 4) % 4;
  let fGrams = Math.round((safeKcal * 0.23) / 9);
  while (((fGrams % 4) + 4) % 4 !== targetRemainder) {
    fGrams++;
  }
  if (fGrams > 85) fGrams -= 4;
  if (fGrams < 20) fGrams += 4;

  const rem4Kcal = (safeKcal - (fGrams * 9)) / 4;
  const pRatio = isCKD ? 0.13 : isDiabetes ? 0.18 : 0.17;
  const desiredP = Math.round((safeKcal * pRatio) / 4);
  const pGrams = Math.max(35, Math.min(desiredP, Math.round(rem4Kcal * 0.45)));
  const cGrams = rem4Kcal - pGrams;
  const fibGrams = Math.max(20, Math.min(38, Math.round(safeKcal * 0.015)));

  return {
    calories: safeKcal,
    protein: pGrams,
    fats: fGrams,
    carbs: cGrams,
    fiber: fibGrams
  };
}

/**
 * Calculates clinical schedule nutrition based on active slots, portion scales, and patient baseline target.
 */
function calculateSynchronizedScheduleNutrition(
  mealSchedule: MealSlotInput[],
  baselineTargetKcal: number,
  conditionStr: string = "",
  hba1cVal?: number,
  creatinineVal?: number
) {
  let totalFraction = 0;
  let validSlotCount = 0;

  mealSchedule.forEach((m) => {
    const name = (m.mealName || "").trim();
    const portion = (m.portion || "").trim();
    const focus = (m.focus || "").trim();

    // If slot is completely blank, its contribution is zero
    if (!name && !portion && !focus) {
      return;
    }

    validSlotCount++;
    const baseWeight = getStandardMealSlotWeight(name);
    const multiplier = getPortionMultiplier(portion, focus);
    totalFraction += (baseWeight * multiplier);
  });

  // If no valid meal slots exist, fallback to minimal baseline
  if (validSlotCount === 0 || totalFraction <= 0) {
    return {
      calories: 0,
      caloriesText: "0 kcal",
      protein: "0g",
      fats: "0g",
      carbs: "0g",
      fiber: "0g",
      summary: "Meal schedule is currently empty. Please add meal slots."
    };
  }

  // If all standard slots are present (sum of fractions is ~0.95 to 1.05 and >= 5 meals)
  // Lock to EXACTLY baselineTargetKcal (e.g. 1678 kcal)
  let effectiveKcal = baselineTargetKcal;
  if (validSlotCount >= 5 && Math.abs(totalFraction - 1.0) <= 0.08) {
    effectiveKcal = Math.round(baselineTargetKcal);
  } else {
    // Proportional scaling when meals are deleted or added
    effectiveKcal = Math.max(600, Math.round(baselineTargetKcal * totalFraction));
  }

  const macros = balanceMacronutrients(effectiveKcal, conditionStr, hba1cVal, creatinineVal);

  return {
    calories: macros.calories,
    caloriesText: `${macros.calories.toLocaleString()} kcal`,
    protein: `${macros.protein}g`,
    fats: `${macros.fats}g`,
    carbs: `${macros.carbs}g`,
    fiber: `${macros.fiber}g`,
    summary: `Clinical Indian nutrition: ${macros.calories.toLocaleString()} kcal (${macros.protein}g Protein, ${macros.fats}g Fat, ${macros.carbs}g Carbs) balanced across ${validSlotCount} active meal slots.`
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

    const effectiveCondition = condition || patient.disease || patient.condition || "General Health";
    const effectiveDietary = dietaryPreference || patient.dietaryPreference || "Vegetarian (Shakahari)";
    const hba1cNum = patient.hba1c ? Number(patient.hba1c) : undefined;
    const creatNum = patient.creatinine ? Number(patient.creatinine) : undefined;
    const bmiNum = patient.bmi ? Number(patient.bmi) : undefined;

    // Determine baseline target energy requirement (exact same as /api/diet/generate)
    let baselineTargetKcal = 1750;
    if (targetCalories && Number(targetCalories) > 0) {
      baselineTargetKcal = Number(targetCalories);
    } else if (patient.customCalories && Number(patient.customCalories) > 0) {
      baselineTargetKcal = Number(patient.customCalories);
    } else if (bmiNum && bmiNum > 28) {
      baselineTargetKcal = 1550;
    } else if (bmiNum && bmiNum < 19) {
      baselineTargetKcal = 2100;
    }

    // 1. Calculate deterministic, high-precision clinical baseline
    const clinicalBaseline = calculateSynchronizedScheduleNutrition(
      mealSchedule,
      baselineTargetKcal,
      effectiveCondition,
      hba1cNum,
      creatNum
    );

    // 2. Attempt AI recalculation using active clinical AI provider (DeepSeek / Gemini)
    let aiRecalculated: any = null;
    let aiProviderUsed = "clinical-engine";
    let aiModelUsed = "clinical-engine";

    try {
      const activeSlotsText = mealSchedule
        .filter((m) => m.mealName || m.portion || m.focus)
        .map((m, idx) => `Meal #${idx + 1} [${m.mealName || "Meal"}]: Portion: ${m.portion || "Standard"}, Details: ${m.focus || ""}`)
        .join("\n");

      const prompt = `You are an expert Indian Clinical Nutritionist and Dietitian specializing in medical therapeutic nutrition.
Analyze each meal slot currently present in the meal schedule below.
Patient: ${patient.patientName || "Patient"} (${patient.age || "Adult"}Y, ${patient.gender || "Adult"})
Condition: ${effectiveCondition} | Dietary Preference: ${effectiveDietary}
Target Daily Energy Reference: ${baselineTargetKcal} kcal

Active Meal Schedule (${mealSchedule.length} slots):
${activeSlotsText}

CRITICAL CLINICAL & LINGUISTIC RULES:
1. CLINICAL HOME-COOKED VALUES (NOT RESTAURANT): These meals are for medical therapy (diabetic / cardiac / renal management). All dishes are cooked with minimal oil (less than 1-2 tsp for the entire meal), non-greasy, unbuttered, and without refined sugars.
2. DO NOT DOUBLE-COUNT HINDI DESCRIPTIONS: The 'Details' field describes the culinary preparation and ingredients of the SAME items listed in 'Portion'. It is NOT extra food.
3. If any meal slot was DELETED or REMOVED, do NOT count it. Only calculate meals currently listed above.
4. If any meal slot is BLANK or empty, its nutritional contribution is 0.
5. If any meal slot was CREATED FROM SCRATCH or EDITED, calculate strictly according to the edited items and portion sizes.
6. CRITICAL MATHEMATICAL INTEGRITY RULE: Total calories MUST STRICTLY EQUAL (protein * 4) + (fats * 9) + (carbs * 4).
7. All macronutrients (protein, fats, carbs, fiber) MUST be whole integer numbers ending in 'g' (NEVER use decimals like 70.8g, NEVER use percentages).

Return ONLY raw valid JSON:
{
  "calories": <integer strictly equal to (protein*4 + fats*9 + carbs*4)>,
  "protein": "<integer>g",
  "fats": "<integer>g",
  "carbs": "<integer>g",
  "fiber": "<integer>g",
  "summary": "<short clinical summary>"
}`;

      const res = await generateClinicalJsonAnalysis({
        prompt,
        systemPrompt: "You are an expert Indian Clinical Nutritionist. Return ONLY a valid JSON object matching the schema."
      });

      if (res?.data) {
        const parsed = res.data;
        const parseNum = (v: any, fallback: number) => {
          if (!v) return fallback;
          const m = String(v).match(/(\d+(?:\.\d+)?)/);
          return m ? Math.round(parseFloat(m[1])) : fallback;
        };

        const pNum = parseNum(parsed.protein, parseInt(clinicalBaseline.protein, 10));
        const fNum = parseNum(parsed.fats, parseInt(clinicalBaseline.fats, 10));
        const cNum = parseNum(parsed.carbs, parseInt(clinicalBaseline.carbs, 10));
        const fibNum = parseNum(parsed.fiber, parseInt(clinicalBaseline.fiber, 10));

        // Exact mathematical identity check:
        const calculatedKcal = (pNum * 4) + (fNum * 9) + (cNum * 4);

        // Sanity check against clinical baseline: if AI is within ±20% of schedule energy
        const baseNum = clinicalBaseline.calories;
        const ratio = baseNum > 0 ? calculatedKcal / baseNum : 1;

        if (ratio >= 0.75 && ratio <= 1.25) {
          aiRecalculated = {
            calories: calculatedKcal,
            caloriesText: `${calculatedKcal.toLocaleString()} kcal`,
            protein: `${pNum}g`,
            fats: `${fNum}g`,
            carbs: `${cNum}g`,
            fiber: `${fibNum}g`,
            summary: parsed.summary || `Recalculated Indian clinical nutrition: ${calculatedKcal.toLocaleString()} kcal (${pNum}g Protein, ${fNum}g Fat, ${cNum}g Carbs) across ${mealSchedule.length} meal slots.`
          };
          aiProviderUsed = res.provider;
          aiModelUsed = res.model;
        }
      }
    } catch (aiErr: any) {
      console.warn("[diet/recalculate] AI recalculate failed, using clinical baseline:", aiErr?.message);
    }

    const finalData = aiRecalculated || clinicalBaseline;

    return NextResponse.json({
      success: true,
      data: finalData,
      provider: aiProviderUsed,
      model: aiModelUsed
    });
  } catch (error: any) {
    console.error("Recalculate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to recalculate nutrition." },
      { status: 500 }
    );
  }
}
