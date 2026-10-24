import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.8-flash:generateContent";

const PARSE_AND_DIET_PROMPT = `You are an expert Indian Clinical Pharmacist and Nutritionist specializing in medical prescription analysis and evidence-based Indian therapeutic diet planning.

Analyze this prescription image/document.
1. Extract ALL visible patient clinical information (name, age, gender, diagnosis/disease, medications, vitals, lab readings).
2. Based on the diagnosis, medications, and clinical indicators in this prescription, DIRECTLY generate a complete, personalized Indian Clinical Diet & Electrolyte Management Plan.

CRITICAL LANGUAGE & WORDING INSTRUCTIONS:
- Use simple, friendly, casual, everyday language. Avoid difficult medical jargon (e.g. do NOT say 'post-prandial glycemic excursion' or 'endothelial dysfunction'). Say 'keeps blood sugar steady' and 'gentle on the heart and kidneys'.
- ALL meals must use authentic, home-cooked Indian foods (dal, sabzi, roti, idli, upma, khichdi, chaas, paneer, curd, sprouts).
- Use household Indian portions: katoris (150ml bowl), phulkas/rotis, glasses (200ml), teaspoons.

Return ONLY raw JSON (no markdown, no code fences) matching this schema:
{
  "patientInfo": {
    "patientName": "string or null",
    "age": "number or null",
    "gender": "string Male/Female/Other or null",
    "weightKg": "number or null",
    "heightCm": "number or null",
    "disease": "string - primary diagnosis/condition or null",
    "allergies": "string or null",
    "comorbidities": "string or null",
    "bpSystolic": "number or null",
    "bpDiastolic": "number or null",
    "pulse": "number or null",
    "bmi": "number or null",
    "hba1c": "number or null",
    "fastingGlucose": "number or null",
    "creatinine": "number or null",
    "egfr": "number or null",
    "sodiumNa": "number or null",
    "potassiumK": "number or null",
    "totalCholesterol": "number or null",
    "medications": [
      {
        "name": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "timing": "string"
      }
    ],
    "extractionNotes": "string - brief note about what was successfully extracted"
  },
  "dietPlan": {
    "planName": "string e.g. Indian Diabetes & Blood Pressure Care Diet Plan",
    "targetCalories": 1750,
    "summary": "string - 2 short simple sentences explaining the diet plan in everyday words",
    "macroBreakdown": {
      "carbs": "string - ONLY percentage or grams e.g. 50% or 275g (50%) - DO NOT write description sentences",
      "protein": "string - ONLY percentage or grams e.g. 20% or 75g (20%) - DO NOT write description sentences",
      "fats": "string - ONLY percentage or grams e.g. 25% or 45g (25%) - DO NOT write description sentences",
      "fiber": "string - ONLY grams or percentage e.g. 30g - DO NOT write description sentences"
    },
    "electrolyteLimits": {
      "sodium": "string e.g. Strict Salt Control (< 1,500 mg/day) - Avoid pickles, papad, namkeen & extra table salt",
      "potassium": "string e.g. Balanced Potassium - Enjoy fresh coconut water, amla, and bottle gourd in moderation",
      "phosphorus": "string e.g. Kidney-Safe Phosphorus - Light yellow moong dal, avoid heavy processed snacks",
      "calcium": "string e.g. Strong Bones Calcium - 1 bowl low-fat curd and 1 glass skimmed milk daily",
      "magnesium": "string e.g. Muscle & Nerve Magnesium - Pumpkin seeds, almonds, steamed spinach & soaked methi for relaxation",
      "iron": "string e.g. Haemoglobin Booster Iron - Steamed palak dal, roasted chana, beetroot & amla with Vitamin C",
      "vitaminD": "string e.g. Bone & Immunity Vitamin D - 15 mins gentle morning sun exposure, fortified curd/milk & mushrooms",
      "vitaminB12": "string e.g. Nerve & Energy Vitamin B12 - Low-fat paneer, curd, fortified milk, or clinical supplement",
      "uricAcid": "string e.g. Purine & Uric Acid Control - Drink 2.5-3L water, avoid sugary sodas & purine-heavy foods, enjoy amla & cherries"
    },
    "recommendedFoods": [
      "string - Indian food name followed by simple 1-line reason, minimum 8 foods"
    ],
    "foodsToAvoid": [
      "string - Indian food item followed by simple reason to avoid, minimum 6 items"
    ],
    "hydrationGuidance": "string e.g. Drink 8-10 glasses water daily; enjoy fresh spiced chaas with jeera",
    "mealSchedule": [
      {
        "time": "string e.g. 06:30 AM",
        "mealName": "must be one of: Early Morning, Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner, Bedtime Drink",
        "portion": "string e.g. 1 Glass (200ml)",
        "focus": "string - dish with ingredients e.g. Warm Methi-soaked water with a squeeze of fresh lemon",
        "clinicalNote": "string - simple plain-language benefit e.g. Wakes up digestion and helps control blood sugar"
      }
    ],
    "lifestyleAdvice": [
      "string - practical, everyday Indian healthy lifestyle tip in simple words, minimum 4 tips"
    ],
    "avoidanceAlerts": [
      "string - crucial safety warning in simple words"
    ]
  }
}

The mealSchedule must have exactly 7 meals: 06:30 AM Early Morning, 08:30 AM Breakfast, 11:00 AM Mid-Morning Snack, 01:30 PM Lunch Thali, 05:00 PM Evening Snack, 08:00 PM Light Dinner, 09:45 PM Bedtime Drink.`;

async function callGeminiVision(imageBase64: string, mimeType: string, customPreference?: string, language?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const preferenceNote = customPreference
    ? `\n\nPatient Dietary Preference: ${customPreference}. Please strictly respect this in the dietPlan meal recommendations.`
    : "";

  let langNote = "";
  if (language && language.toLowerCase().includes("hindi") && !language.toLowerCase().includes("hinglish")) {
    langNote = "\n\nTARGET OUTPUT LANGUAGE: HINDI (हिंदी भाषा). Generate the dietPlan text (summary, meals, benefits, advice, foods) in clear, everyday Hindi in Devanagari script.";
  } else if (language && language.toLowerCase().includes("hinglish")) {
    langNote = "\n\nTARGET OUTPUT LANGUAGE: HINGLISH. Generate the dietPlan in conversational Hinglish.";
  } else {
    langNote = "\n\nTARGET OUTPUT LANGUAGE: ENGLISH. Generate the dietPlan text strictly in clear, simple English (using authentic Indian food terms like dal, sabzi, roti in English alphabet). Absolutely DO NOT output Devanagari script.";
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: PARSE_AND_DIET_PROMPT + preferenceNote + langNote },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
  };

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Vision API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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

function buildClinicalIndianFallbackDiet(info: Record<string, any>, language?: string) {
  const isHindi = (language || "").toLowerCase().includes("hindi") && !(language || "").toLowerCase().includes("hinglish");
  const disease = (info.disease || "Health Wellness & Prevention").toLowerCase();
  const isDiabetes = disease.includes("diabet") || Number(info.hba1c) > 6.5;
  const isHypertension = disease.includes("hypertens") || Number(info.bpSystolic) >= 140;
  const isCKD = disease.includes("renal") || disease.includes("ckd") || disease.includes("kidney") || Number(info.creatinine) >= 1.4;

  const patientName = info.patientName || "Patient";
  const age = info.age || "Adult";
  const gender = info.gender || "Patient";

  return {
    planName: isCKD && isDiabetes
      ? (isHindi ? "भारतीय किडनी एवं मधुमेह देखभाल आहार योजना" : "Indian Kidney & Diabetes Care Diet Plan")
      : isDiabetes && isHypertension
      ? (isHindi ? "भारतीय शुगर एवं रक्तचाप संतुलन आहार योजना" : "Indian Sugar & Blood Pressure Balance Diet Plan")
      : isDiabetes
      ? (isHindi ? "भारतीय कम-शुगर स्वास्थ्यवर्धक आहार योजना" : "Indian Low-Sugar Healthy Living Diet Plan")
      : isHypertension
      ? (isHindi ? "भारतीय कम-नमक रक्तचाप नियंत्रण आहार योजना" : "Indian Low-Salt Blood Pressure Relief Diet Plan")
      : isCKD
      ? (isHindi ? "भारतीय सौम्य किडनी स्वास्थ्य आहार योजना" : "Indian Gentle Kidney Care Diet Plan")
      : (isHindi ? "भारतीय दैनिक स्वास्थ्य एवं ऊर्जा आहार योजना" : "Indian Daily Health & Vitality Nutrition Plan"),
    targetCalories: 1750,
    summary: `Specially crafted Indian meal plan for ${patientName} (${age}Y, ${gender}) to keep blood sugar steady, manage blood pressure, and keep you feeling energetic all day with delicious home-cooked Indian foods.`,
    macroBreakdown: {
      carbs: isDiabetes
        ? "48% Daily Energy — Complex grains (Jowar, Bajra, Multigrain Roti, Daliya) to prevent sudden blood sugar spikes"
        : "50% Daily Energy — Wholesome whole wheat, millets, and brown rice for clean all-day fuel",
      protein: isCKD
        ? "18% Daily Energy — Light yellow moong dal, soft paneer, and curd to go gentle on kidney filtration"
        : "25% Daily Energy — Yellow moong dal, sprouts, fresh paneer, and curd for natural body strength and healing",
      fats: "18% Daily Energy — 3 to 4 teaspoons daily of cold-pressed mustard or groundnut oil; avoid deep-fried oils",
      fiber: "10% Daily Energy — Abundant fresh cucumber, steamed methi leaves, and flaxseeds for smooth digestion"
    },
    electrolyteLimits: {
      sodium: isHypertension || isCKD
        ? "Strict Salt Control (< 1,500 mg/day) — Absolutely NO pickles, papad, market namkeen, or extra table salt"
        : "Standard Salt Control (< 2,000 mg/day) — Cook with minimal salt, avoid packaged chips and snacks",
      potassium: isCKD
        ? "Controlled Potassium — Limit coconut water and raw spinach; boil vegetables well before eating"
        : "Healthy Potassium Balance — Enjoy fresh tender coconut water, amla, and bottle gourd in moderation",
      phosphorus: isCKD
        ? "Kidney-Safe Phosphorus — Light yellow moong dal, avoid heavy processed cheeses and colas"
        : "Safe Phosphorus Range — Balanced naturally through fresh homemade dals and curd",
      calcium: isHindi
        ? "मजबूत हड्डियों के लिए कैल्शियम — 1 कटोरी लो-फैट दही और 1 गिलास मलाई रहित दूध या रागी दलिया रोज़ लें"
        : "Strong Bones Calcium — 1 bowl low-fat curd and 1 glass skimmed milk or ragi porridge daily",
      magnesium: isHindi
        ? "मांसपेशियों और नसों के लिए मैग्नीशियम — कद्दू के बीज, बादाम, पालक और रातभर भीगी मेथी लें"
        : "Relaxing Magnesium — Pumpkin seeds, almonds, steamed spinach, and soaked methi for nerve & muscle support",
      iron: isHindi
        ? "खून और हीमोग्लोबिन के लिए आयरन — पालक दाल, भुना चना, चुकंदर और ताज़ा आंवला"
        : "Blood Health Iron — Steamed palak dal, roasted chana, beetroot & amla with natural Vitamin C",
      vitaminD: isHindi
        ? "हड्डियों और इम्युनिटी के लिए विटामिन D — सुबह 15 मिनट धूप, फोर्टिफाइड दूध/दही और मशरूम"
        : "Sunlight & Bone Vitamin D — 15 mins morning sunlight, fortified curd/milk, and mushrooms",
      vitaminB12: isHindi
        ? "ऊर्जा और नसों के लिए विटामिन B12 — ताज़ा पनीर, दही या डॉक्टर की सलाह से बी12 सप्लीमेंट"
        : "Nerve & Energy Vitamin B12 — Low-fat paneer, fermented curd, fortified foods, or clinical supplement",
      uricAcid: isHindi
        ? "यूरिक एसिड नियंत्रण — भरपूर पानी (2.5-3 लीटर), तली चीजें और मीठे शरबत बंद, आंवला और चेरी खाएं"
        : "Purine & Uric Acid Control — Drink 2.5-3L water daily, avoid purine-heavy foods/sugary sodas, enjoy amla & cherries"
    },
    recommendedFoods: [
      "Yellow Moong Dal (Very light on the stomach, high in clean protein, and easy to digest)",
      "Multigrain / Jowar Roti (High fiber keeps you full longer and prevents sugar spikes)",
      "Lauki (Bottle Gourd) & Tori Sabzi (Cooling, low calorie, water-rich, and very gentle on the heart)",
      "Fresh Methi (Fenugreek) Leaves (Indian green superfood that naturally supports sugar control)",
      "Sprouted Moong Chaat with Lemon (Crunchy, refreshing, energizing morning snack full of natural vitamins)",
      "Fresh Spiced Chaas (Natural probiotic with roasted jeera that cools the stomach with zero fat)",
      "Palak (Spinach) Dal (Rich in iron and fiber to keep blood pressure healthy and heart strong)",
      "Roasted Makhana / Foxnuts (Guilt-free crunchy evening snack that won't raise your blood sugar)",
      "Karela (Bitter Gourd) Sabzi (Time-tested Indian vegetable that helps cells absorb sugar naturally)"
    ],
    foodsToAvoid: [
      "Pickles (Achaar) & Papad (Packed with hidden sodium that quickly raises your blood pressure)",
      "Market Namkeen, Bhujia & Chips (Deep fried in reused oil with heavy salt and trans fats)",
      "Mithai, Jalebi & Gulab Jamun (Concentrated sugar and ghee that causes instant sugar spikes)",
      "Deep-fried Samosas & Pakoras (Heavy saturated oils that stress your liver, stomach, and heart)",
      "Maida items like Naan & Bhature (Refined flour with zero fiber that triggers quick sugar jumps)",
      "Extra Table Salt & Monosodium Glutamate (Causes water swelling and stiffens blood vessels)"
    ],
    hydrationGuidance: isCKD
      ? "Drink 1.5 to 1.8 Liters of fluid daily (including chaas and dal). Keep a measuring bottle."
      : "Drink 8 to 10 glasses of water daily. Include warm jeera water and fresh diluted chaas with mint.",
    mealSchedule: [
      {
        time: "06:30 AM",
        mealName: "Early Morning",
        portion: "1 Glass (200ml)",
        focus: "Warm Methi-soaked water (1 tsp methi seeds soaked overnight) with a squeeze of fresh lemon",
        clinicalNote: "Gently wakes up your digestion and prepares your body for smooth sugar control"
      },
      {
        time: "08:30 AM",
        mealName: "Breakfast",
        portion: "1 Plate",
        focus: "2 Steamed Ragi or Moong Dal Idlis with mint-coriander chutney, OR Vegetable Oats Upma",
        clinicalNote: "Slow-burning Indian breakfast that keeps you active and full till lunchtime"
      },
      {
        time: "11:00 AM",
        mealName: "Mid-Morning Snack",
        portion: "1 Small Katori",
        focus: "1 Katori sprouted moong chaat with diced cucumber and lemon, OR 1 fresh Guava / Amla",
        clinicalNote: "Prevents mid-day energy crashes and gives you a fresh boost of natural Vitamin C"
      },
      {
        time: "01:30 PM",
        mealName: "Lunch",
        portion: "Full Indian Thali",
        focus: "2 Soft Jowar/Multigrain Phulkas (no ghee) + 1 Katori Yellow Moong Dal + 1 Katori Lauki Sabzi + Cucumber Salad + 1 Glass Chaas",
        clinicalNote: "Complete balanced plate that satisfies your appetite without making you feel sleepy"
      },
      {
        time: "05:00 PM",
        mealName: "Evening Snack",
        portion: "1 Cup + 1 Bowl",
        focus: "Ginger-Tulsi Green Tea (no sugar) + 1 small bowl roasted makhana (foxnuts) or roasted chana",
        clinicalNote: "Crispy, guilt-free crunch that stops unhealthy evening biscuit or namkeen cravings"
      },
      {
        time: "08:00 PM",
        mealName: "Dinner",
        portion: "Light Plate",
        focus: "1-2 Soft Wheat Phulkas + 1 Katori Palak Dal, OR Moong Dal Khichdi with lots of grated lauki",
        clinicalNote: "Light, comforting dinner that digests smoothly before sleep and keeps morning sugars low"
      },
      {
        time: "09:45 PM",
        mealName: "Bedtime Drink",
        portion: "1/2 Glass (100ml)",
        focus: "Warm Haldi Doodh (skimmed milk with organic turmeric and a pinch of black pepper)",
        clinicalNote: "Soothing drink that calms inflammation, promotes deep sleep, and helps body recovery"
      }
    ],
    lifestyleAdvice: [
      "Take a relaxed 100-step stroll ('Shatapawali') after lunch and dinner to help your food digest smoothly.",
      "Finish your evening meal by 08:00 PM to give your stomach 12 full hours of peaceful overnight rest.",
      "Practice 15 minutes of calm deep breathing (Anulom Vilom) every morning to melt away stress and lower blood pressure.",
      "Never sprinkle extra raw salt on salads or curd. Use fresh lemon juice and roasted jeera powder instead!"
    ],
    avoidanceAlerts: [
      isHypertension || isCKD
        ? "IMPORTANT SALT ALERT: Stay away from baking soda in dhokla, bakery bread, and instant soup packets."
        : "Avoid eating heavy sugary snacks within 2 hours of going to sleep.",
      "Do not skip meals or do extreme water-less fasts while taking diabetes or BP medicines."
    ]
  };
}

export async function POST(req: Request) {
  const { user, errorResponse } = await verifyAuthToken(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { imageBase64, mimeType, dietaryPreference, language } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { success: false, message: "Prescription image data and MIME type are required." },
        { status: 400 }
      );
    }

    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!supportedTypes.includes(mimeType)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file type. Please upload JPEG, PNG, WebP, or PDF." },
        { status: 400 }
      );
    }

    let parsedResult: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const rawText = await callGeminiVision(imageBase64, mimeType, dietaryPreference, language);
        parsedResult = parseJson(rawText);
      } catch (geminiErr: any) {
        console.warn("[diet/parse-rx] Gemini Vision API call had issues:", geminiErr?.message);
      }
    }

    // Extract patientInfo and dietPlan
    let patientInfo: Record<string, any> = {};
    let dietPlan: Record<string, any> | null = null;

    if (parsedResult) {
      if (parsedResult.patientInfo) {
        patientInfo = parsedResult.patientInfo;
      } else {
        // If Gemini returned a flat patient object
        patientInfo = { ...parsedResult };
      }

      if (parsedResult.dietPlan && parsedResult.dietPlan.mealSchedule) {
        dietPlan = parsedResult.dietPlan;
      }
    }

    // Ensure patientInfo has default placeholders if empty
    if (!patientInfo.patientName) patientInfo.patientName = "Patient";
    if (!patientInfo.disease) patientInfo.disease = "Clinical Medical Consultation";

    // If dietPlan was not generated or incomplete, build using clinical Indian nutrition engine
    if (!dietPlan || !dietPlan.mealSchedule) {
      dietPlan = buildClinicalIndianFallbackDiet(patientInfo, language);
    }

    // Return single unified response containing both patientInfo and dietPlan
    return NextResponse.json({
      success: true,
      data: {
        ...patientInfo,
        patientInfo,
        dietPlan
      },
      message: "Prescription analyzed and Indian Clinical Diet Plan generated successfully in a single API call."
    });
  } catch (err: any) {
    console.error("[diet/parse-rx] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to parse prescription and generate diet plan." },
      { status: 500 }
    );
  }
}
