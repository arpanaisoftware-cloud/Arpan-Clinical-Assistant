import { StaffUser, RiskAssessmentItem, DietPlanItem } from '../types/clinical';

export const INITIAL_STAFF_USERS: StaffUser[] = [];

export const COUNSELLING_RISK_DATABASE: RiskAssessmentItem[] = [
  {
    id: 'heartAttack',
    title: 'Heart Attack (Myocardial Infarction & Coronary Artery Risk)',
    subtitle: 'Coronary Perfusion, Plaque Rupture & Cardiac Ischemia Prevention',
    riskLevel: 'HIGH RISK',
    score: 72,
    color: '#FF4D6D',
    keyIndicators: [
      'Elevated Systolic Blood Pressure (>140 mmHg)',
      'LDL-C > 130 mg/dL with arterial plaque progression',
      'History of long-standing Type 2 Diabetes Mellitus',
      'Cardiometabolic strain with sedentary lifestyle'
    ],
    clinicalGuidance: [
      'Target Blood Pressure: < 130/80 mmHg using ACE-Inhibitor or ARB cardioprotective therapy.',
      'Initiate or optimize high-intensity Statin therapy (e.g., Atorvastatin 20mg-40mg daily).',
      'Consider low-dose Aspirin (75-100mg daily) if 10-year coronary event risk is elevated.'
    ],
    patientAdvice: [
      'Engage in 150 minutes of moderate cardiovascular aerobic activity (brisk walking) per week.',
      'Adopt a heart-healthy Mediterranean diet with strictly low dietary saturated fats and low sodium (<2,000 mg/day).',
      'Immediately seek emergency medical care if you experience chest heaviness, radiating arm/jaw pain, or sudden cold sweats.'
    ],
    screeningSchedule: 'Annual ECG, Echocardiogram and 6-monthly fasting Lipid Panel.'
  },
  {
    id: 'stroke',
    title: 'Stroke (Cerebrovascular Accident & Brain Health Risk)',
    subtitle: 'Carotid Artery Intima-Media Health & Cerebral Vascular Perfusion',
    riskLevel: 'HIGH RISK',
    score: 68,
    color: '#E056FD',
    keyIndicators: [
      'Systolic BP fluctuations and persistent arterial stiffness',
      'Elevated pulse pressure and carotid vascular shear stress',
      'Uncontrolled glycemic excursions contributing to cerebral microangiopathy',
      'Sedentary lifestyle with elevated BMI'
    ],
    clinicalGuidance: [
      'Strict 24-hour BP control (<130/80 mmHg) to prevent cerebral aneurysm rupture or ischemic penumbra.',
      'Screen carotid arteries via Doppler ultrasound if systolic BP >150 mmHg or bruits detected.',
      'Maintain anticoagulant or antiplatelet protocol if atrial fibrillation or transient ischemic signs occur.'
    ],
    patientAdvice: [
      'Memorize B.E. F.A.S.T. stroke warning signs: Balance loss, Eyesight changes, Facial drooping, Arm weakness, Slurred speech, and Time to call emergency services.',
      'Avoid sudden emotional or physical strain surges that elevate cerebral arterial pressure.',
      'Keep a daily blood pressure logbook and avoid high-sodium snacks.'
    ],
    screeningSchedule: 'Annual Carotid Artery Doppler Ultrasound and 24-hr Ambulatory BP Monitoring.'
  },
  {
    id: 'retinopathy',
    title: 'Diabetic Retinopathy (Eye & Retinal Vascular Damage)',
    subtitle: 'Microvascular Retinal Perfusion & Macular Edema Prevention',
    riskLevel: 'MODERATE CAUTION',
    score: 48,
    color: '#FFB703',
    keyIndicators: [
      'HbA1c persistently > 7.8%',
      'Reported occasional floaters or nighttime blurred vision',
      'Duration of Diabetes > 7 years'
    ],
    clinicalGuidance: [
      'Optimize glycemic control to target HbA1c < 7.0% to halt microvascular capillary damage.',
      'Control systemic hypertension to minimize retinal capillary leakage and macular edema.',
      'Order Optical Coherence Tomography (OCT) if macular thickening is suspected.'
    ],
    patientAdvice: [
      'Schedule a compulsory dilated eye exam with an Ophthalmologist at least once every 12 months.',
      'Do not rely solely on vision sharpness tests; early retinopathy presents without symptoms.',
      'Protect eyes from high glare and maintain consistent glucose logbook values.'
    ],
    screeningSchedule: 'Annual Dilated Retinal Exam & Optical Coherence Tomography (OCT).'
  },
  {
    id: 'nephropathy',
    title: 'Diabetic Nephropathy (Kidney Disease & Filtration Risk)',
    subtitle: 'Glomerular Filtration Rate (eGFR) & Microalbuminuria Guard',
    riskLevel: 'MODERATE CAUTION',
    score: 55,
    color: '#FFB703',
    keyIndicators: [
      'Spot Urine Albumin-to-Creatinine Ratio (UACR): 45 mg/g (Microalbuminuria)',
      'Estimated GFR (eGFR): 68 mL/min/1.73m² (Stage 2 CKD Mild)',
      'Frequent co-prescribing of over-the-counter NSAIDs (Ibuprofen)'
    ],
    clinicalGuidance: [
      'Prescribe ACEi or ARB (e.g. Lisinopril 10mg) for renal hemodynamic protection regardless of baseline BP.',
      'Consider SGLT2 Inhibitor (Empagliflozin / Dapagliflozin) for proven renal failure progression delay.',
      'Avoid nephrotoxic agents including prolonged NSAID courses and contrast dye without hydration.'
    ],
    patientAdvice: [
      'Drink 2.5L to 3L of water daily to maintain renal tubular flow.',
      'Avoid over-the-counter painkillers like Ibuprofen/Naproxen which restrict kidney blood flow; use Acetaminophen (Paracetamol) instead.',
      'Restrict dietary protein intake to 0.8g/kg body weight if kidney function decreases further.'
    ],
    screeningSchedule: 'Urine Microalbumin & Serum Creatinine/eGFR every 6 months.'
  },
  {
    id: 'neuropathy',
    title: 'Diabetic Neuropathy (Peripheral Nerve Damage)',
    subtitle: 'Distal Symmetric Polyneuropathy & Sensation Loss Assessment',
    riskLevel: 'OPTIMAL / LOW',
    score: 22,
    color: '#00C9A7',
    keyIndicators: [
      'Intact 10g Semmes-Weinstein Monofilament sensation in all 10 plantar test points',
      'Normal Achilles tendon deep reflexes bilaterally',
      'No active burning, tingling, or nocturnal paresthesia'
    ],
    clinicalGuidance: [
      'Maintain tight glycemic variability control (Time-in-Range > 70%).',
      'Supplement B-Complex vitamins (B1, B6, B12) if patient is on long-term Metformin therapy.',
      'If paresthesia develops, first-line agents include Pregabalin, Gabapentin, or Duloxetine.'
    ],
    patientAdvice: [
      'Inspect your feet daily for any undetected cuts, numbness, or temperature changes.',
      'Never walk barefoot, even inside your home, to prevent silent traumatic injuries.',
      'Notify your clinic immediately if you notice pins-and-needles sensation in toes or fingers.'
    ],
    screeningSchedule: 'Annual 10g Monofilament & Vibration Perception Threshold Testing.'
  },
  {
    id: 'footRisk',
    title: 'Diabetic Foot Risk (Foot Complications & Ulcer Prevention)',
    subtitle: 'Wagner Foot Ulcer Grading & Peripheral Arterial Circulation',
    riskLevel: 'OPTIMAL / LOW',
    score: 15,
    color: '#00C9A7',
    keyIndicators: [
      'Wagner Grade 0: Intact foot skin, no calluses or open deformity',
      'Palpable dorsalis pedis and posterior tibial arterial pulses',
      'Proper fitting moisture-wicking diabetic footwear worn'
    ],
    clinicalGuidance: [
      'Perform annual comprehensive foot exam assessing vascular integrity and dermatological health.',
      'Educate patient on proper nail trim straight-across protocol to avoid ingrown toenail infections.',
      'Refer to Podiatry if callus build-up or hammertoe deformities develop.'
    ],
    patientAdvice: [
      'Wash feet daily in lukewarm water; test temperature with your elbow before dipping feet.',
      'Dry thoroughly between toes to prevent fungal interdigital maceration.',
      'Apply moisturizing lotion to dry foot skin but avoid applying between toes.',
      'Wear seamless cotton/wool socks without tight elastic bands.'
    ],
    screeningSchedule: 'Daily self-inspection; Professional podiatry check every 6 months.'
  },
  {
    id: 'bleedingRisk',
    title: 'Risk of Bleeding (Antiplatelet / Anticoagulant & Hemorrhagic Risk)',
    subtitle: 'Mucosal, Gastrointestinal & Microvascular Bleeding Vulnerability',
    riskLevel: 'MODERATE CAUTION',
    score: 46,
    color: '#FFB703',
    keyIndicators: [
      'Concurrent antiplatelet / anticoagulant pharmacotherapy (Aspirin, Clopidogrel, DOACs)',
      'Borderline eGFR or hepatic metabolism influencing antithrombotic clearance',
      'Systolic blood pressure spikes (>140 mmHg) exerting vascular shear strain',
      'Advanced age (>55 years) and past history of mucosal or gastric irritation'
    ],
    clinicalGuidance: [
      'Calculate HAS-BLED clinical bleeding score to assess balance between thromboprophylaxis and bleed risk.',
      'Co-prescribe a Proton Pump Inhibitor (PPI e.g., Pantoprazole 40mg daily) for gastroprotection on dual antiplatelet therapy.',
      'Strictly avoid concurrent over-the-counter NSAIDs (Ibuprofen, Diclofenac) with antithrombotic agents.'
    ],
    patientAdvice: [
      'Immediately seek medical evaluation for warning signs: prolonged nosebleeds, bleeding gums, black tarry stools, or coffee-ground vomit.',
      'Use a soft-bristled toothbrush and an electric razor to minimize tissue microtrauma.',
      'Never take over-the-counter pain relievers or fever medicines without confirming with your doctor.'
    ],
    screeningSchedule: 'Complete Blood Count (CBC/Platelets) & Hemoglobin every 6 months; Stool Occult Blood annually.'
  },
  {
    id: 'giddinessRisk',
    title: 'Risk of Giddiness (Orthostatic Hypotension, Dizziness & Fall Risk)',
    subtitle: 'Cerebral Hypoperfusion, Autonomic Dysregulation & Equilibrium Guard',
    riskLevel: 'MODERATE CAUTION',
    score: 52,
    color: '#FFB703',
    keyIndicators: [
      'Wide pulse pressure with low diastolic blood pressure (<60 mmHg)',
      'Multiple vasodilating antihypertensive agents acting simultaneously',
      'Diabetic autonomic neuropathy causing blunted postural baroreflex',
      'Occasional lightheadedness upon standing or transitioning from bed'
    ],
    clinicalGuidance: [
      'Perform active lying-to-standing orthostatic blood pressure measurements (check drop >20 mmHg systolic or >10 mmHg diastolic).',
      'Avoid excessive evening diuretic dosing to prevent nocturia and nocturnal volume depletion.',
      'Review polypharmacy to eliminate drug-induced vestibular toxicity or vasodilatory peaks.'
    ],
    patientAdvice: [
      'Transition posture in stages: sit at the bed edge for 30-60 seconds before standing up completely.',
      'Maintain adequate fluid hydration (2L to 2.5L daily); avoid sudden hot showers or prolonged motionless standing.',
      'If dizziness occurs, immediately sit down, lower your head, or lie flat with legs elevated to restore cerebral blood flow.'
    ],
    screeningSchedule: 'Postural/Orthostatic Blood Pressure check at every clinic follow-up; Annual Vestibular assessment.'
  },
  {
    id: 'hypoglycaemiaRisk',
    title: 'Risk of Hypoglycaemia (Acute Low Blood Glucose & Autonomic Surge)',
    subtitle: 'Neuroglycopenic Episodes, Counter-Regulatory Failure & Nocturnal Dip',
    riskLevel: 'HIGH RISK',
    score: 68,
    color: '#FF4D6D',
    keyIndicators: [
      'Prescribed secretagogues (Sulfonylureas / Meglitinides) or exogenous Insulin therapy',
      'Impaired renal clearance (eGFR <60 mL/min) causing prolonged drug half-life',
      'Erratic meal timings, prolonged fasting intervals, or unplanned physical exertion',
      'Autonomic neuropathy diminishing sympathetic adrenergic warning symptoms'
    ],
    clinicalGuidance: [
      'Dose-titrate secretagogues cautiously or switch to glucose-dependent agents (DPP-4i, GLP-1RA, SGLT2i).',
      'Relax HbA1c targets to 7.5% - 8.0% if hypoglycaemic unawareness or renal insufficiency is present.',
      'Prescribe CGM (Continuous Glucose Monitoring) and provide caregiver training on Glucagon rescue kits.'
    ],
    patientAdvice: [
      'Follow the "Rule of 15": if blood glucose drops <70 mg/dL or you experience trembling/sweats, consume 15g fast-acting sugar (3 glucose tabs, 1/2 cup juice), wait 15 minutes, and retest.',
      'Always carry fast-acting glucose sweets or sachets in your bag or pocket.',
      'Never skip meals after administering morning or evening diabetes medications.'
    ],
    screeningSchedule: 'Daily Self-Monitoring of Blood Glucose (SMBG); Quarterly review of CGM sensor Ambulatory Glucose Profile (AGP).'
  },
  {
    id: 'weightGainObesityRisk',
    title: 'Risk of Weight Gain / Obesity (Metabolic Adiposity & Caloric Imbalance)',
    subtitle: 'Visceral Fat Accumulation, Insulin Resistance & Satiety Dysregulation',
    riskLevel: 'MODERATE CAUTION',
    score: 58,
    color: '#FFB703',
    keyIndicators: [
      'Pharmacotherapy with weight-gain propensity (Insulin secretagogues, Pioglitazone, Beta-blockers)',
      'Sedentary lifestyle with low daily caloric expenditure (<4,000 steps/day)',
      'Elevated baseline BMI and central abdominal adiposity (waist-to-hip ratio >0.9)',
      'High glycemic variability driving reactive postprandial hyperphagia and cravings'
    ],
    clinicalGuidance: [
      'Prioritize metabolic antidiabetic agents with proven weight-reduction efficacy (SGLT2 inhibitors or GLP-1 RAs).',
      'Prescribe personalized medical nutrition therapy with a 500 kcal daily deficit under dietitian guidance.',
      'Monitor abdominal circumference, visceral adiposity markers, and metabolic lipid ratios.'
    ],
    patientAdvice: [
      'Prioritize high-fiber complex grains, fresh green vegetables, and lean proteins to prolong natural satiety.',
      'Engage in a minimum of 150 minutes of brisk cardiovascular exercise plus 2 weekly strength-training sessions.',
      'Completely eliminate refined sugars, sweetened cold drinks, deep-fried fast foods, and late-night snacking.'
    ],
    screeningSchedule: 'Monthly Body Weight & BMI monitoring; 3-monthly Waist Circumference & Body Composition Analysis.'
  }
];

export const CLINICAL_DIET_PLANS: DietPlanItem[] = [
  {
    id: 'DIET-01',
    name: 'Diabetic Low-GI & Glycemic Control Plan',
    diseaseCategory: 'Type 2 Diabetes Mellitus & Metabolic Syndrome',
    calories: 1650,
    bmiCategory: 'Overweight / Weight Loss Target',
    macroBreakdown: {
      carbs: '45% (Complex Low-GI Whole Grains)',
      protein: '25% (Lean Fish, Tofu, Legumes)',
      fats: '30% (Monounsaturated Olive Oil & Nuts)',
      fiber: '35g Daily High-Viscosity Fiber'
    },
    electrolyteLimits: {
      sodium: '< 2,000 mg/day',
      potassium: '3,000 - 3,500 mg/day (Normal Range)',
      phosphorus: '800 - 1,000 mg/day',
      calcium: '1,000 mg/day'
    },
    mealFrequency: {
      frequency: '5 Small Split Meals Daily (3 Main + 2 Snacks)',
      schedule: [
        { time: '08:00 AM', mealName: 'Breakfast', portion: '1 Bowl', focus: 'Steel-cut oats with chia seeds, cinnamon & almond milk' },
        { time: '11:00 AM', mealName: 'Mid-Morning Snack', portion: '1 Small Apple', focus: 'Green apple + 10 raw almonds (low glycemic spike)' },
        { time: '01:30 PM', mealName: 'Lunch', portion: '1 Balanced Plate', focus: 'Quinoa / Brown rice, grilled chicken breast & steamed spinach' },
        { time: '05:00 PM', mealName: 'Evening Snack', portion: '1 Cup', focus: 'Roasted chana / Sprouts salad with lemon juice' },
        { time: '08:00 PM', mealName: 'Dinner', portion: 'Light Meal', focus: 'Multigrain roti, dal / fish curry & cucumber salad' }
      ]
    },
    recommendedFoods: [
      'Steel-cut Oats, Brown Rice, Millets (Ragi, Bajra)',
      'Leafy greens (Spinach, Kale, Methi)',
      'Walnuts, Almonds, Flaxseeds',
      'Wild Salmon, Skinless Poultry, Tofu'
    ],
    foodsToAvoid: [
      'Refined white sugar, sodas, packaged fruit juices',
      'White bread, refined flour (Maida), bakery pastries',
      'Deep fried snacks, potato chips, instant noodles'
    ]
  },
  {
    id: 'DIET-02',
    name: 'DASH Diet for Hypertension & Cardiovascular Risk',
    diseaseCategory: 'Essential Hypertension & ASCVD Prevention',
    calories: 1800,
    bmiCategory: 'Cardioprotective Weight Maintenance',
    macroBreakdown: {
      carbs: '50% (Whole Grains & Fresh Fruits)',
      protein: '20% (Plant Proteins & Lean Meats)',
      fats: '30% (Heart-Healthy Omega-3)',
      fiber: '30g Daily Dietary Fiber'
    },
    electrolyteLimits: {
      sodium: '< 1,500 mg/day (Strict Low Sodium)',
      potassium: '4,700 mg/day (High Potassium for Vasodilation)',
      phosphorus: '1,000 mg/day',
      calcium: '1,200 mg/day (Rich in Low-fat Dairy)'
    },
    mealFrequency: {
      frequency: '4 Balanced Meals Daily',
      schedule: [
        { time: '08:30 AM', mealName: 'Breakfast', portion: '1 Serving', focus: 'Whole grain toast, egg white omelet & low-fat yogurt' },
        { time: '01:00 PM', mealName: 'Lunch', portion: '1 Large Bowl', focus: 'Lentil soup (Dal), steamed vegetables & potassium-rich avocado salad' },
        { time: '05:00 PM', mealName: 'Snack', portion: '1 Medium Fruit', focus: 'Banana or Pomegranate seeds (High Potassium)' },
        { time: '08:00 PM', mealName: 'Dinner', portion: '1 Plate', focus: 'Baked salmon, quinoa & asparagus with extra virgin olive oil' }
      ]
    },
    recommendedFoods: [
      'Bananas, Oranges, Avocados, Tomatoes (Rich Potassium)',
      'Low-fat Milk, Greek Yogurt, Cottage Cheese',
      'Extra Virgin Olive Oil, Chia Seeds',
      'Garlic, Ginger, Herbs (Salt Substitute Flavors)'
    ],
    foodsToAvoid: [
      'Canned soups, soy sauce, processed pickles, papad',
      'Salty cured meats, bacon, sausages',
      'Commercial salad dressings with high sodium preservatives'
    ]
  },
  {
    id: 'DIET-03',
    name: 'Renal Care Diet (Stage 2-3 CKD)',
    diseaseCategory: 'Diabetic Nephropathy & Chronic Kidney Disease',
    calories: 1750,
    bmiCategory: 'Renal Protective & Controlled Protein',
    macroBreakdown: {
      carbs: '55% (Controlled Energy Carbs)',
      protein: '15% (Controlled Low Protein 0.8g/kg)',
      fats: '30% (Unsaturated Oils)',
      fiber: '25g Daily Soluble Fiber'
    },
    electrolyteLimits: {
      sodium: '< 1,800 mg/day',
      potassium: '< 2,000 mg/day (Restricted Potassium)',
      phosphorus: '< 800 mg/day (Restricted Phosphorus)',
      calcium: '800 - 1,000 mg/day'
    },
    mealFrequency: {
      frequency: '3 Main Meals + 1 Fluid Controlled Snack',
      schedule: [
        { time: '08:30 AM', mealName: 'Breakfast', portion: '1 Serving', focus: 'Poha / Upma made with leached vegetables & apple slices' },
        { time: '01:00 PM', mealName: 'Lunch', portion: '1 Bowl', focus: 'White rice (lower potassium than brown), bottle gourd (Lauki) curry & egg white' },
        { time: '05:00 PM', mealName: 'Snack', portion: '1 Small Portion', focus: 'Unsalted puffed rice (Murmura) + 5 macadamia nuts' },
        { time: '08:00 PM', mealName: 'Dinner', portion: '1 Light Bowl', focus: 'Ridge gourd (Torai) curry, rice & limited dal portion' }
      ]
    },
    recommendedFoods: [
      'Apples, Berries, Pears, Pineapples (Low Potassium Fruits)',
      'Leached vegetables (soaked in warm water before cooking)',
      'Egg whites, Rice, Rice flakes (Poha)'
    ],
    foodsToAvoid: [
      'Bananas, Potatoes, Tomatoes, Spinach, Oranges (High Potassium)',
      'Dark colas, Processed cheese, Nuts, Seeds (High Phosphorus)',
      'Excessive red meat and protein supplements'
    ]
  }
];
