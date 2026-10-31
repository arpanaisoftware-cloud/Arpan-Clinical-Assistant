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

interface FoodItemResult {
  name: string;
  assumed_quantity: string;
  grams: number;
  kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

interface MealSlotResult {
  slot: string;
  time: string;
  items: FoodItemResult[];
  alternative_note: string;
  confidence: "high" | "medium" | "low";
}

/**
 * Deterministic IFCT 2017 (Indian Food Composition Tables) bottom-up food item parser.
 * Calculates nutrition item-by-item from actual cooked household measures.
 */
function parseSlotBottomUpIFCT(slot: MealSlotInput): MealSlotResult {
  const slotName = slot.mealName || "Meal";
  const slotTime = slot.time || "";
  const portion = (slot.portion || "").trim();
  const focus = (slot.focus || "").trim();
  const text = `${portion} ${focus}`.toLowerCase();

  const items: FoodItemResult[] = [];

  // If slot is empty / blank
  if (!portion && !focus) {
    return {
      slot: slotName,
      time: slotTime,
      items: [],
      alternative_note: "",
      confidence: "high"
    };
  }

  // 1. Methi Water / Warm Water / Plain Green Tea (0 kcal)
  if (text.includes("मेथी दाने का गुनगुना पानी") || text.includes("methi") || text.includes("green tea") || text.includes("ग्रीन टी")) {
    items.push({
      name: "Warm Methi Infused Water / Green Tea",
      assumed_quantity: "1 glass / cup (200 ml)",
      grams: 200,
      kcal: 4,
      protein_g: 0.2,
      fat_g: 0.1,
      carbs_g: 0.6,
      fiber_g: 0.2
    });
  }

  // 2. Soaked Almonds & Walnuts
  const almondMatch = text.match(/(\d+)\s*(?:भीगे हुए\s*)?बादाम|almond/i);
  if (almondMatch || text.includes("बादाम") || text.includes("almond")) {
    const count = almondMatch ? parseInt(almondMatch[1], 10) || 5 : 5;
    const grams = count * 1.2; // ~6g for 5 almonds
    items.push({
      name: "Soaked Peeled Almonds (भीगे बादाम)",
      assumed_quantity: `${count} almonds = ${grams}g`,
      grams,
      kcal: Math.round(grams * 5.8),
      protein_g: Number((grams * 0.21).toFixed(1)),
      fat_g: Number((grams * 0.5).toFixed(1)),
      carbs_g: Number((grams * 0.19).toFixed(1)),
      fiber_g: Number((grams * 0.11).toFixed(1))
    });
  }

  const walnutMatch = text.match(/(\d+)\s*अखरोट|walnut/i);
  if (walnutMatch || text.includes("अखरोट") || text.includes("walnut")) {
    const count = walnutMatch ? parseInt(walnutMatch[1], 10) || 1 : 1;
    const grams = count * 4; // ~4g per walnut kernel
    items.push({
      name: "Walnut Kernel (अखरोट)",
      assumed_quantity: `${count} walnut = ${grams}g`,
      grams,
      kcal: Math.round(grams * 6.5),
      protein_g: Number((grams * 0.15).toFixed(1)),
      fat_g: Number((grams * 0.65).toFixed(1)),
      carbs_g: Number((grams * 0.14).toFixed(1)),
      fiber_g: Number((grams * 0.07).toFixed(1))
    });
  }

  // 3. Paranthas (Low oil, stuffed methi-besan)
  const parathaMatch = text.match(/(\d+)\s*(?:मध्यम\s*)?परांठे|paratha/i);
  if (parathaMatch || text.includes("परांठे") || text.includes("paratha")) {
    const qty = parathaMatch ? parseInt(parathaMatch[1], 10) || 2 : 2;
    // IFCT: 1 home stuffed methi-besan parantha (35g atta/besan + 1/2 tsp oil) = ~125 kcal
    items.push({
      name: "Home Methi-Besan Stuffed Parantha (कम तेल में सिका)",
      assumed_quantity: `${qty} paranthas = ${qty * 40}g cooked flour + ${qty * 3}g oil`,
      grams: qty * 60,
      kcal: qty * 125,
      protein_g: Number((qty * 3.8).toFixed(1)),
      fat_g: Number((qty * 4.2).toFixed(1)),
      carbs_g: Number((qty * 18.0).toFixed(1)),
      fiber_g: Number((qty * 2.2).toFixed(1))
    });
  }

  // 4. Egg Whites (Boiled)
  const eggWhiteMatch = text.match(/(\d+)\s*(?:उबले\s*)?अंडे की सफेदी|egg white/i);
  if (eggWhiteMatch || text.includes("अंडे की सफेदी") || text.includes("egg white")) {
    const qty = eggWhiteMatch ? parseInt(eggWhiteMatch[1], 10) || 2 : 2;
    const grams = qty * 33; // 66g for 2 whites
    items.push({
      name: "Boiled Egg Whites (उबले अंडे की सफेदी)",
      assumed_quantity: `${qty} egg whites = ${grams}g`,
      grams,
      kcal: qty * 17,
      protein_g: Number((qty * 3.6).toFixed(1)),
      fat_g: Number((qty * 0.1).toFixed(1)),
      carbs_g: Number((qty * 0.2).toFixed(1)),
      fiber_g: 0
    });
  }

  // 5. Curd / Dahi (Fresh Low-Fat / Homemade)
  if (text.includes("दही") || text.includes("curd") || text.includes("dahi")) {
    let grams = 150;
    const gMatch = text.match(/(\d+)\s*(?:ग्राम|g|gm)/i);
    if (gMatch) grams = parseInt(gMatch[1], 10);
    // IFCT Cow Milk Curd (per 100g: 60 kcal, P: 3.2g, F: 3.0g, C: 4.8g)
    items.push({
      name: "Fresh Low-Fat Homemade Curd (ताजा लो-फैट दही)",
      assumed_quantity: `1 katori = ${grams}g`,
      grams,
      kcal: Math.round((grams / 100) * 60),
      protein_g: Number(((grams / 100) * 3.5).toFixed(1)),
      fat_g: Number(((grams / 100) * 2.8).toFixed(1)),
      carbs_g: Number(((grams / 100) * 4.8).toFixed(1)),
      fiber_g: 0
    });
  }

  // 6. Fruits (Guava / Papaya)
  if (text.includes("अमरूद") || text.includes("guava") || text.includes("पपीता") || text.includes("papaya") || text.includes("फल") || text.includes("fruit")) {
    let grams = 100;
    const gMatch = text.match(/(\d+)\s*(?:ग्राम|g|gm)/i);
    if (gMatch) grams = parseInt(gMatch[1], 10);
    // IFCT Guava / Papaya (per 100g: ~45 kcal, P: 1.0g, F: 0.3g, C: 9.5g, Fib: 3.8g)
    items.push({
      name: "Fresh Cut Guava / Papaya (कटा हुआ अमरूद/पपीता)",
      assumed_quantity: `1 small bowl = ${grams}g`,
      grams,
      kcal: Math.round((grams / 100) * 48),
      protein_g: Number(((grams / 100) * 1.2).toFixed(1)),
      fat_g: Number(((grams / 100) * 0.3).toFixed(1)),
      carbs_g: Number(((grams / 100) * 9.8).toFixed(1)),
      fiber_g: Number(((grams / 100) * 4.0).toFixed(1))
    });
  }

  // 7. Phulkas / Rotis (Dry, no ghee)
  const phulkaMatch = text.match(/(\d+)\s*(?:पतले\s*|मध्यम\s*)?(?:फुल्के|रोटी|phulka|roti|chapati)/i);
  if (phulkaMatch && !parathaMatch && !text.includes("मिस्सी रोटी") && !text.includes("missi")) {
    const qty = parseInt(phulkaMatch[1], 10) || 2;
    // IFCT: 1 medium phulka (30g whole wheat atta dry) = 85 kcal, P: 3.0g, F: 0.5g, C: 17.5g, Fib: 2.8g
    items.push({
      name: "Whole Wheat Phulkas (बिना घी के पतले फुल्के)",
      assumed_quantity: `${qty} phulkas = ${qty * 30}g whole wheat atta`,
      grams: qty * 45,
      kcal: qty * 85,
      protein_g: Number((qty * 3.0).toFixed(1)),
      fat_g: Number((qty * 0.5).toFixed(1)),
      carbs_g: Number((qty * 17.5).toFixed(1)),
      fiber_g: Number((qty * 2.8).toFixed(1))
    });
  }

  // 8. Missi Roti (Chana + Wheat Flour)
  const missiMatch = text.match(/(\d+)\s*(?:पतली\s*)?मिस्सी रोटी|missi\s*roti/i);
  if (missiMatch || text.includes("मिस्सी रोटी") || text.includes("missi")) {
    const qty = missiMatch ? parseInt(missiMatch[1], 10) || 2 : 2;
    // IFCT: 1 missi roti (20g wheat + 15g besan) = 110 kcal, P: 4.5g, F: 1.5g, C: 18.0g, Fib: 3.0g
    items.push({
      name: "Missi Roti (चने और गेहूं के आटे की नर्म रोटी)",
      assumed_quantity: `${qty} missi rotis = ${qty * 35}g flour`,
      grams: qty * 50,
      kcal: qty * 110,
      protein_g: Number((qty * 4.5).toFixed(1)),
      fat_g: Number((qty * 1.5).toFixed(1)),
      carbs_g: Number((qty * 18.0).toFixed(1)),
      fiber_g: Number((qty * 3.0).toFixed(1))
    });
  }

  // 9. Brown Rice
  if (text.includes("ब्राउन राइस") || text.includes("brown rice") || text.includes("चावल") || text.includes("rice")) {
    const isHalf = text.includes("1/2") || text.includes("half") || text.includes("आधा");
    const grams = isHalf ? 75 : 150;
    // IFCT Cooked Brown Rice (per 100g: 111 kcal, P: 2.6g, F: 0.9g, C: 23g, Fib: 1.8g)
    items.push({
      name: "Cooked Brown Rice (पका हुआ ब्राउन राइस)",
      assumed_quantity: `${isHalf ? "1/2" : "1"} katori = ${grams}g cooked`,
      grams,
      kcal: Math.round((grams / 100) * 111),
      protein_g: Number(((grams / 100) * 2.6).toFixed(1)),
      fat_g: Number(((grams / 100) * 0.9).toFixed(1)),
      carbs_g: Number(((grams / 100) * 23.0).toFixed(1)),
      fiber_g: Number(((grams / 100) * 1.8).toFixed(1))
    });
  }

  // 10. Fish / Chicken Curry (Home-cooked, low oil)
  if (text.includes("फिश") || text.includes("चिकन") || text.includes("fish") || text.includes("chicken")) {
    const grams = 150;
    // IFCT: 100g lean chicken/fish cooked with 1 tsp oil + tomato gravy = ~160 kcal, P: 18g, F: 6.5g, C: 5g
    items.push({
      name: "Light Home Fish / Chicken Curry (कम तेल में बनी फिश/चिकन करी)",
      assumed_quantity: `1 katori (150g) with 1 tsp oil`,
      grams,
      kcal: 165,
      protein_g: 18.5,
      fat_g: 6.8,
      carbs_g: 4.8,
      fiber_g: 1.2
    });
  }

  // 11. Moong Dal / Lauki Chana Dal
  if (text.includes("मूंग दाल") || text.includes("चना दाल") || text.includes("दाल") || text.includes("dal")) {
    let grams = 150;
    if (text.includes("बड़ी कटोरी") || text.includes("200")) grams = 200;
    // IFCT: Cooked Moong / Lauki Chana Dal (per 150g cooked: 30g raw pulse + 1 tsp oil = ~135 kcal)
    items.push({
      name: "Cooked Moong / Lauki-Chana Dal (हल्की पकी दाल)",
      assumed_quantity: `${grams}g cooked dal with 1 tsp cooking oil`,
      grams,
      kcal: Math.round((grams / 150) * 135),
      protein_g: Number(((grams / 150) * 7.5).toFixed(1)),
      fat_g: Number(((grams / 150) * 4.8).toFixed(1)),
      carbs_g: Number(((grams / 150) * 16.0).toFixed(1)),
      fiber_g: Number(((grams / 150) * 4.2).toFixed(1))
    });
  }

  // 12. Roasted Chana & Makhana Chaat
  if (text.includes("चना") && text.includes("मखाना") || text.includes("makhana") || text.includes("chana")) {
    let grams = 40;
    const gMatch = text.match(/(\d+)\s*(?:ग्राम|g|gm)/i);
    if (gMatch) grams = parseInt(gMatch[1], 10);
    // IFCT: 25g roasted chana + 15g roasted makhana = 145 kcal, P: 6.8g, F: 2.2g, C: 24.5g, Fib: 4.5g
    items.push({
      name: "Roasted Chana & Makhana Chaat (भुना चना और मखाना चाट)",
      assumed_quantity: `1 bowl = ${grams}g`,
      grams,
      kcal: Math.round((grams / 40) * 148),
      protein_g: Number(((grams / 40) * 6.8).toFixed(1)),
      fat_g: Number(((grams / 40) * 2.2).toFixed(1)),
      carbs_g: Number(((grams / 40) * 24.5).toFixed(1)),
      fiber_g: Number(((grams / 40) * 4.5).toFixed(1))
    });
  }

  // 13. Spiced Chaas / Buttermilk
  if (text.includes("छाछ") || text.includes("chaas") || text.includes("buttermilk")) {
    let ml = 200;
    const mlMatch = text.match(/(\d+)\s*(?:मिली|ml)/i);
    if (mlMatch) ml = parseInt(mlMatch[1], 10);
    // IFCT Diluted Spiced Chaas with Jeera (per 200ml: ~35 kcal, P: 2.0g, F: 1.0g, C: 4.2g)
    items.push({
      name: "Thin Spiced Jeera Chaas (पतली जीरा छाछ)",
      assumed_quantity: `1 glass = ${ml} ml`,
      grams: ml,
      kcal: Math.round((ml / 200) * 35),
      protein_g: Number(((ml / 200) * 2.0).toFixed(1)),
      fat_g: Number(((ml / 200) * 1.0).toFixed(1)),
      carbs_g: Number(((ml / 200) * 4.2).toFixed(1)),
      fiber_g: 0.2
    });
  }

  // 14. Fresh Salad (Cucumber, Tomato, Kakdi)
  if (text.includes("सलाद") || text.includes("salad") || text.includes("ककड़ी") || text.includes("खीरा")) {
    items.push({
      name: "Fresh Cucumber & Tomato Salad with Lemon (खीरा-टमाटर सलाद)",
      assumed_quantity: "1 small plate = 100g",
      grams: 100,
      kcal: 20,
      protein_g: 0.8,
      fat_g: 0.2,
      carbs_g: 3.8,
      fiber_g: 1.5
    });
  }

  return {
    slot: slotName,
    time: slotTime,
    items,
    alternative_note: text.includes("फिश") && text.includes("चिकन") ? "Calculated for Fish Curry (first option); lean chicken breast difference is +10 kcal and +2g protein." : "",
    confidence: items.length > 0 ? "high" : "medium"
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

    const patientName = patient.patientName || "Patient";
    const age = patient.age || "45";
    const gender = patient.gender || "Adult";
    const effectiveCondition = condition || patient.disease || patient.condition || "General Health";
    const effectiveDietary = dietaryPreference || patient.dietaryPreference || "Vegetarian (Shakahari)";

    const slotsText = mealSchedule
      .filter((m) => m.mealName || m.portion || m.focus)
      .map((m, idx) => `Slot #${idx + 1} [${m.mealName || "Meal"}] (Time: ${m.time || "Flexible"}): Portion: ${m.portion || "Standard"}, Recommended food: ${m.focus || ""}`)
      .join("\n");

    const prompt = `You are an expert Indian clinical nutritionist. You calculate nutrition BOTTOM-UP from the actual foods listed, using IFCT 2017 (Indian Food Composition Tables) values first, then USDA only if an item is missing. You never use a calorie budget or percentage split to decide the numbers. Return ONLY valid JSON, with no markdown and no commentary.

Patient: ${patientName} (${age}Y, ${gender}) | Condition: ${effectiveCondition} | Diet: ${effectiveDietary}

Meal schedule (each slot is one meal; calculate each separately):
${slotsText}

METHOD (follow in order for every slot):
1. Break the slot into individual food items. Use the "Portion" and "Recommended food" text together. They describe the SAME food, so never count an item twice.
2. Convert each household measure to grams of COOKED food:
   - 1 katori = 150 ml (about 150 g for dal/sabzi/curry)
   - 1 phulka (medium) = 30 g atta; 1 small phulka = 25 g
   - 1 medium chilla = 1 chilla made from about 25 g batter flour; use the ingredients named
   - 1 glass = 200 ml, 1 cup = 150 ml
   - If the portion is vague, assume a standard Indian home serving and state it.
3. Look up per-100 g values and scale to the grams. Count cooking oil/ghee/sugar explicitly. If the text says "1 tsp oil", count 5 g oil (45 kcal). If no oil is stated, assume 1 tsp per katori of cooked sabzi/dal/curry.
4. Teas, milk and drinks: count the milk type and sugar stated (e.g. skimmed milk, "sugar-free"). Unsweetened green tea = 0.
5. Where the food has alternatives ("apple OR guava", "chicken OR fish"), calculate the FIRST option and note the alternative's difference in "alternative_note".
6. Slots that are empty or deleted contribute 0. Do not invent food.
7. Use realistic home-cooked values, not restaurant values.

NUMBER RULES:
- For each item return grams, kcal, protein_g, fat_g, carbs_g, fiber_g as numbers (one decimal allowed).
- Do NOT force kcal to equal 4P + 9F + 4C. Report the real value. (Fiber and rounding cause small differences.)
- Do NOT scale anything to match a daily target. The target is for comparison only.
- Do not compute daily totals. They will be summed in code.

Return JSON in exactly this shape:
{
  "meals": [
    {
      "slot": "<meal slot name as given>",
      "time": "<time as given>",
      "items": [
        {
          "name": "<food item>",
          "assumed_quantity": "<e.g. 2 phulkas = 60 g atta>",
          "grams": <number>,
          "kcal": <number>,
          "protein_g": <number>,
          "fat_g": <number>,
          "carbs_g": <number>,
          "fiber_g": <number>
        }
      ],
      "alternative_note": "<difference if an OR option is used, else empty string>",
      "confidence": "high" | "medium" | "low"
    }
  ],
  "assumptions": ["<each key assumption, e.g. oil amount, katori size>"]
}`;

    let parsedAiMeals: any = null;
    let aiProviderUsed = "clinical-ifct-engine";
    let aiModelUsed = "ifct-2017-engine";

    try {
      const res = await generateClinicalJsonAnalysis({
        prompt,
        systemPrompt: "You are an expert Indian Clinical Nutritionist calculating nutrition bottom-up using IFCT 2017 tables. Return only valid JSON."
      });

      if (res?.data?.meals && Array.isArray(res.data.meals) && res.data.meals.length > 0) {
        parsedAiMeals = res.data;
        aiProviderUsed = res.provider;
        aiModelUsed = res.model;
      }
    } catch (aiErr: any) {
      console.warn("[diet/recalculate] AI bottom-up IFCT call failed, using IFCT parser fallback:", aiErr?.message);
    }

    // If AI generation succeeded, sum all items across meals in code:
    if (parsedAiMeals?.meals && Array.isArray(parsedAiMeals.meals)) {
      let sumKcal = 0;
      let sumP = 0;
      let sumF = 0;
      let sumC = 0;
      let sumFib = 0;

      for (const meal of parsedAiMeals.meals) {
        if (Array.isArray(meal.items)) {
          for (const item of meal.items) {
            sumKcal += Number(item.kcal) || 0;
            sumP += Number(item.protein_g) || 0;
            sumF += Number(item.fat_g) || 0;
            sumC += Number(item.carbs_g) || 0;
            sumFib += Number(item.fiber_g) || 0;
          }
        }
      }

      const finalKcal = Math.round(sumKcal);
      const finalP = Math.round(sumP);
      const finalF = Math.round(sumF);
      const finalC = Math.round(sumC);
      const finalFib = Math.round(sumFib);

      return NextResponse.json({
        success: true,
        provider: aiProviderUsed,
        model: aiModelUsed,
        data: {
          calories: finalKcal,
          caloriesText: `${finalKcal.toLocaleString()} kcal`,
          protein: `${finalP}g`,
          fats: `${finalF}g`,
          carbs: `${finalC}g`,
          fiber: `${finalFib}g`,
          summary: `IFCT 2017 bottom-up clinical nutrition: ${finalKcal.toLocaleString()} kcal (${finalP}g Protein, ${finalF}g Fat, ${finalC}g Carbs, ${finalFib}g Fiber) across ${parsedAiMeals.meals.length} meal slots.`,
          meals: parsedAiMeals.meals,
          assumptions: parsedAiMeals.assumptions || []
        }
      });
    }

    // Deterministic Fallback: compute bottom-up IFCT for each slot
    const fallbackMeals: MealSlotResult[] = mealSchedule.map(parseSlotBottomUpIFCT);
    let fallbackKcal = 0;
    let fallbackP = 0;
    let fallbackF = 0;
    let fallbackC = 0;
    let fallbackFib = 0;

    for (const meal of fallbackMeals) {
      for (const it of meal.items) {
        fallbackKcal += it.kcal;
        fallbackP += it.protein_g;
        fallbackF += it.fat_g;
        fallbackC += it.carbs_g;
        fallbackFib += it.fiber_g;
      }
    }

    const roundKcal = Math.round(fallbackKcal);
    const roundP = Math.round(fallbackP);
    const roundF = Math.round(fallbackF);
    const roundC = Math.round(fallbackC);
    const roundFib = Math.round(fallbackFib);

    return NextResponse.json({
      success: true,
      provider: "ifct-2017-engine",
      model: "clinical-parser",
      data: {
        calories: roundKcal,
        caloriesText: `${roundKcal.toLocaleString()} kcal`,
        protein: `${roundP}g`,
        fats: `${roundF}g`,
        carbs: `${roundC}g`,
        fiber: `${roundFib}g`,
        summary: `IFCT 2017 bottom-up clinical nutrition: ${roundKcal.toLocaleString()} kcal (${roundP}g Protein, ${roundF}g Fat, ${roundC}g Carbs, ${roundFib}g Fiber) across ${fallbackMeals.length} meal slots.`,
        meals: fallbackMeals,
        assumptions: [
          "Standard household measures: 1 katori = 150ml, 1 glass = 200ml, 1 phulka = 30g atta.",
          "Minimal therapeutic cooking oil: 1 tsp oil (5g, 45 kcal) assumed per katori cooked sabzi/dal/curry.",
          "Home-cooked diabetic-safe preparation using IFCT 2017 values."
        ]
      }
    });
  } catch (error: any) {
    console.error("Recalculate error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to recalculate nutrition." },
      { status: 500 }
    );
  }
}
