
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Submit participation request
export async function POST(request: Request) {
  try {
    const { studentName, roomId, points } = await request.json();
    
    if (!studentName || !roomId || !points) {
      return NextResponse.json(
        { error: 'Student name, room ID, and points are required' },
        { status: 400 }
      );
    }

    if (points < 1 || points > 3) {
      return NextResponse.json(
        { error: 'Points must be between 1 and 3' },
        { status: 400 }
      );
    }

    // Check if room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: roomId, isActive: true },
      include: {
        sessions: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or inactive' },
        { status: 404 }
      );
    }

    const activeSession = room.sessions[0];
    if (!activeSession) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 400 }
      );
    }

    // Find or create student
    const student = await prisma.student.upsert({
      where: {
        name_roomId: {
          name: studentName.trim(),
          roomId
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        name: studentName.trim(),
        roomId
      }
    });

    // Create participation record
    const participation = await prisma.participation.create({
      data: {
        studentId: student.id,
        roomId,
        sessionId: activeSession.id,
        points,
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
        studentName: participation.student.name,
        points: participation.points,
        status: participation.status,
        submittedAt: participation.submittedAt
      }
    });
  } catch (error) {
    console.error('Error submitting participation:', error);
    return NextResponse.json(
      { error: 'Failed to submit participation' },
      { status: 500 }
    );
  }
}
