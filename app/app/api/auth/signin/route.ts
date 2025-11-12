
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log('[SIGNIN] Request received:', { 
      email: email ? `${email.substring(0, 3)}***` : 'missing',
      hasPassword: !!password,
      timestamp: new Date().toISOString()
    });

    if (!email || !password) {
      console.log('[SIGNIN] Missing fields:', { hasEmail: !!email, hasPassword: !!password });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Find teacher by email
    const teacher = await prisma.teacher.findUnique({
      where: { email: normalizedEmail }
    });

    if (!teacher) {
      console.log('[SIGNIN] Teacher not found for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    
    if (!isPasswordValid) {
      console.log('[SIGNIN] Invalid password for email:', normalizedEmail);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    console.log('[SIGNIN] Success for email:', normalizedEmail);
    // Return user data (without password)
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: teacher.id, 
        name: teacher.name, 
        email: teacher.email 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to login',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
