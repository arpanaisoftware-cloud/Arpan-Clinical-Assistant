import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

import { isSuperAdminAccount } from '@/types/clinical';

export async function GET(req: Request) {
  try {
    // Enforce token-based authentication
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();

    const forwardedHost = req.headers.get('x-forwarded-host') || '';
    const directHost = req.headers.get('host') || '';
    const referer = req.headers.get('referer') || '';
    const hostToCheck = (forwardedHost || directHost || referer).toLowerCase();

    const isLocalhost =
      (hostToCheck.includes('localhost') || hostToCheck.includes('127.0.0.1') || hostToCheck.includes('0.0.0.0')) &&
      !hostToCheck.includes('arpanaisoftware.in');
    const isLive = !isLocalhost || process.env.NODE_ENV === 'production' || hostToCheck.includes('arpanaisoftware.in');

    const isCallerSuperAdmin = isSuperAdminAccount(auth.user);

    const staffMembers = await User.find()
      .select('name email role department staffId active modulePermissions rawPassword createdAt')
      .sort({ createdAt: -1 });

    const formattedStaff = staffMembers
      .filter((u) => {
        // If caller is NOT a super admin, NEVER return Admin accounts in their table!
        if (!isCallerSuperAdmin) {
          return !isSuperAdminAccount(u);
        }
        // If caller is super admin, in live production hide admin accounts from directory table
        return !isLive || !isSuperAdminAccount(u);
      })
      .map((u) => ({
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        staffId: u.staffId,
        department: u.department,
        role: u.role,
        modulePermissions: u.modulePermissions || (u.role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
        active: u.active,
        password: u.rawPassword || (u.role === 'Doctor' ? 'doctor123' : 'staff123'),
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01',
      }));

    return NextResponse.json({ success: true, staff: formattedStaff }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch staff DB error:', error.message);
    return NextResponse.json({ success: false, staff: [], isFallback: true }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    // Enforce token-based authentication
    const auth = await verifyAuthToken(req);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    await connectDB();
    const body = await req.json();
    const { name, email, password, staffId, department, role, modulePermissions } = body;

    if (!name || !email || !password || !staffId || !department) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields (name, email, password, staffId, department)' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanStaffId = staffId.trim().toUpperCase();

    // Check duplicate email
    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: `Email "${cleanEmail}" is already registered. Please use a different email address.` },
        { status: 400 }
      );
    }

    // Check duplicate staff ID
    const existingStaffId = await User.findOne({ staffId: cleanStaffId });
    if (existingStaffId) {
      return NextResponse.json(
        { success: false, message: `Staff ID "${cleanStaffId}" is already assigned to ${existingStaffId.name}. Please enter a unique Staff ID.` },
        { status: 400 }
      );
    }

    const cleanPass = password.trim();
    const hashedPassword = await bcrypt.hash(cleanPass, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      rawPassword: cleanPass,
      staffId: cleanStaffId,
      department: department.trim(),
      role: role || 'Staff',
      modulePermissions: modulePermissions || (role === 'Doctor' ? 'Full Access' : 'Counselling + Diets'),
      active: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Staff member created successfully',
        user: {
          id: newUser._id.toString(),
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          staffId: newUser.staffId,
          department: newUser.department,
          role: newUser.role,
          modulePermissions: newUser.modulePermissions,
          active: newUser.active,
          password: newUser.rawPassword || cleanPass,
          createdAt: new Date().toISOString().split('T')[0]
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create staff DB warning:', error.message);
    if (error.code === 11000) {
      const isEmail = error.message?.includes('email') || (error.keyPattern && error.keyPattern.email);
      const msg = isEmail
        ? 'This email address is already registered. Please use a different email.'
        : 'This Staff ID is already assigned. Please use a different Staff ID.';
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
