import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
// Make sure to add GEMINI_API_KEY to your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ message: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
    const contentType = req.headers.get('content-type') || '';

    let patientName = '';
    let age = '';
    let gender = '';
    let weight = '';
    let disease = '';
    let allergies = '';
    let medications: any[] = [];
    let fileParts: any[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      patientName = body.patientName || '';
      age = body.age || '';
      gender = body.gender || '';
      weight = body.weight || '';
      disease = body.disease || '';
      allergies = body.allergies || '';
      medications = body.medications || [];

      if (!medications || !Array.isArray(medications) || medications.length === 0) {
        return NextResponse.json({ message: 'Medications array is required when no image is provided' }, { status: 400 });
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      patientName = (formData.get('patientName') as string) || '';
      age = (formData.get('age') as string) || '';
      gender = (formData.get('gender') as string) || '';
      weight = (formData.get('weight') as string) || '';
      disease = (formData.get('disease') as string) || '';
      allergies = (formData.get('allergies') as string) || '';
      
      const medsString = formData.get('medications') as string;
      if (medsString) {
        try {
          medications = JSON.parse(medsString);
        } catch (e) {
          // Ignore parsing error for medications
        }
      }

      const files = formData.getAll('files') as File[];
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fileParts.push({
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.type
          }
        });
      }

      if (fileParts.length === 0 && (!medications || medications.length === 0)) {
        return NextResponse.json({ message: 'Please provide medications array or upload a prescription image/PDF' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: 'Unsupported content type' }, { status: 415 });
    }

    const prompt = `
      You are an expert AI clinical assistant and pharmacist.
      Please analyze the following patient data, medications, and any provided prescription images/documents for drug interactions, allergies, alternatives, diet recommendations, and dosage timeline.
      
      If an image or document is provided, please extract the patient info (if not provided manually) and medications from it to perform your analysis.

      Patient Info (Manual Input):
      Name: ${patientName || 'Unknown'}
      Age: ${age || 'Unknown'}
      Gender: ${gender || 'Unknown'}
      Weight: ${weight || 'Unknown'}
      Disease: ${disease || 'Unknown'}
      Allergies: ${allergies || 'None'}

      Prescribed Medications (Manual Input):
      ${JSON.stringify(medications, null, 2)}

      Return a raw JSON object (without markdown code blocks) that EXACTLY matches this schema:
      {
        "patientInfo": {
          "patientName": "string",
          "age": "number",
          "gender": "string",
          "weight": "number",
          "allergies": "string",
          "disease": "string",
          "medications": []
        },
        "medications": [
          { "name": "string", "dosage": "string", "frequency": "string", "duration": "string" }
        ],
        "safetyScore": "number (0-100)",
        "riskCategory": "string (e.g., 'High Risk', 'Moderate Risk', 'Safe')",
        "statusColor": "string (hex code, e.g. #FF4D6D for High, #FFB703 for Moderate, #00C9A7 for Safe)",
        "flaggedAllergies": [
          { "medication": "string", "allergyMatch": "string", "severity": "string", "message": "string" }
        ],
        "flaggedInteractions": [
          { "drugA": "string", "drugB": "string", "severity": "string", "effect": "string", "recommendation": "string" }
        ],
        "alternativesList": [
          {
            "prescribedMed": "string",
            "category": "string",
            "options": [
              { "name": "string", "type": "string", "priceSavings": "string", "efficacy": "string", "manufacturer": "string", "notes": "string" }
            ]
          }
        ],
        "dosageTimeline": {
          "morning": [{ "name": "string", "dose": "string", "timing": "string" }],
          "afternoon": [{ "name": "string", "dose": "string", "timing": "string" }],
          "evening": [{ "name": "string", "dose": "string", "timing": "string" }],
          "bedtime": [{ "name": "string", "dose": "string", "timing": "string" }]
        },
        "dietLifestyleDos": ["string"],
        "dietLifestyleDonts": ["string"],
        "aiClinicalOverview": "string (2-3 sentences summarizing the safety and recommendations)",
        "estimatedMonthlySavings": "string (e.g. '₹1200')",
        "timestamp": "string (current date/time, e.g. 26 Sept 2026, 10:00 AM)"
      }
    `;

    const requestContent: any[] = [prompt, ...fileParts];
    const result = await model.generateContent(requestContent);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting in the response (e.g. ```json ... ```)
    const cleanedJsonText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedJsonText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", cleanedJsonText);
      return NextResponse.json({ message: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json(analysisResult, { status: 200 });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
