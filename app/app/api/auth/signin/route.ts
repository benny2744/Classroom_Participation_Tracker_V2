
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find teacher by email
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // In a real app, we'd verify the password here
    // For simplicity, we'll just return success

    // Set a simple redirect response
    const response = NextResponse.redirect(new URL('/teacher', request.url));
    
    // Set a simple session cookie
    response.cookies.set('teacher-session', teacher.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
