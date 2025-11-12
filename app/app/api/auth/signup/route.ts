
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    
    console.log('[SIGNUP] Request received:', { 
      email: email ? `${email.substring(0, 3)}***` : 'missing',
      hasPassword: !!password,
      hasName: !!name,
      timestamp: new Date().toISOString()
    });

    if (!email || !password || !name) {
      console.log('[SIGNUP] Missing fields:', { hasEmail: !!email, hasPassword: !!password, hasName: !!name });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: 'Teacher with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create teacher with hashed password
    const teacher = await prisma.teacher.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        password: hashedPassword
      }
    });

    console.log('[SIGNUP] Success - Teacher created:', { id: teacher.id, email: normalizedEmail });
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: teacher.id, 
        name: teacher.name, 
        email: teacher.email 
      } 
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle Prisma unique constraint errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
