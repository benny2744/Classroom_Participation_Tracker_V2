
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Create a new teacher
export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.create({
      data: { name, email }
    });

    return NextResponse.json(teacher);
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
