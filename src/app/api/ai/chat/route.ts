import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.8-flash:generateContent`;

const SYSTEM_PROMPT = `
You are Prof. Dr. Arpan AI, MD, DM, a Senior Clinical Pharmacologist having a direct, collegial Doctor-to-Doctor ("Dr. to Dr.") bedside consultation with your colleague, an attending Diabetologist & Metabolic Physician.

CORE CONVERSATIONAL RULES:
1. Dr-to-Dr Collegial Tone:
   - Address your colleague directly as "Doctor" (e.g., "Good to confer with you, Doctor", "Doctor, for this case...").
   - Speak physician-to-physician: sharp, peer-level, evidence-based, without patronizing explanations.
2. Diabetologist & Metabolic Context:
   - The attending physician specializes in diabetes, glycemic control, and metabolic cardiorenal disorders.
   - Correlate recommendations with diabetic priorities (e.g., glycemic stability, hypoglycemia risk, eGFR/diabetic nephropathy, neuropathy relief, SGLT2i/GLP-1 RA considerations).
3. STRICT LENGTH RULE — NOT TOO LONG (Under 150–180 words):
   - Busy practicing doctors need fast, high-yield answers in under 30 seconds.
   - DO NOT use formal letter headers (NO "To:", "From:", "Date:", "Subject:").
   - Jump straight to the clinical bottom line.
4. Use 3–4 Punchy, High-Yield Bullet Points:
   - 🎯 **Clinical Verdict**: Direct peer recommendation.
   - 💊 **Dosing & Titration**: Exact drug, dose, and diabetic/renal adjustment.
   - ⚠️ **Key Interaction / Hazard**: Critical pharmacological mechanism or red flag.
   - 📋 **Monitoring**: Exactly what labs to check next.
`;

export async function POST(req: Request) {
  try {
    // 1. Enforce Token Authentication & Active Session Validation
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const body = await req.json();
    const { message, history = [], patientContext, doctorName } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Medical query cannot be empty.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: true,
          reply: generateClinicalFallback(message, patientContext),
          isFallback: true
        },
        { status: 200 }
      );
    }

    // Build context string if patient data is attached
    let patientContextPrompt = '';
    if (patientContext && Object.keys(patientContext).length > 0) {
      patientContextPrompt = `\n--- ACTIVE PATIENT RECORD IN REVIEW (PRE-ANALYZED DATA) ---\n` +
        `Patient Name: ${patientContext.patientName || 'Anonymous'}\n` +
        `Age: ${patientContext.age || 'Not specified'} | Gender: ${patientContext.gender || 'Not specified'}\n` +
        `Primary Disease / Diagnosis: ${patientContext.disease || 'Not recorded'}\n` +
        `Known Allergies: ${patientContext.allergies || 'None reported'}\n`;

      if (patientContext.safetyScore !== undefined && patientContext.safetyScore !== null) {
        patientContextPrompt += `Pre-analyzed Prescription Safety Score: ${patientContext.safetyScore}/100 (${patientContext.riskCategory || 'Assessed'})\n`;
      }

      if (patientContext.vitals) {
        patientContextPrompt += `Vitals: BP ${patientContext.vitals.bpSystolic || '?'}/${patientContext.vitals.bpDiastolic || '?'} mmHg, Pulse ${patientContext.vitals.pulse || '?'} bpm, BMI ${patientContext.vitals.bmi || '?'}\n`;
      }
      if (patientContext.biomarkers) {
        patientContextPrompt += `Lab Biomarkers: HbA1c ${patientContext.biomarkers.hba1c || '?'}, Fasting Glucose ${patientContext.biomarkers.fastingGlucose || '?'}, Creatinine ${patientContext.biomarkers.creatinine || '?'}, eGFR ${patientContext.biomarkers.egfr || '?'}, K+ ${patientContext.biomarkers.potassiumK || '?'}\n`;
      }
      if (patientContext.medications && Array.isArray(patientContext.medications) && patientContext.medications.length > 0) {
        patientContextPrompt += `Current Prescribed Medications:\n` +
          patientContext.medications.map((m: any) => ` - ${m.name || m.drugName} ${m.dosage || m.dose || ''} (${m.frequency || ''} - ${m.timing || ''})`).join('\n') + `\n`;
      }
      if (patientContext.flaggedInteractions && Array.isArray(patientContext.flaggedInteractions) && patientContext.flaggedInteractions.length > 0) {
        patientContextPrompt += `Flagged Drug Interactions:\n` +
          patientContext.flaggedInteractions.map((i: any) => ` - [${i.severity || 'Caution'}] ${i.drugA} + ${i.drugB}: ${i.effect || ''} (Rec: ${i.recommendation || ''})`).join('\n') + `\n`;
      }
      if (patientContext.flaggedAllergies && Array.isArray(patientContext.flaggedAllergies) && patientContext.flaggedAllergies.length > 0) {
        patientContextPrompt += `Flagged Allergy Alerts:\n` +
          patientContext.flaggedAllergies.map((a: any) => ` - [${a.severity || 'Alert'}] ${a.medication}: ${a.message || a.allergyMatch || ''}`).join('\n') + `\n`;
      }
      if (patientContext.aiClinicalOverview) {
        patientContextPrompt += `Prior Clinical Analysis Overview: ${patientContext.aiClinicalOverview}\n`;
      }
      patientContextPrompt += `-----------------------------------------------------------\n`;
    }

    // Format chat contents for Gemini API
    const contents: any[] = [];

    // System instruction injected into the first user turn or system instruction
    const systemInstructionText = `${SYSTEM_PROMPT}\n${patientContextPrompt}\nConsulting Doctor: ${doctorName || auth.user?.email || 'Attending Physician'}`;

    // Format prior conversation history
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h.role === 'user' || h.role === 'client') {
          contents.push({
            role: 'user',
            parts: [{ text: String(h.content || h.text || '') }]
          });
        } else if (h.role === 'assistant' || h.role === 'model' || h.role === 'ai') {
          contents.push({
            role: 'model',
            parts: [{ text: String(h.content || h.text || '') }]
          });
        }
      }
    }

    // Add current user query
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstructionText}\n\nClinical Query from Colleague:\n${message.trim()}` }]
    });

    // Call Gemini 3.8 Flash model via Google Generative Language API
    const geminiPayload = {
      contents,
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini Chat API returned non-200:', response.status, errText);
      return NextResponse.json(
        {
          success: true,
          reply: generateClinicalFallback(message, patientContext),
          isFallback: true
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json(
        {
          success: true,
          reply: generateClinicalFallback(message, patientContext),
          isFallback: true
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: replyText.trim(),
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error: any) {
    console.error('AI Doctor Chat Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Medical consultation engine error', error: error.message },
      { status: 500 }
    );
  }
}

// ─── High-Level Clinical Expert Fallback Engine (Concise Dr-to-Dr) ─────────
function generateClinicalFallback(query: string, patientContext?: any): string {
  const q = query.toLowerCase();

  const caseIntro = patientContext?.patientName
    ? `Colleague, looking at **${patientContext.patientName}** (${patientContext.disease || 'Metabolic Case'}):`
    : `Doctor, regarding your inquiry:`;

  if (q.includes('penicillin') || q.includes('allergy')) {
    return `${caseIntro}\n\n` +
      `* 🎯 **Clinical Verdict**: Avoid beta-lactams. For confirmed IgE hypersensitivity, switch to macrolides or fluoroquinolones.\n` +
      `* 💊 **Dosing**: **Azithromycin** 500 mg Day 1, then 250 mg QD Days 2–5; or **Levofloxacin** 500 mg QD (renally adjusted).\n` +
      `* ⚠️ **Key Hazard**: 1st/2nd gen cephalosporins carry 5–10% cross-reactivity risk. Avoid in severe anaphylaxis.\n` +
      `* 📋 **Monitoring**: Monitor for rash, gastrointestinal tolerance, and baseline QTc interval.`;
  }

  if (q.includes('renal') || q.includes('metformin') || q.includes('egfr') || q.includes('creatinine')) {
    return `${caseIntro}\n\n` +
      `* 🎯 **Clinical Verdict**: Metformin requires strict renal titration. It is 90% renally cleared; accumulation triggers MALA.\n` +
      `* 💊 **Dosing (ADA/KDIGO)**: eGFR 45–59: max 2000 mg/day; eGFR 30–44: cap at 1000 mg/day (500 mg BID); eGFR <30: **Contraindicated**. Switch to **Linagliptin 5 mg QD** (no renal adjustment).\n` +
      `* ⚠️ **Key Hazard**: Lactic acidosis risk spikes sharply below eGFR 30 mL/min or during acute dehydrating illness.\n` +
      `* 📋 **Monitoring**: Serum Creatinine, eGFR, and electrolytes every 3–6 months.`;
  }

  if (q.includes('atorvastatin') || q.includes('statin') || q.includes('grapefruit') || q.includes('cyp')) {
    return `${caseIntro}\n\n` +
      `* 🎯 **Clinical Verdict**: Atorvastatin is heavily CYP3A4-dependent. Strong 3A4 inhibitors dramatically spike statin AUC.\n` +
      `* 💊 **Dosing**: With moderate 3A4 inhibitors, cap Atorvastatin at 20 mg/day, or switch to **Rosuvastatin** (CYP2C9 pathway; minimal 3A4 interaction).\n` +
      `* ⚠️ **Key Hazard**: Grapefruit furanocoumarins or macrolides inhibit gut CYP3A4, markedly increasing rhabdomyolysis and myopathy risk.\n` +
      `* 📋 **Monitoring**: Check baseline LFT (ALT) and serum CPK if myalgia or proximal weakness develops.`;
  }

  if (q.includes('ibuprofen') || q.includes('lisinopril') || q.includes('ace') || q.includes('nsaid')) {
    return `${caseIntro}\n\n` +
      `* 🎯 **Clinical Verdict**: Strongly avoid NSAID + ACEi/ARB co-prescription in diabetic patients. High risk of pre-renal hemodynamics collapse.\n` +
      `* 💊 **Alternative**: Use **Paracetamol** 500–1000 mg PO Q8H (max 3g/day) or topical Diclofenac gel for localized arthralgia.\n` +
      `* ⚠️ **Key Hazard**: Efferent dilation (ACEi) + Afferent constriction (NSAID) $\\rightarrow$ acute intraglomerular pressure drop and hyperkalemia.\n` +
      `* 📋 **Monitoring**: Serial serum K+ and creatinine within 7–14 days if co-exposure occurred.`;
  }

  return `${caseIntro}\n\n` +
    `* 🎯 **Clinical Verdict**: Evaluate therapy for glycemic stability, renal safety (eGFR), and cardiorenal protection.\n` +
    `* 💊 **Recommendation**: Ensure medications are adjusted to current organ clearance with evidence-based generic bioequivalents.\n` +
    `* ⚠️ **Key Hazard**: Screen for hypoglycemic synergy, QT prolongation, or fluid retention confounding diabetic care.\n` +
    `* 📋 **Monitoring**: Repeat HbA1c, renal profile (BMP), and clinical response in 4–6 weeks.`;
}
