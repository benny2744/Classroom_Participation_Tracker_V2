
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// Create a new teacher (deprecated - use /api/auth/signup instead)
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: { name, email, password: hashedPassword }
    });

    // Return teacher without password
    const { password: _, ...teacherWithoutPassword } = teacher;
    return NextResponse.json(teacherWithoutPassword);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Teacher with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}

// Get all teachers
export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        _count: {
          select: { rooms: true }
        }
      }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}
