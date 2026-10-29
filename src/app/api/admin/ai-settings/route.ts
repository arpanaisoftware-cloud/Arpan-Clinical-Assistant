import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import {
  getAiConfigStatus,
  setActiveAiProvider,
  AiProvider,
  callDeepSeekAPI,
  callGeminiAPI
} from '@/lib/aiProvider';

import { isSuperAdminUser } from '@/types/clinical';

/**
 * GET /api/admin/ai-settings
 * Returns current active AI provider, model names, and configuration status
 */
export async function GET() {
  try {
    const status = await getAiConfigStatus();
    return NextResponse.json({
      success: true,
      ...status
    });
  } catch (error: any) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch AI settings', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-settings
 * Admin-only: Switch active AI provider between 'gemini' and 'deepseek'
 */
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const currentUser = auth.user;
    if (!currentUser || !isSuperAdminUser(currentUser)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access Denied: Only Super Admin can change the active AI provider.'
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { provider } = body;

    if (provider !== 'gemini' && provider !== 'deepseek') {
      return NextResponse.json(
        { success: false, message: "Invalid provider. Must be 'gemini' or 'deepseek'." },
        { status: 400 }
      );
    }

    // Save in MongoDB SystemSettings
    await setActiveAiProvider(
      provider as AiProvider,
      currentUser.email || currentUser.name || currentUser.staffId || 'Admin'
    );

    const updatedStatus = await getAiConfigStatus();

    return NextResponse.json({
      success: true,
      message: `Clinical AI provider successfully switched to ${provider === 'deepseek' ? 'DeepSeek AI (DeepSeek-V3)' : 'Google Gemini (3.8 Flash)'}.`,
      ...updatedStatus
    });
  } catch (error: any) {
    console.error('Error updating AI provider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update AI provider', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-settings
 * Admin-only: Test live connection to selected AI provider
 */
export async function PUT(req: Request) {
  try {
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const currentUser = auth.user;
    if (!currentUser || !isSuperAdminUser(currentUser)) {
      return NextResponse.json(
        { success: false, message: 'Access Denied: Only Super Admin can test AI engines.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const targetProvider = body.provider || 'gemini';

    const startTime = Date.now();

    if (targetProvider === 'deepseek') {
      if (!process.env.DEEPSEEK_API_KEY) {
        return NextResponse.json({
          success: false,
          provider: 'deepseek',
          message: 'DEEPSEEK_API_KEY is not configured in .env.local'
        });
      }

      const res = await callDeepSeekAPI({
        messages: [
          { role: 'system', content: 'You are a clinical test ping service.' },
          { role: 'user', content: 'Respond with exactly "PONG"' }
        ],
        temperature: 0.1,
        maxTokens: 10
      });

      const latencyMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        provider: 'deepseek',
        latencyMs,
        message: `DeepSeek AI is active & operational (${latencyMs}ms response time).`,
        sampleResponse: res.trim()
      });
    }

    if (targetProvider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
          success: false,
          provider: 'gemini',
          message: 'GEMINI_API_KEY is not configured in .env.local'
        });
      }

      const res = await callGeminiAPI({
        parts: [{ text: 'Respond with exactly "PONG"' }],
        temperature: 0.1
      });

      const latencyMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        provider: 'gemini',
        latencyMs,
        message: `Google Gemini AI is active & operational (${latencyMs}ms response time).`,
        sampleResponse: res.trim()
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown provider specified.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Connection test failed: ${error.message}`,
        error: error.message
      },
      { status: 500 }
    );
  }
}
