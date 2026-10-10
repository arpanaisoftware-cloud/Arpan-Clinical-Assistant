import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_arpan_clinical';

export interface DecodedAuthToken {
  id: string;
  role: string;
  email: string;
  staffId?: string;
  sessionId?: string;
}

export interface AuthVerificationResult {
  user?: DecodedAuthToken;
  errorResponse?: NextResponse;
}

/**
 * Validates the Authorization Bearer JWT token from an incoming HTTP Request
 * and enforces single-active-session by comparing token sessionId against user.activeSessionId in MongoDB.
 */
export async function verifyAuthToken(req: Request): Promise<AuthVerificationResult> {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Authentication token is missing in Authorization header.',
        },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Empty Bearer token provided.',
        },
        { status: 401 }
      ),
    };
  }

  let decoded: DecodedAuthToken;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as DecodedAuthToken;
  } catch (err: any) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Invalid or expired authentication token. Please sign in again.',
          sessionExpired: true,
        },
        { status: 401 }
      ),
    };
  }

  // Enforce Single Active Session in Database
  try {
    await connectDB();
    const user = await User.findById(decoded.id).select('active activeSessionId');
    if (!user) {
      return {
        errorResponse: NextResponse.json(
          { success: false, message: 'Unauthorized. User account not found.', sessionExpired: true },
          { status: 401 }
        ),
      };
    }

    if (!user.active) {
      return {
        errorResponse: NextResponse.json(
          { success: false, message: 'Account has been deactivated. Please contact administrator.', sessionExpired: true },
          { status: 403 }
        ),
      };
    }

    // If activeSessionId is set on user and does not match decoded token's sessionId, this device has been superseded!
    if (!decoded.sessionId || (user.activeSessionId && user.activeSessionId !== decoded.sessionId)) {
      return {
        errorResponse: NextResponse.json(
          {
            success: false,
            message: 'Session expired. Your account has been logged in on another device.',
            sessionExpired: true,
            loggedOutByOtherDevice: true,
          },
          { status: 401 }
        ),
      };
    }

    // If activeSessionId is null, user was logged out
    if (!user.activeSessionId) {
      return {
        errorResponse: NextResponse.json(
          {
            success: false,
            message: 'Session terminated. You have been logged out.',
            sessionExpired: true,
            loggedOutByOtherDevice: true,
          },
          { status: 401 }
        ),
      };
    }

    return { user: decoded };
  } catch (dbErr: any) {
    console.error('verifyAuthToken DB error:', dbErr.message);
    return { user: decoded };
  }
}
