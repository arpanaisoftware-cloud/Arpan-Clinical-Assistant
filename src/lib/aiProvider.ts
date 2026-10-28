import connectDB from '@/lib/db';
import SystemSetting from '@/models/SystemSetting';

export type AiProvider = 'gemini' | 'deepseek';

export interface AiConfigStatus {
  activeProvider: AiProvider;
  geminiConfigured: boolean;
  deepseekConfigured: boolean;
  geminiModel: string;
  deepseekModel: string;
  lastUpdated?: string;
  lastUpdatedBy?: string;
}

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1alpha/models/gemini-3.8-flash:generateContent';
const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions';

const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
const DEFAULT_DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

// In-memory cache for fast access without hitting DB on every single token/turn
let cachedProvider: { value: AiProvider; timestamp: number } | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds cache

/**
 * Retrieves the currently active AI provider ('gemini' | 'deepseek')
 * Checks MongoDB SystemSetting with in-memory caching, falling back to process.env.ACTIVE_AI_PROVIDER or 'gemini'.
 */
export async function getActiveAiProvider(): Promise<AiProvider> {
  const now = Date.now();
  if (cachedProvider && now - cachedProvider.timestamp < CACHE_TTL_MS) {
    return cachedProvider.value;
  }

  try {
    await connectDB();
    const setting = await SystemSetting.findOne({ key: 'ACTIVE_AI_PROVIDER' });
    if (setting && (setting.value === 'gemini' || setting.value === 'deepseek')) {
      cachedProvider = { value: setting.value as AiProvider, timestamp: now };
      return setting.value as AiProvider;
    }
  } catch (err: any) {
    console.warn('[aiProvider] Failed to read ACTIVE_AI_PROVIDER from DB:', err?.message);
  }

  const envFallback = (process.env.ACTIVE_AI_PROVIDER as AiProvider) || 'gemini';
  const resolved = envFallback === 'deepseek' ? 'deepseek' : 'gemini';
  cachedProvider = { value: resolved, timestamp: now };
  return resolved;
}

/**
 * Sets the active AI provider in MongoDB (Admin action)
 */
export async function setActiveAiProvider(provider: AiProvider, updatedBy?: string): Promise<boolean> {
  try {
    await connectDB();
    await SystemSetting.findOneAndUpdate(
      { key: 'ACTIVE_AI_PROVIDER' },
      {
        value: provider,
        description: 'Currently active clinical AI provider (gemini or deepseek)',
        updatedBy: updatedBy || 'Admin'
      },
      { upsert: true, new: true }
    );
    cachedProvider = { value: provider, timestamp: Date.now() };
    return true;
  } catch (err: any) {
    console.error('[aiProvider] Failed to set ACTIVE_AI_PROVIDER in DB:', err);
    throw err;
  }
}

/**
 * Returns overall AI configuration status including key presence and current active provider
 */
export async function getAiConfigStatus(): Promise<AiConfigStatus> {
  const activeProvider = await getActiveAiProvider();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5);
  const deepseekConfigured = Boolean(process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.trim().length > 5);

  let lastUpdated: string | undefined;
  let lastUpdatedBy: string | undefined;

  try {
    await connectDB();
    const setting = await SystemSetting.findOne({ key: 'ACTIVE_AI_PROVIDER' });
    if (setting) {
      lastUpdated = setting.updatedAt ? new Date(setting.updatedAt).toISOString() : undefined;
      lastUpdatedBy = setting.updatedBy;
    }
  } catch (e) {
    // ignore
  }

  return {
    activeProvider,
    geminiConfigured,
    deepseekConfigured,
    geminiModel: DEFAULT_GEMINI_MODEL,
    deepseekModel: DEFAULT_DEEPSEEK_MODEL,
    lastUpdated,
    lastUpdatedBy
  };
}

/**
 * Clean JSON output from LLM responses (stripping ```json markdown fences)
 */
export function cleanJsonString(raw: string): string {
  let cleaned = raw.replace(/```json/gi, '').replace(/```/gi, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  // If object comes first or array comes first
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  }

  return cleaned.trim();
}

/**
 * Call DeepSeek API (OpenAI-compatible)
 */
export async function callDeepSeekAPI(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured in .env.local');
  }

  const model = DEFAULT_DEEPSEEK_MODEL;
  const payload: any = {
    model,
    messages: options.messages,
    temperature: options.temperature !== undefined ? options.temperature : 0.2,
    max_tokens: options.maxTokens || 4096,
  };

  if (options.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || '';
  return reply;
}

/**
 * Call Gemini API (Google Generative Language)
 */
export async function callGeminiAPI(options: {
  parts: any[];
  temperature?: number;
  jsonMode?: boolean;
  systemInstruction?: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in .env.local');
  }

  const body: any = {
    contents: [
      {
        role: 'user',
        parts: options.parts
      }
    ],
    generationConfig: {
      temperature: options.temperature !== undefined ? options.temperature : 0.2,
      ...(options.jsonMode ? { responseMimeType: 'application/json' } : {})
    }
  };

  if (options.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: options.systemInstruction }]
    };
  }

  const res = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/**
 * Unified Chat Generation:
 * Automatically uses active provider (Gemini or DeepSeek), formatting system instructions
 * and message history appropriately.
 */
export async function generateClinicalAiChat(options: {
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  doctorName?: string;
  patientContextPrompt?: string;
}): Promise<{ reply: string; provider: AiProvider; model: string; isFallback?: boolean }> {
  const activeProvider = await getActiveAiProvider();

  // Full composite system instructions
  const fullSystemInstruction = [
    options.systemPrompt,
    options.patientContextPrompt || '',
    `Consulting Physician: ${options.doctorName || 'Attending Physician'}`
  ].filter(Boolean).join('\n\n');

  // ─── 1. IF ACTIVE PROVIDER IS DEEPSEEK ───
  if (activeProvider === 'deepseek') {
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
          { role: 'system', content: fullSystemInstruction }
        ];

        // Format history
        if (options.conversationHistory && options.conversationHistory.length > 0) {
          for (const item of options.conversationHistory) {
            const role = (item.role === 'assistant' || item.role === 'model' || item.role === 'ai')
              ? 'assistant'
              : 'user';
            messages.push({ role, content: item.content });
          }
        }

        messages.push({ role: 'user', content: options.userMessage });

        const reply = await callDeepSeekAPI({
          messages,
          temperature: 0.25,
          maxTokens: 2048
        });

        return {
          reply,
          provider: 'deepseek',
          model: DEFAULT_DEEPSEEK_MODEL
        };
      } catch (deepseekErr: any) {
        console.warn('[aiProvider] DeepSeek call failed, attempting fallback to Gemini:', deepseekErr?.message);
        // Fall back to Gemini if available
      }
    } else {
      console.warn('[aiProvider] DeepSeek active but DEEPSEEK_API_KEY missing, checking Gemini fallback...');
    }
  }

  // ─── 2. IF ACTIVE PROVIDER IS GEMINI (OR FALLBACK) ───
  if (process.env.GEMINI_API_KEY) {
    try {
      const contents: any[] = [];

      if (options.conversationHistory && options.conversationHistory.length > 0) {
        for (const item of options.conversationHistory) {
          const role = (item.role === 'assistant' || item.role === 'model' || item.role === 'ai')
            ? 'model'
            : 'user';
          contents.push({
            role,
            parts: [{ text: item.content }]
          });
        }
      }

      // Add user turn with system instructions
      contents.push({
        role: 'user',
        parts: [{ text: `${fullSystemInstruction}\n\nClinical Query from Colleague:\n${options.userMessage}` }]
      });

      const body = {
        contents,
        generationConfig: {
          temperature: 0.25,
          topP: 0.9,
          maxOutputTokens: 2048,
        }
      };

      const res = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
          reply,
          provider: 'gemini',
          model: DEFAULT_GEMINI_MODEL
        };
      } else {
        const errText = await res.text();
        console.warn('[aiProvider] Gemini returned non-200:', res.status, errText);
      }
    } catch (geminiErr: any) {
      console.warn('[aiProvider] Gemini call failed:', geminiErr?.message);
    }
  }

  // If DeepSeek was selected and Gemini was tried or vice versa
  throw new Error('Both AI providers failed or are unconfigured. Please check GEMINI_API_KEY and DEEPSEEK_API_KEY in .env.local.');
}

/**
 * Unified JSON Generator:
 * Evaluates clinical inputs and extracts structured JSON using active provider.
 */
export async function generateClinicalJsonAnalysis<T = any>(options: {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
}): Promise<{ data: T; provider: AiProvider; model: string }> {
  const activeProvider = await getActiveAiProvider();

  // 1. Attempt with DeepSeek if active
  if (activeProvider === 'deepseek') {
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
        if (options.systemPrompt) {
          messages.push({
            role: 'system',
            content: `${options.systemPrompt}\nYou must return a valid, well-formed JSON object or JSON array with no extra text.`
          });
        }
        messages.push({ role: 'user', content: options.prompt });

        const raw = await callDeepSeekAPI({
          messages,
          temperature: options.temperature !== undefined ? options.temperature : 0.2,
          jsonMode: true
        });

        const cleaned = cleanJsonString(raw);
        const parsed = JSON.parse(cleaned);
        return {
          data: parsed,
          provider: 'deepseek',
          model: DEFAULT_DEEPSEEK_MODEL
        };
      } catch (err: any) {
        console.warn('[aiProvider] DeepSeek JSON generation error, falling back to Gemini:', err?.message);
      }
    }
  }

  // 2. Attempt with Gemini (if active or if DeepSeek failed)
  if (process.env.GEMINI_API_KEY) {
    try {
      const parts = [{ text: options.prompt }];
      const raw = await callGeminiAPI({
        parts,
        temperature: options.temperature !== undefined ? options.temperature : 0.2,
        jsonMode: true,
        systemInstruction: options.systemPrompt
      });

      const cleaned = cleanJsonString(raw);
      const parsed = JSON.parse(cleaned);
      return {
        data: parsed,
        provider: 'gemini',
        model: DEFAULT_GEMINI_MODEL
      };
    } catch (err: any) {
      console.warn('[aiProvider] Gemini JSON generation error:', err?.message);
      // If DeepSeek wasn't tried yet (e.g. Gemini was active), try DeepSeek
      if (activeProvider === 'gemini' && process.env.DEEPSEEK_API_KEY) {
        try {
          const raw = await callDeepSeekAPI({
            messages: [
              ...(options.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
              { role: 'user' as const, content: options.prompt }
            ],
            jsonMode: true
          });
          const parsed = JSON.parse(cleanJsonString(raw));
          return { data: parsed, provider: 'deepseek', model: DEFAULT_DEEPSEEK_MODEL };
        } catch (deepseekErr: any) {
          console.warn('[aiProvider] Secondary DeepSeek attempt also failed:', deepseekErr?.message);
        }
      }
    }
  }

  throw new Error('Could not generate AI analysis with the configured providers.');
}

/**
 * Extracts prescription text/data from an image or PDF using Gemini Vision
 */
export async function extractPrescriptionWithVision(
  imageBase64: string,
  mimeType: string,
  analysisPrompt: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for document and visual OCR scanning.');
  }

  const parts = [
    { text: analysisPrompt },
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    }
  ];

  return await callGeminiAPI({
    parts,
    temperature: 0.2,
    jsonMode: true
  });
}
