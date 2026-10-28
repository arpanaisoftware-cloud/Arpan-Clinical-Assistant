import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.8-flash:generateContent";

function buildDietPrompt(input: Record<string, any>): string {
  const langStr = String(input.language || "Hindi").toLowerCase();
  const isHindi = langStr.includes("hindi") && !langStr.includes("hinglish");
  const isHinglish = langStr.includes("hinglish");
  const isEnglish = !isHindi && !isHinglish;

  const targetCalorieInstruction = input.customCalories && Number(input.customCalories) > 0
    ? `\n- DIETITIAN-SPECIFIED CALORIE TARGET: The dietitian has explicitly set a strict target of EXACTLY ${Number(input.customCalories)} kcal/day. You MUST output "targetCalories": ${Number(input.customCalories)} in the JSON, and tailor all meal portions and macro distribution to strictly match this ${Number(input.customCalories)} kcal/day daily energy requirement.`
    : "";

  return `You are an expert Indian Clinical Nutritionist and Dietitian specializing in evidence-based, culturally appropriate Indian diet therapy.

PATIENT PROFILE:
- Name: ${input.patientName}
- Age: ${input.age} years | Gender: ${input.gender}
- Weight: ${input.weightKg ?? "Not provided"} kg | Height: ${input.heightCm ?? "Not provided"} cm
- BMI: ${input.bmi ?? "Not provided"} kg/m2
- Clinical Condition / Diagnosis: ${input.disease}
- Dietary Preference: ${input.dietaryPreference ?? "Vegetarian (Shakahari)"}
- Output Language: ${input.language ?? "English"}
- Allergies: ${input.allergies ?? "None reported"}
- Comorbidities: ${input.comorbidities ?? "None"}
- HbA1c: ${input.hba1c ?? "NA"} | FBS: ${input.fastingGlucose ?? "NA"} mg/dL | Creatinine: ${input.creatinine ?? "NA"} | eGFR: ${input.egfr ?? "NA"}
- Na: ${input.sodiumNa ?? "NA"} mEq/L | K: ${input.potassiumK ?? "NA"} mEq/L | Cholesterol: ${input.totalCholesterol ?? "NA"} mg/dL
- BP: ${input.bpSystolic ?? "NA"}/${input.bpDiastolic ?? "NA"} mmHg${targetCalorieInstruction}

CRITICAL LANGUAGE & WORDING INSTRUCTIONS:
1. OUTPUT LANGUAGE — ${input.language ?? "English"}:
   ${isHindi
     ? `- You MUST generate the diet plan in HINDI (हिंदी भाषा) using clear Devanagari script for patient readability.
   - All fields (planName, summary, meal dishes/focus, clinicalNote benefits, recommendedFoods, foodsToAvoid, hydrationGuidance, indianSpiceTherapy benefits, lifestyleAdvice, avoidanceAlerts, followUpNote) MUST be in natural, everyday Hindi (e.g. '2 फुल्के + 1 कटोरी मूंग दाल', 'ब्लड शुगर को नियंत्रित रखता है').
   - For mealName in mealSchedule, you can use the standard slot names (e.g. 'Breakfast' or 'Breakfast (नाश्ता)').`
     : isHinglish
     ? `- Generate the diet plan in friendly, casual HINGLISH (Conversational Hindi in English alphabet e.g. '2 Phulke + 1 Katori Dal aur Lauki Sabzi', 'Blood sugar ko steady rakhta hai').`
     : `- You MUST generate the entire diet plan strictly in simple, friendly ENGLISH.
   - All text fields (planName, summary, macroBreakdown, electrolyteLimits, recommendedFoods, foodsToAvoid, hydrationGuidance, mealSchedule focus and clinicalNote, indianSpiceTherapy benefits, lifestyleAdvice, avoidanceAlerts, followUpNote) MUST BE IN ENGLISH.
   - Use authentic Indian kitchen terms written in English letters (e.g. '2 Phulkas + 1 bowl Yellow Moong Dal', 'Lauki Sabzi', 'Spiced Chaas with roasted jeera', 'Keeps blood sugar steady without sharp spikes').
   - Absolutely DO NOT generate Hindi or Devanagari script when English is selected.`
   }
2. WORDING MUST BE VERY SIMPLE, FRIENDLY, AND CASUAL:
   - Avoid heavy medical and biochemical jargon (e.g., do NOT use words like 'endothelial nitric oxide synthesis', 'post-prandial glycemic excursion', 'galactomannan fiber', 'polymeric lipids', 'acrolein oxidation').
   - Instead, use friendly, warm, plain-language terms that patients, parents, and doctors understand instantly (e.g. 'Keeps blood sugar steady without sharp spikes', 'Gentle on digestion', 'Helps bring blood pressure down', 'Light on the kidneys and liver', 'Gives sustained energy throughout the morning').
3. ALL MEALS MUST USE AUTHENTIC INDIAN FOODS:
   - Use dal, sabzi, roti, rice, idli, upma, poha, khichdi, chaas, paneer, curd, sprouts, and seasonal Indian veggies.
   - Use common Indian kitchen portions: katori (150ml bowl), phulka count, glass (200ml), tsp, etc.
   - Strictly respect the Dietary Preference (${input.dietaryPreference ?? "Vegetarian"}). If Jain: zero onion, garlic, or root veggies. If Vegetarian: zero meat/eggs/fish.
4. CLEAR, ACTIONABLE INDIAN SPICE THERAPY:
   - State the practical everyday health benefit in 1 short, plain sentence.

Generate a comprehensive Indian clinical diet plan. Return ONLY raw JSON (absolutely no markdown or code fences) matching this schema:

{
  "planName": "string e.g. Indian Diabetes & Heart Wellness Diet Plan",
  "targetCalories": ${input.customCalories && Number(input.customCalories) > 0 ? Number(input.customCalories) : 1750},
  "summary": "string - 2 short, simple, reassuring sentences explaining the diet plan in everyday words",
  "macroBreakdown": {
    "carbs": "string e.g. 50% Daily Energy - Complex carbs (Jowar, Bajra, Multigrain Roti, Daliya) for steady all-day energy",
    "protein": "string e.g. 25% Daily Energy - Moong dal, fresh paneer, curd, and sprouts for muscle strength",
    "fats": "string e.g. 15% Daily Energy - 3 to 4 teaspoons cold-pressed mustard or groundnut oil per day",
    "fiber": "string e.g. 10% Daily Energy - Fresh cucumber salad, methi leaves & isabgol for smooth digestion"
  },
  "electrolyteLimits": {
    "sodium": "string e.g. Strict Salt Control (Under 1,500 mg/day) - Avoid papad, pickles, market namkeen & table salt",
    "potassium": "string e.g. Balanced Potassium - Enjoy fresh tender coconut water, amla, and bottle gourd in moderation",
    "phosphorus": "string e.g. Kidney-Safe Phosphorus - Light yellow dals, avoid heavily processed snacks",
    "calcium": "string e.g. Strong Bones Calcium - 1 bowl low-fat curd and 1 glass skimmed milk or ragi daily",
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
  "hydrationGuidance": "string e.g. 8-10 glasses water daily; enjoy fresh spiced chaas with jeera and warm lemon water",
  "mealSchedule": [
    {
      "time": "string e.g. 06:30 AM",
      "mealName": "must be one of: Early Morning, Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner, Bedtime Drink",
      "portion": "string e.g. 1 Glass (200ml)",
      "focus": "string - Delicious Indian food with ingredients e.g. Warm Methi-soaked water with a squeeze of fresh lemon",
      "clinicalNote": "string - 1 simple, plain-language reason e.g. Wakes up your metabolism and helps control morning blood sugar"
    }
  ],
  "indianSpiceTherapy": [
    {
      "spice": "string e.g. Haldi (Turmeric)",
      "benefit": "string e.g. Natural body healer that cools internal swelling and helps insulin work better"
    }
  ],
  "lifestyleAdvice": [
    "string - practical, everyday Indian healthy lifestyle tip in simple words, minimum 4 tips"
  ],
  "avoidanceAlerts": [
    "string - crucial safety tip in simple, direct words"
  ],
  "followUpNote": "string - simple note on when to check blood sugar/BP and consult doctor"
}

The mealSchedule must have exactly 7 meals: 06:30 AM Early Morning, 08:30 AM Breakfast, 11:00 AM Mid-Morning Snack, 01:30 PM Lunch Thali, 05:00 PM Evening Snack, 08:00 PM Light Dinner, 09:45 PM Bedtime Drink.`;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
  };
  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
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

function generateClinicalIndianFallback(input: Record<string, any>) {
  const langStr = String(input.language || "Hindi").toLowerCase();
  const isHindi = langStr.includes("hindi") && !langStr.includes("hinglish");
  const disease = (input.disease || "").toLowerCase();
  const comorbidities = (input.comorbidities || "").toLowerCase();
  const isDiabetes = disease.includes("diabet") || comorbidities.includes("diabet") || Number(input.hba1c) > 6.5;
  const isHypertension = disease.includes("hypertens") || comorbidities.includes("hypertens") || Number(input.bpSystolic) >= 140;
  const isCKD = disease.includes("renal") || disease.includes("ckd") || disease.includes("kidney") || Number(input.creatinine) >= 1.4;

  let targetCalories = 1750;
  if (input.customCalories && Number(input.customCalories) > 0) {
    targetCalories = Number(input.customCalories);
  } else if (input.bmi && Number(input.bmi) > 28) {
    targetCalories = 1550;
  } else if (input.bmi && Number(input.bmi) < 19) {
    targetCalories = 2100;
  }

  const planName = isCKD && isDiabetes
    ? (isHindi ? "भारतीय किडनी एवं मधुमेह देखभाल आहार योजना" : "Indian Kidney & Diabetes Care Diet Plan")
    : isDiabetes && isHypertension
    ? (isHindi ? "भारतीय शुगर एवं रक्तचाप संतुलन आहार योजना" : "Indian Sugar & Blood Pressure Balance Diet Plan")
    : isDiabetes
    ? (isHindi ? "भारतीय कम-शुगर स्वास्थ्यवर्धक आहार योजना" : "Indian Low-Sugar Healthy Living Diet Plan")
    : isHypertension
    ? (isHindi ? "भारतीय कम-नमक रक्तचाप नियंत्रण आहार योजना" : "Indian Low-Salt Blood Pressure Relief Diet Plan")
    : isCKD
    ? (isHindi ? "भारतीय सौम्य किडनी स्वास्थ्य आहार योजना" : "Indian Gentle Kidney Care Diet Plan")
    : (isHindi ? "भारतीय दैनिक स्वास्थ्य एवं ऊर्जा आहार योजना" : "Indian Daily Health & Vitality Nutrition Plan");

  const summary = isHindi
    ? `${input.patientName} (${input.age} वर्ष, ${input.gender}) के लिए विशेष रूप से तैयार की गई घर के बने शुद्ध भारतीय भोजन की पौष्टिक आहार योजना, जो ब्लड शुगर और बीपी को संतुलित रखने और दिन भर स्फूर्ति देने में मदद करती है।`
    : `Specially crafted Indian meal plan for ${input.patientName} (${input.age}Y, ${input.gender}) to keep blood sugar steady, manage blood pressure, and keep you feeling energetic all day with delicious home-cooked Indian foods.`;

  return {
    planName,
    targetCalories,
    summary,
    macroBreakdown: {
      carbs: isDiabetes
        ? (isHindi ? "48% दैनिक ऊर्जा — जटिल अनाज (ज्वार, बाजरा, मल्टीग्रेन रोटी, दलिया) अचानक शुगर बढ़ने से रोकने के लिए" : "48% Daily Energy — Complex grains (Jowar, Bajra, Multigrain Roti, Daliya) to prevent sudden blood sugar spikes")
        : (isHindi ? "50% दैनिक ऊर्जा — पौष्टिक साबुत गेहूं, बाजरा और भूरा चावल स्वच्छ दिनभर की ऊर्जा के लिए" : "50% Daily Energy — Wholesome whole wheat, millets, and brown rice for clean all-day fuel"),
      protein: isCKD
        ? (isHindi ? "18% दैनिक ऊर्जा — हल्की पीली मूंग दाल, नरम पनीर और दही किडनी पर कम दबाव के लिए" : "18% Daily Energy — Light yellow moong dal, soft paneer, and curd to go gentle on kidney filtration")
        : (isHindi ? "25% दैनिक ऊर्जा — पीली मूंग दाल, अंकुरित अनाज, ताज़ा पनीर और दही प्राकृतिक ताकत के लिए" : "25% Daily Energy — Yellow moong dal, sprouts, fresh paneer, and curd for natural body strength and healing"),
      fats: isHindi ? "18% दैनिक ऊर्जा — 3 से 4 चम्मच कच्ची घानी सरसों या मूंगफली तेल प्रतिदिन; तले हुए भोजन से बचें" : "18% Daily Energy — 3 to 4 teaspoons daily of cold-pressed mustard or groundnut oil; avoid deep-fried oils",
      fiber: isHindi ? "10% दैनिक ऊर्जा — ताज़ा खीरा सलाद, उबली मेथी और अलसी सुगम पाचन के लिए" : "10% Daily Energy — Abundant fresh cucumber, steamed methi leaves, and flaxseeds for smooth digestion"
    },
    electrolyteLimits: {
      sodium: isHypertension || isCKD
        ? (isHindi ? "सख्त नमक नियंत्रण (< 1,500 mg/दिन) — अचार, पापड़, बाजार की नमकीन और ऊपर से नमक बिल्कुल बंद" : "Strict Salt Control (< 1,500 mg/day) — Absolutely NO pickles, papad, market namkeen, or extra table salt")
        : (isHindi ? "सामान्य नमक नियंत्रण (< 2,000 mg/दिन) — कम नमक में पकाएं, पैकेट वाले चिप्स व स्नैक्स से बचें" : "Standard Salt Control (< 2,000 mg/day) — Cook with minimal salt, avoid packaged chips and snacks"),
      potassium: isCKD
        ? (isHindi ? "नियंत्रित पोटेशियम — नारियल पानी और कच्चा पालक सीमित रखें; सब्जियां उबालकर खाएं" : "Controlled Potassium — Limit coconut water and raw spinach; boil vegetables well before eating")
        : (isHindi ? "स्वस्थ पोटेशियम संतुलन — ताज़ा नारियल पानी, आंवला और लौकी का सीमित मात्रा में आनंद लें" : "Healthy Potassium Balance — Enjoy fresh tender coconut water, amla, and bottle gourd in moderation"),
      phosphorus: isCKD
        ? (isHindi ? "किडनी-सुरक्षित फास्फोरस — हल्की पीली मूंग दाल लें, बाज़ारी प्रोसेस्ड चीज़ और कोल्ड ड्रिंक्स से बचें" : "Kidney-Safe Phosphorus — Light yellow moong dal, avoid heavy processed cheeses and colas")
        : (isHindi ? "सुरक्षित फास्फोरस स्तर — घर की बनी ताज़ी दाल और दही से स्वाभाविक रूप से संतुलित" : "Safe Phosphorus Range — Balanced naturally through fresh homemade dals and curd"),
      calcium: isHindi
        ? "मजबूत हड्डियों के लिए कैल्शियम — 1 कटोरी लो-फैट दही और 1 गिलास मलाई रहित दूध या रागी दलिया रोज़ लें"
        : "Strong Bones Calcium — 1 bowl low-fat curd and 1 glass skimmed milk or ragi porridge daily",
      magnesium: isHindi
        ? "मांसपेशियों और नसों के लिए मैग्नीशियम — कद्दू के बीज, बादाम, पालक और रातभर भीगी मेथी का पानी लें"
        : "Relaxing Magnesium — Pumpkin seeds, almonds, steamed spinach, and soaked methi for nerve & muscle support",
      iron: isHindi
        ? "खून और हीमोग्लोबिन के लिए आयरन — पालक दाल, भुना चना, चुकंदर और नींबू/आंवला विटामिन सी के साथ"
        : "Blood Health Iron — Steamed palak dal, roasted chana, beetroot & amla with natural Vitamin C",
      vitaminD: isHindi
        ? "हड्डियों और इम्युनिटी के लिए विटामिन D — सुबह 15 मिनट हल्की धूप लें, फोर्टिफाइड दूध/दही और मशरूम"
        : "Sunlight & Bone Vitamin D — 15 mins morning sunlight, fortified curd/milk, and mushrooms",
      vitaminB12: isHindi
        ? "ऊर्जा और नसों के लिए विटामिन B12 — ताज़ा पनीर, दही या डॉक्टर की सलाह से बी12 सप्लीमेंट"
        : "Nerve & Energy Vitamin B12 — Low-fat paneer, fermented curd, fortified foods, or clinical supplement",
      uricAcid: isHindi
        ? "यूरिक एसिड नियंत्रण — भरपूर पानी (2.5-3 लीटर), तली चीजें और मीठे शरबत बंद, आंवला और चेरी खाएं"
        : "Purine & Uric Acid Control — Drink 2.5-3L water daily, avoid purine-heavy foods/sugary sodas, enjoy amla & cherries"
    },
    recommendedFoods: isHindi ? [
      "पीली मूंग दाल (पेट पर बहुत हल्की, प्रोटीन से भरपूर और पचाने में सबसे आसान)",
      "मल्टीग्रेन / ज्वार रोटी (उच्च फाइबर लंबे समय तक तृप्त रखता है और शुगर स्पाइक्स रोकता है)",
      "लौकी और तोरी की सब्ज़ी (शीतल, कम कैलोरी और हृदय के लिए अत्यंत सौम्य)",
      "ताज़ा हरी मेथी (प्राकृतिक भारतीय सुपरफूड जो शुगर संतुलन में मदद करता है)",
      "अंकुरित मूंग चाट नींबू के साथ (प्राकृतिक विटामिन और ऊर्जा से भरपूर ताजगी भरा नाश्ता)",
      "ताज़ा जीरा छाछ (भुने जीरे के साथ प्राकृतिक प्रोबायोटिक जो पेट ठंडा रखता है)",
      "पालक दाल (आयरन और फाइबर से भरपूर जो रक्तचाप को स्वस्थ रखती है)",
      "भुना मखाना (शाम का हल्का कुरकुरा स्नैक जो शुगर नहीं बढ़ाता)",
      "करेले की सब्ज़ी (शरीर में प्राकृतिक रूप से ग्लूकोज संतुलन बनाए रखने वाली सब्ज़ी)"
    ] : [
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
    foodsToAvoid: isHindi ? [
      "अचार और पापड़ (छिपे हुए सोडियम से भरपूर जो रक्तचाप को तुरंत बढ़ाते हैं)",
      "बाज़ार की नमकीन, भुजिया और चिप्स (बार-बार तले तेल और अत्यधिक नमक से युक्त)",
      "मिठाई, जलेबी और गुलाब जामुन (भारी चीनी और घी जो तुरंत शुगर स्पाइक करते हैं)",
      "समोसा, कचौरी और पकोड़े (असंतृप्त तेल जो लिवर और दिल पर बोझ डालते हैं)",
      "मैदा से बने नान, भटूरे और ब्रेड (शून्य फाइबर जो रक्त शर्करा को तेजी से उछालते हैं)",
      "ऊपर से छिड़का कच्चा नमक (पानी की सूजन बढ़ाता है और धमनियों को सख्त करता है)"
    ] : [
      "Pickles (Achaar) & Papad (Packed with hidden sodium that quickly raises your blood pressure)",
      "Market Namkeen, Bhujia & Chips (Deep fried in reused oil with heavy salt and trans fats)",
      "Mithai, Jalebi & Gulab Jamun (Concentrated sugar and ghee that causes instant sugar spikes)",
      "Deep-fried Samosas & Pakoras (Heavy saturated oils that stress your liver, stomach, and heart)",
      "Maida items like Naan & Bhature (Refined flour with zero fiber that triggers quick sugar jumps)",
      "Extra Table Salt & Monosodium Glutamate (Causes water swelling and stiffens blood vessels)"
    ],
    hydrationGuidance: isHindi
      ? (isCKD ? "प्रतिदिन 1.5 से 1.8 लीटर तरल पदार्थ लें (छाछ और दाल मिलाकर)। नापकर पानी पिएं।" : "दिन भर में 8 से 10 गिलास पानी पिएं। गुनगुना जीरा पानी और पुदीने वाली पतली छाछ शामिल करें।")
      : (isCKD ? "Drink 1.5 to 1.8 Liters of fluid daily (including chaas and dal). Keep a measuring bottle." : "Drink 8 to 10 glasses of water daily. Include warm jeera water and fresh diluted chaas with mint."),
    mealSchedule: [
      {
        time: "06:30 AM",
        mealName: isHindi ? "Early Morning (सुबह की शुरुआत)" : "Early Morning",
        portion: isHindi ? "1 गिलास (200ml)" : "1 Glass (200ml)",
        focus: isHindi ? "गुनगुना मेथी का पानी (1 चम्मच मेथी रातभर भीगी) थोड़े नींबू के रस के साथ" : "Warm Methi-soaked water (1 tsp methi seeds soaked overnight) with a squeeze of fresh lemon",
        clinicalNote: isHindi ? "पाचन को जगाता है और सुबह के ब्लड शुगर को नियंत्रित रखने में मदद करता है" : "Gently wakes up your digestion and prepares your body for smooth sugar control"
      },
      {
        time: "08:30 AM",
        mealName: isHindi ? "Breakfast (नाश्ता)" : "Breakfast",
        portion: isHindi ? "1 प्लेट" : "1 Plate",
        focus: isHindi ? "2 भाप में पकी रागी/मूंग दाल इडली पुदीने की चटनी के साथ, या सब्जियों वाला ओट्स उपमा" : "2 Steamed Ragi or Moong Dal Idlis with mint-coriander chutney, OR Vegetable Oats Upma",
        clinicalNote: isHindi ? "धीमी गति से पचने वाला पौष्टिक नाश्ता जो दोपहर तक सक्रिय रखता है" : "Slow-burning Indian breakfast that keeps you active and full till lunchtime"
      },
      {
        time: "11:00 AM",
        mealName: isHindi ? "Mid-Morning Snack (हल्का नाश्ता)" : "Mid-Morning Snack",
        portion: isHindi ? "1 छोटी कटोरी" : "1 Small Katori",
        focus: isHindi ? "खीरा और नींबू के साथ 1 कटोरी अंकुरित मूंग चाट, या 1 ताज़ा अमरूद/आंवला" : "1 Katori sprouted moong chaat with diced cucumber and lemon, OR 1 fresh Guava / Amla",
        clinicalNote: isHindi ? "दोपहर की थकान रोकता है और प्राकृतिक विटामिन सी का ताज़ा बढ़ावा देता है" : "Prevents mid-day energy crashes and gives you a fresh boost of natural Vitamin C"
      },
      {
        time: "01:30 PM",
        mealName: isHindi ? "Lunch (दोपहर का भोजन)" : "Lunch",
        portion: isHindi ? "संतुलित भारतीय थाली" : "Full Indian Thali",
        focus: isHindi ? "2 नरम ज्वार/मल्टीग्रेन फुल्के + 1 कटोरी पीली मूंग दाल + 1 कटोरी लौकी सब्ज़ी + खीरा सलाद + 1 गिलास छाछ" : "2 Soft Jowar/Multigrain Phulkas (no ghee) + 1 Katori Yellow Moong Dal + 1 Katori Lauki Sabzi + Cucumber Salad + 1 Glass Chaas",
        clinicalNote: isHindi ? "संतुलित थाली जो बिना सुस्ती या भारीपन के भूख को तृप्त करती है" : "Complete balanced plate that satisfies your appetite without making you feel sleepy"
      },
      {
        time: "05:00 PM",
        mealName: isHindi ? "Evening Snack (शाम का नाश्ता)" : "Evening Snack",
        portion: isHindi ? "1 कप + 1 कटोरी" : "1 Cup + 1 Bowl",
        focus: isHindi ? "अदरक-तुलसी की ग्रीन टी (बिना चीनी) + 1 कटोरी भुना मखाना या भुना चना" : "Ginger-Tulsi Green Tea (no sugar) + 1 small bowl roasted makhana (foxnuts) or roasted chana",
        clinicalNote: isHindi ? "हल्का कुरकुरा स्नैक जो शाम के समय बिस्कुट या तली नमकीन की तलब को रोकता है" : "Crispy, guilt-free crunch that stops unhealthy evening biscuit or namkeen cravings"
      },
      {
        time: "08:00 PM",
        mealName: isHindi ? "Dinner (रात का भोजन)" : "Dinner",
        portion: isHindi ? "हल्की थाली" : "Light Plate",
        focus: isHindi ? "1-2 नरम फुल्के + 1 कटोरी पालक दाल, या कद्दूकस की लौकी वाली मूंग दाल खिचड़ी" : "1-2 Soft Wheat Phulkas + 1 Katori Palak Dal, OR Moong Dal Khichdi with lots of grated lauki",
        clinicalNote: isHindi ? "हल्का आरामदायक भोजन जो सोने से पहले आसानी से पचता है और सुबह शुगर सामान्य रखता है" : "Light, comforting dinner that digests smoothly before sleep and keeps morning sugars low"
      },
      {
        time: "09:45 PM",
        mealName: isHindi ? "Bedtime Drink (सोने से पहले)" : "Bedtime Drink",
        portion: isHindi ? "1/2 गिलास (100ml)" : "1/2 Glass (100ml)",
        focus: isHindi ? "गुनगुना हल्दी दूध (मलाई रहित दूध में चुटकीभर हल्दी और काली मिर्च)" : "Warm Haldi Doodh (skimmed milk with organic turmeric and a pinch of black pepper)",
        clinicalNote: isHindi ? "सूजन कम करने वाला आरामदायक पेय जो गहरी नींद और शरीर की मरम्मत में सहायक है" : "Soothing drink that calms inflammation, promotes deep sleep, and helps body recovery"
      }
    ],
    indianSpiceTherapy: isHindi ? [
      {
        spice: "हल्दी (शुद्ध ऑर्गेनिक हल्दी)",
        benefit: "प्राकृतिक उपशामक जो आंतरिक सूजन को शांत करती है और इंसुलिन की कार्यक्षमता बढ़ाती है।"
      },
      {
        spice: "मेथी दाना",
        benefit: "भोजन से ग्लूकोज के अवशोषण को धीमा करता है ताकि ब्लड शुगर स्थिर रहे।"
      },
      {
        spice: "जीरा",
        benefit: "पाचक अग्नि को सक्रिय करता है, गैस दूर करता है और पेट को ठंडक प्रदान करता है।"
      },
      {
        spice: "दालचीनी",
        benefit: "कोशिकाओं को प्राकृतिक रूप से ग्लूकोज अवशोषित करने में मदद करती है।"
      },
      {
        spice: "अजवाइन",
        benefit: "पेट के भारीपन और गैस से तुरंत राहत दिलाती है और दालों को पचाने में मदद करती है।"
      }
    ] : [
      {
        spice: "Haldi (Organic Turmeric)",
        benefit: "Natural body healer that cools internal swelling and helps insulin work better."
      },
      {
        spice: "Methi Seeds (Fenugreek)",
        benefit: "Naturally slows down sugar absorption from your meals to keep levels flat."
      },
      {
        spice: "Jeera (Cumin Seeds)",
        benefit: "Boosts your digestive fire, eliminates gas, and soothes an uneasy stomach."
      },
      {
        spice: "Dalchini (Cinnamon)",
        benefit: "Helps cells take up glucose naturally and adds sweet warmth with zero sugar."
      },
      {
        spice: "Ajwain (Carom Seeds)",
        benefit: "Quickly relieves bloating, stomach heaviness, and helps digest dals easily."
      }
    ],
    lifestyleAdvice: isHindi ? [
      "दोपहर और रात के भोजन के बाद 100 कदम धीमी गति से शतपावली (टहलना) जरूर करें।",
      "रात का भोजन रात 08:00 बजे तक समाप्त कर लें ताकि पाचन तंत्र को 12 घंटे का विश्राम मिले।",
      "तनाव घटाने और रक्तचाप नियंत्रित रखने के लिए प्रतिदिन सुबह 15 मिनट अनुलोम-विलोम प्राणायाम करें।",
      "सलाद या दही पर कभी भी अतिरिक्त कच्चा नमक न छिड़कें। नींबू रस और भुना जीरा प्रयोग करें!"
    ] : [
      "Take a relaxed 100-step stroll ('Shatapawali') after lunch and dinner to help your food digest smoothly.",
      "Finish your evening meal by 08:00 PM to give your stomach 12 full hours of peaceful overnight rest.",
      "Practice 15 minutes of calm deep breathing (Anulom Vilom) every morning to melt away stress and lower blood pressure.",
      "Never sprinkle extra raw salt on salads or curd. Use fresh lemon juice and roasted jeera powder instead!"
    ],
    avoidanceAlerts: isHindi ? [
      isHypertension || isCKD
        ? "महत्वपूर्ण नमक चेतावनी: ढोकले में बेकिंग सोडा, बाज़ारी ब्रेड और इंस्टेंट सूप पैकेट से पूरी तरह बचें।"
        : "सोने से 2 घंटे पहले भारी मीठे खाद्य पदार्थों का सेवन न करें।",
      "डायबिटीज या बीपी की दवाओं के दौरान भोजन न छोड़ें और निर्जला उपवास से बचें।"
    ] : [
      isHypertension || isCKD
        ? "IMPORTANT SALT ALERT: Stay away from baking soda in dhokla, bakery bread, and instant soup packets."
        : "Avoid eating heavy sugary snacks within 2 hours of going to sleep.",
      "Do not skip meals or do extreme water-less fasts while taking diabetes or BP medicines."
    ],
    followUpNote: isHindi
      ? "हर हफ्ते खाली पेट ब्लड शुगर और रक्तचाप की जांच करें। 4 सप्ताह बाद अपने डॉक्टर से परामर्श लें।"
      : "Check your fasting blood sugar and blood pressure weekly. Schedule a follow-up review with your doctor in 4 weeks."
  };
}

export async function POST(req: Request) {
  const { user, errorResponse } = await verifyAuthToken(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      patientName, age, gender, weightKg, heightCm, disease,
      allergies, comorbidities, bmi, hba1c, fastingGlucose,
      creatinine, egfr, sodiumNa, potassiumK, totalCholesterol,
      bpSystolic, bpDiastolic, dietaryPreference, language,
      customCalories, targetCalories
    } = body;

    if (!patientName || !age || !gender || !disease) {
      return NextResponse.json(
        { success: false, message: "Patient name, age, gender, and medical diagnosis are required." },
        { status: 400 }
      );
    }

    const effectiveCalories = customCalories || targetCalories;
    const effectiveLanguage = language || "English";

    let dietPlan: any = null;
    let aiProviderUsed: string = 'clinical-engine';
    let aiModelUsed: string = 'clinical-engine';

    // 1. Attempt AI generation via active provider (Gemini or DeepSeek)
    try {
      const { generateClinicalJsonAnalysis } = await import('@/lib/aiProvider');
      const prompt = buildDietPrompt({
        patientName, age, gender, weightKg, heightCm, disease,
        allergies, comorbidities, bmi, hba1c, fastingGlucose,
        creatinine, egfr, sodiumNa, potassiumK, totalCholesterol,
        bpSystolic, bpDiastolic, dietaryPreference,
        language: effectiveLanguage,
        customCalories: effectiveCalories
      });

      const res = await generateClinicalJsonAnalysis({
        prompt,
        systemPrompt: "You are an expert Indian Clinical Dietitian & Diabetic Nutritionist. Return only valid JSON adhering strictly to the schema."
      });

      if (res?.data && res.data.mealSchedule) {
        dietPlan = res.data;
        aiProviderUsed = res.provider;
        aiModelUsed = res.model;
      }
    } catch (aiErr: any) {
      console.warn("[diet/generate] AI generation had issues, falling back to clinical engine:", aiErr?.message);
    }

    // 2. Fallback to clinical Indian nutrition engine with simple, casual wording
    if (!dietPlan || !dietPlan.mealSchedule) {
      dietPlan = generateClinicalIndianFallback({
        ...body,
        language: effectiveLanguage,
        customCalories: effectiveCalories
      });
    }

    return NextResponse.json({
      success: true,
      data: dietPlan,
      provider: aiProviderUsed,
      model: aiModelUsed
    });
  } catch (err: any) {
    console.error("[diet/generate] Critical error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate diet plan." },
      { status: 500 }
    );
  }
}
