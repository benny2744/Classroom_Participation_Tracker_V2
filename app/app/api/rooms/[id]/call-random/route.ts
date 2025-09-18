

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Call a random student from the room roster
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    
    // Get all students in the room
    const students = await prisma.student.findMany({
      where: { roomId },
      select: { id: true, name: true }
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No students found in this room' },
        { status: 400 }
      );
    }

    // Get the active session for this room
    const activeSession = await prisma.session.findFirst({
      where: { 
        roomId,
        isActive: true 
      }
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: 'No active session found for this room' },
        { status: 400 }
      );
    }

    // Pick a random student
    const randomStudent = students[Math.floor(Math.random() * students.length)];

    // Create a teacher-initiated participation record
    const participation = await prisma.participation.create({
      data: {
        studentId: randomStudent.id,
        roomId,
        sessionId: activeSession.id,
        type: 'TEACHER_CALL',
        points: 1, // Default 1 point for random calls
        status: 'PENDING'
      },
      include: {
        student: true,
        session: true
      }
    });

    return NextResponse.json({
      success: true,
      participation: {
        id: participation.id,
        studentId: randomStudent.id,
        studentName: randomStudent.name,
        points: participation.points,
        type: participation.type,
        status: participation.status,
        submittedAt: participation.submittedAt
      }
    });

  } catch (error) {
    console.error('Error calling random student:', error);
    return NextResponse.json(
      { error: 'Failed to call random student' },
      { status: 500 }
    );
  }
}
