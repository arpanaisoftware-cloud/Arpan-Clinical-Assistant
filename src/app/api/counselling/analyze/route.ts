import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { RiskAssessmentItem } from '@/types/clinical';
import { COUNSELLING_RISK_DATABASE } from '@/mockData/clinicalModulesData';

export const dynamic = 'force-dynamic';

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.8-flash:generateContent`;

// Helper to determine risk category and color based on score
function getRiskMeta(score: number): { riskLevel: 'OPTIMAL / LOW' | 'MODERATE CAUTION' | 'HIGH RISK'; color: string } {
  if (score >= 65) {
    return { riskLevel: 'HIGH RISK', color: '#FF4D6D' };
  } else if (score >= 40) {
    return { riskLevel: 'MODERATE CAUTION', color: '#FFB703' };
  } else {
    return { riskLevel: 'OPTIMAL / LOW', color: '#00C9A7' };
  }
}

// Fallback rule-based calculation for the 6 factors based on patient vitals
function generateFallbackCounselling(input: any): RiskAssessmentItem[] {
  const sbp = Number(input.sbp) || 135;
  const dbp = Number(input.dbp) || 85;
  const hba1c = Number(input.hba1c) || 7.5;
  const egfr = Number(input.egfr) || 70;
  const age = Number(input.currPatientAge) || 50;
  const sensation = input.sensationLoss || 'Normal';
  const foot = input.footGrade || 'Grade 0 (Intact Skin)';
  const disease = input.currPatientDisease || 'Hypertension, Diabetes';

  // 1. Heart Attack Score calculation (0-100)
  let haScore = 30;
  if (sbp > 150) haScore += 25;
  else if (sbp > 135) haScore += 15;
  if (hba1c > 8.0) haScore += 18;
  else if (hba1c > 7.0) haScore += 10;
  if (age > 55) haScore += 12;
  haScore = Math.min(95, Math.max(10, haScore));
  const haMeta = getRiskMeta(haScore);

  // 2. Stroke Score calculation (0-100)
  let strokeScore = 25;
  if (sbp > 155 || dbp > 95) strokeScore += 30;
  else if (sbp > 140 || dbp > 90) strokeScore += 20;
  if (age > 60) strokeScore += 15;
  else if (age > 50) strokeScore += 10;
  if (hba1c > 8.0) strokeScore += 10;
  strokeScore = Math.min(95, Math.max(10, strokeScore));
  const strokeMeta = getRiskMeta(strokeScore);

  // 3. Diabetic Retinopathy Score calculation
  let retScore = 20;
  if (hba1c > 8.5) retScore += 35;
  else if (hba1c > 7.5) retScore += 22;
  if (sbp > 140) retScore += 15;
  retScore = Math.min(95, Math.max(10, retScore));
  const retMeta = getRiskMeta(retScore);

  // 4. Diabetic Nephropathy Score calculation
  let nephScore = 20;
  if (egfr < 45) nephScore += 45;
  else if (egfr < 60) nephScore += 30;
  else if (egfr < 75) nephScore += 18;
  if (sbp > 140) nephScore += 15;
  if (hba1c > 8.0) nephScore += 10;
  nephScore = Math.min(95, Math.max(10, nephScore));
  const nephMeta = getRiskMeta(nephScore);

  // 5. Diabetic Neuropathy Score calculation
  let neuroScore = 20;
  if (sensation === 'Severe Loss') neuroScore += 50;
  else if (sensation === 'Mild Loss') neuroScore += 30;
  if (hba1c > 8.0) neuroScore += 18;
  neuroScore = Math.min(95, Math.max(10, neuroScore));
  const neuroMeta = getRiskMeta(neuroScore);

  // 6. Diabetic Foot Complications Score calculation
  let footScore = 15;
  if (foot.includes('Grade 2')) footScore += 60;
  else if (foot.includes('Grade 1')) footScore += 40;
  if (sensation !== 'Normal') footScore += 20;
  footScore = Math.min(95, Math.max(10, footScore));
  const footMeta = getRiskMeta(footScore);

  // 7. Risk of Bleeding calculation
  let bleedScore = 25;
  if (sbp > 150) bleedScore += 18;
  if (egfr < 50) bleedScore += 22;
  else if (egfr < 60) bleedScore += 12;
  if (age > 60) bleedScore += 15;
  if (disease.toLowerCase().includes('hypertension') || disease.toLowerCase().includes('cad') || disease.toLowerCase().includes('stroke')) bleedScore += 15;
  bleedScore = Math.min(95, Math.max(10, bleedScore));
  const bleedMeta = getRiskMeta(bleedScore);

  // 8. Risk of Giddiness / Orthostatic Hypotension calculation
  let giddinessScore = 25;
  const pulsePressure = sbp - dbp;
  if (pulsePressure > 60) giddinessScore += 25;
  else if (pulsePressure > 50) giddinessScore += 15;
  if (dbp < 65) giddinessScore += 25;
  else if (dbp < 75) giddinessScore += 10;
  if (sensation !== 'Normal') giddinessScore += 18;
  if (age > 60) giddinessScore += 12;
  giddinessScore = Math.min(95, Math.max(10, giddinessScore));
  const giddinessMeta = getRiskMeta(giddinessScore);

  // 9. Risk of Hypoglycaemia calculation
  let hypoScore = 25;
  if (hba1c < 6.8) hypoScore += 30; // Over-tight control on medications
  else if (hba1c > 8.5) hypoScore += 18; // Erratic glycemic swings
  if (egfr < 50) hypoScore += 28; // Reduced antidiabetic drug clearance
  else if (egfr < 65) hypoScore += 15;
  if (age > 60) hypoScore += 15;
  if (disease.toLowerCase().includes('diabetes')) hypoScore += 12;
  hypoScore = Math.min(95, Math.max(10, hypoScore));
  const hypoMeta = getRiskMeta(hypoScore);

  // 10. Risk of Weight Gain / Obesity calculation
  let weightScore = 28;
  if (hba1c > 8.0) weightScore += 25;
  else if (hba1c > 7.0) weightScore += 15;
  if (sbp > 140 || dbp > 90) weightScore += 15;
  if (disease.toLowerCase().includes('diabetes') || disease.toLowerCase().includes('metabolic') || disease.toLowerCase().includes('obesity')) weightScore += 18;
  weightScore = Math.min(95, Math.max(10, weightScore));
  const weightMeta = getRiskMeta(weightScore);

  return [
    {
      id: 'heartAttack',
      title: 'Heart Attack (Myocardial Infarction & Coronary Artery Risk)',
      subtitle: 'Coronary Perfusion, Plaque Rupture & Cardiac Ischemia Prevention',
      riskLevel: haMeta.riskLevel,
      score: haScore,
      color: haMeta.color,
      keyIndicators: [
        `Systolic BP: ${sbp} mmHg & Diastolic BP: ${dbp} mmHg`,
        `Glycemic control level (HbA1c: ${hba1c}%)`,
        `Patient Age (${age} Y) and diagnosed condition (${disease})`,
        'Endothelial shear stress and cardiometabolic risk profile'
      ],
      clinicalGuidance: [
        'Target Blood Pressure < 130/80 mmHg using cardioprotective ACE-Inhibitor or ARB therapy.',
        'Optimize Statin therapy (e.g. Atorvastatin 20mg-40mg) to reduce coronary LDL plaque deposition.',
        'Evaluate low-dose Aspirin (75-100mg daily) if 10-year ASCVD risk exceeds 10%.'
      ],
      patientAdvice: [
        'Engage in 150 minutes of moderate aerobic activity (brisk walking, swimming) weekly.',
        'Limit dietary sodium to < 2,000 mg/day and replace saturated fats with heart-healthy oils.',
        'Watch for heart attack symptoms: sudden chest heaviness, left arm radiation, or shortness of breath.'
      ],
      screeningSchedule: 'Annual 12-lead ECG, Echocardiogram and 6-monthly fasting Lipid Panel.'
    },
    {
      id: 'stroke',
      title: 'Stroke (Cerebrovascular Accident & Brain Health Risk)',
      subtitle: 'Carotid Artery Intima-Media Health & Cerebral Vascular Perfusion',
      riskLevel: strokeMeta.riskLevel,
      score: strokeScore,
      color: strokeMeta.color,
      keyIndicators: [
        `Persistent arterial stiffness from BP ${sbp}/${dbp} mmHg`,
        `Cerebrovascular capillary microangiopathy risk with HbA1c ${hba1c}%`,
        `Patient age factor (${age} years)`,
        'Systemic vascular resistance and carotid shear strain'
      ],
      clinicalGuidance: [
        'Maintain strict 24-hr ambulatory blood pressure control to protect cerebral vasculature.',
        'Perform carotid artery Doppler scan if carotid bruit or transient neurological complaints present.',
        'Assess antiplatelet or anticoagulant indications if episodic arrhythmia occurs.'
      ],
      patientAdvice: [
        'Remember the B.E. F.A.S.T. stroke acronym: Balance, Eyes, Face drooping, Arm weakness, Slurred speech, Time.',
        'Avoid sudden extreme hypertensive surges through stress reduction and consistent medication timing.',
        'Keep a daily blood pressure record and reduce excessive caffeine or high-salt diets.'
      ],
      screeningSchedule: 'Annual Carotid Artery Doppler Ultrasound and 24-hr Ambulatory BP Monitoring.'
    },
    {
      id: 'retinopathy',
      title: 'Diabetic Retinopathy (Eye & Retinal Vascular Damage)',
      subtitle: 'Microvascular Retinal Perfusion & Macular Edema Prevention',
      riskLevel: retMeta.riskLevel,
      score: retScore,
      color: retMeta.color,
      keyIndicators: [
        `HbA1c level: ${hba1c}% indicating microvascular endothelial stress`,
        `Blood pressure load: ${sbp}/${dbp} mmHg accelerating capillary leakage`,
        'Duration and metabolic control of chronic diagnosis'
      ],
      clinicalGuidance: [
        'Achieve tight glycemic control (target HbA1c < 7.0%) to inhibit retinal capillary pericyte apoptosis.',
        'Manage systemic blood pressure to reduce retinal microaneurysm leakage and macular edema.',
        'Refer promptly for optical coherence tomography (OCT) if patient reports visual blurring.'
      ],
      patientAdvice: [
        'Undergo an annual dilated eye exam with an Ophthalmologist regardless of visual acuity.',
        'Never ignore dark floaters, flashes of light, or sudden patchy blindness in either eye.',
        'Protect eyes with UV sunglasses and maintain consistent blood sugar logbooks.'
      ],
      screeningSchedule: 'Annual Dilated Retinal Exam & Optical Coherence Tomography (OCT).'
    },
    {
      id: 'nephropathy',
      title: 'Diabetic Nephropathy (Kidney Disease & Filtration Risk)',
      subtitle: 'Glomerular Filtration Rate (eGFR) & Microalbuminuria Guard',
      riskLevel: nephMeta.riskLevel,
      score: nephScore,
      color: nephMeta.color,
      keyIndicators: [
        `eGFR baseline: ${egfr} mL/min/1.73m²`,
        `Hemodynamic filtration load from BP: ${sbp}/${dbp} mmHg`,
        `Glycemic metabolic burden with HbA1c: ${hba1c}%`
      ],
      clinicalGuidance: [
        'Maintain first-line ACEi/ARB therapy for renal hemodynamic protection and intraglomerular pressure reduction.',
        'Consider SGLT2 Inhibitor therapy for proven preservation of renal function and reduction in proteinuria.',
        'Avoid all nephrotoxic agents including OTC NSAIDs (Ibuprofen/Naproxen) and unmonitored contrast dyes.'
      ],
      patientAdvice: [
        'Maintain daily hydration (2.5L to 3L water) to sustain continuous renal perfusion.',
        'Do not take over-the-counter NSAID pain relievers; use Paracetamol for pain after consulting doctor.',
        'Adhere to a moderate protein, low-sodium dietary regimen to minimize kidney filtration burden.'
      ],
      screeningSchedule: 'Urine Albumin-to-Creatinine Ratio (UACR) & Serum Creatinine/eGFR every 6 months.'
    },
    {
      id: 'neuropathy',
      title: 'Diabetic Neuropathy (Peripheral Nerve Damage)',
      subtitle: 'Distal Symmetric Polyneuropathy & Sensation Loss Assessment',
      riskLevel: neuroMeta.riskLevel,
      score: neuroScore,
      color: neuroMeta.color,
      keyIndicators: [
        `Monofilament sensation assessment: ${sensation}`,
        `Glycemic control (HbA1c: ${hba1c}%) driving axonal sorbitol accumulation`,
        'Distal peripheral nerve sensory threshold'
      ],
      clinicalGuidance: [
        'Ensure glycemic stability (Time in Range > 70%) to prevent progressive peripheral axonal damage.',
        'Monitor Vitamin B12 levels, especially if patient is maintained on long-term Metformin therapy.',
        'If burning neuropathic pain occurs, initiate Pregabalin, Gabapentin, or Duloxetine therapy.'
      ],
      patientAdvice: [
        'Perform daily tactile and visual inspection of your feet for silent cuts, blisters, or temperature changes.',
        'Never walk barefoot indoors or outdoors to prevent unrecognized traumatic punctures.',
        'Report any pins-and-needles sensations, nighttime burning, or numbness to your physician promptly.'
      ],
      screeningSchedule: 'Annual 10g Semmes-Weinstein Monofilament & Vibration Tuning Fork Assessment.'
    },
    {
      id: 'footRisk',
      title: 'Diabetic Foot Risk (Foot Complications & Ulcer Prevention)',
      subtitle: 'Wagner Foot Ulcer Grading & Peripheral Arterial Circulation',
      riskLevel: footMeta.riskLevel,
      score: footScore,
      color: footMeta.color,
      keyIndicators: [
        `Wagner Ulcer evaluation: ${foot}`,
        `Peripheral sensation status: ${sensation}`,
        `Microvascular peripheral perfusion with BP: ${sbp}/${dbp} mmHg`
      ],
      clinicalGuidance: [
        'Perform routine podiatric examination assessing skin integrity, calluses, and arterial pulses.',
        'Instruct on straight-across nail trimming to prevent ingrown toenail bacterial paronychia.',
        'Ensure immediate offloading footwear and wound dressing if active ulceration is present.'
      ],
      patientAdvice: [
        'Wash feet daily in lukewarm water; test temperature with elbow or wrist first.',
        'Thoroughly dry skin between toes to prevent moisture-induced fungal infections.',
        'Wear seamless, moisture-wicking diabetic socks and fitted protective shoes with cushioned insoles.'
      ],
      screeningSchedule: 'Daily patient self-inspection; Podiatric clinical checkup every 6 months.'
    },
    {
      id: 'bleedingRisk',
      title: 'Risk of Bleeding (Antiplatelet / Anticoagulant & Hemorrhagic Risk)',
      subtitle: 'Mucosal, Gastrointestinal & Microvascular Bleeding Vulnerability',
      riskLevel: bleedMeta.riskLevel,
      score: bleedScore,
      color: bleedMeta.color,
      keyIndicators: [
        `Blood pressure stress (${sbp}/${dbp} mmHg) increasing capillary vascular strain`,
        `Renal filtration status (eGFR: ${egfr} mL/min) affecting antithrombotic clearance`,
        `Patient age factor (${age} years) with fragile mucosal microvasculature`,
        `Co-occurring condition profile (${disease})`
      ],
      clinicalGuidance: [
        'Calculate HAS-BLED clinical bleeding score to assess balance between thromboprophylaxis and bleed risk.',
        'Co-prescribe a Proton Pump Inhibitor (PPI e.g., Pantoprazole 40mg daily) for gastroprotection if patient is on antiplatelet therapy.',
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
      riskLevel: giddinessMeta.riskLevel,
      score: giddinessScore,
      color: giddinessMeta.color,
      keyIndicators: [
        `Pulse pressure gap (${pulsePressure} mmHg) with diastolic baseline ${dbp} mmHg`,
        `Diabetic autonomic neuropathic risk indicated by peripheral sensation (${sensation})`,
        `Age related vascular baroreflex sensitivity (${age} years)`,
        'Vasodilating antihypertensive load'
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
      riskLevel: hypoMeta.riskLevel,
      score: hypoScore,
      color: hypoMeta.color,
      keyIndicators: [
        `Current glycemic marker (HbA1c: ${hba1c}%) reflecting glucose exposure`,
        `Renal clearance capacity (eGFR: ${egfr} mL/min) predisposing to drug accumulation`,
        `Autonomic neuropathy status (${sensation}) which blunts sympathetic adrenergic warning signs`,
        'Irregular meal patterns or unadjusted physical activity'
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
      riskLevel: weightMeta.riskLevel,
      score: weightScore,
      color: weightMeta.color,
      keyIndicators: [
        `Hyperglycemic load (HbA1c: ${hba1c}%) indicating hyperinsulinemia and insulin resistance`,
        `Hypertensive vascular loading (${sbp}/${dbp} mmHg) associated with metabolic syndrome`,
        `Chronic disease profile (${disease}) and physical activity limitations`,
        'Medications with weight-gain propensity (secretagogues, insulin, beta-blockers)'
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
}

export async function POST(req: Request) {
  try {
    // 1. Verify Bearer Token
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await req.json();

    const {
      currPatientName,
      currPatientAge,
      currPatientGender,
      currPatientDisease,
      sbp,
      dbp,
      hba1c,
      egfr,
      sensationLoss,
      footGrade
    } = body;

    // Validate minimum required fields
    if (!currPatientName || !currPatientAge || !sbp || !dbp || !hba1c || !egfr) {
      return NextResponse.json(
        { success: false, message: 'Missing required patient demographics or clinical vitals' },
        { status: 400 }
      );
    }

    const fallbackFactors = generateFallbackCounselling(body);

    // Generate AI personalized clinical counseling across all 10 chronic risk factors
    try {
      const { generateClinicalJsonAnalysis } = await import('@/lib/aiProvider');
      const prompt = `
You are an expert clinical endocrinologist, cardiologist, and patient counselling specialist.
Evaluate the following patient and generate comprehensive chronic risk counselling across EXACTLY 10 DISTINCT FACTORS:
1. "heartAttack" - Heart Attack (Myocardial Infarction & Coronary Artery Risk)
2. "stroke" - Stroke (Cerebrovascular Accident & Brain Health Risk)
3. "retinopathy" - Diabetic Retinopathy (Eye & Retinal Vascular Damage)
4. "nephropathy" - Diabetic Nephropathy (Kidney Disease & Filtration Risk)
5. "neuropathy" - Diabetic Neuropathy (Peripheral Nerve Damage)
6. "footRisk" - Diabetic Foot Risk (Foot Complications & Ulcer Prevention)
7. "bleedingRisk" - Risk of Bleeding (Antiplatelet / Anticoagulant & Hemorrhagic Risk)
8. "giddinessRisk" - Risk of Giddiness (Orthostatic Hypotension, Dizziness & Fall Risk)
9. "hypoglycaemiaRisk" - Risk of Hypoglycaemia (Acute Low Blood Glucose & Autonomic Surge)
10. "weightGainObesityRisk" - Risk of Weight Gain / Obesity (Metabolic Adiposity & Caloric Imbalance)

Patient Details:
- Name: ${currPatientName}
- Age: ${currPatientAge} years
- Gender: ${currPatientGender || 'Not specified'}
- Diagnosed Conditions: ${currPatientDisease}
- Systolic Blood Pressure: ${sbp} mmHg
- Diastolic Blood Pressure: ${dbp} mmHg
- HbA1c: ${hba1c}%
- eGFR: ${egfr} mL/min/1.73m²
- Monofilament Sensation: ${sensationLoss || 'Normal'}
- Wagner Foot Ulcer Grade: ${footGrade || 'Grade 0 (Intact Skin)'}

For EACH of the 10 factors, return an object in the JSON array:
- "id": one of "heartAttack", "stroke", "retinopathy", "nephropathy", "neuropathy", "footRisk", "bleedingRisk", "giddinessRisk", "hypoglycaemiaRisk", "weightGainObesityRisk"
- "title": factor title string (clearly stating the condition/risk)
- "subtitle": factor subtitle string
- "riskLevel": exactly one of "OPTIMAL / LOW", "MODERATE CAUTION", "HIGH RISK" (based on score: >=65 is HIGH RISK, 40-64 is MODERATE CAUTION, <40 is OPTIMAL / LOW)
- "score": number between 5 and 95
- "color": "#FF4D6D" for HIGH RISK, "#FFB703" for MODERATE CAUTION, "#00C9A7" for OPTIMAL / LOW (use "#E056FD" if stroke is HIGH RISK)
- "keyIndicators": array of 3-4 strings detailing specific reasons based on patient's numbers
- "clinicalGuidance": array of 3 actionable physician/staff guidance strings
- "patientAdvice": array of 3 practical instructions for the patient
- "screeningSchedule": string describing frequency of tests

Return a RAW JSON array of exactly 10 items with no markdown code blocks or surrounding text.
`;

      const aiRes = await generateClinicalJsonAnalysis<any[]>({
        prompt,
        systemPrompt: 'You are an expert clinical endocrinologist, cardiologist, and patient counselling specialist. Return only a valid JSON array of 10 items.'
      });

      if (aiRes?.data && Array.isArray(aiRes.data) && aiRes.data.length >= 6) {
        return NextResponse.json({
          success: true,
          data: aiRes.data,
          source: `${aiRes.provider}-ai`,
          provider: aiRes.provider,
          model: aiRes.model
        });
      }
    } catch (aiError: any) {
      console.warn('[counselling/analyze] AI counselling call failed, using rule-based algorithm:', aiError?.message);
    }

    // Return the calculated 6 factors
    return NextResponse.json({
      success: true,
      data: fallbackFactors,
      source: 'clinical-engine'
    });
  } catch (error: any) {
    console.error('POST /api/counselling/analyze error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate counselling analysis' },
      { status: 500 }
    );
  }
}
