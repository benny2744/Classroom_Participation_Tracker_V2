
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Directly adjust student points (add or subtract 1 point)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json(); // 'add' or 'subtract'
    const studentId = params.id;

    if (!action || !['add', 'subtract'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "add" or "subtract"' },
        { status: 400 }
      );
    }

    // Get the student with room info and current participations
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        room: {
          include: {
            sessions: {
              where: { isActive: true },
              take: 1
            }
          }
        },
        participations: {
          where: {
            status: 'APPROVED',
            session: { isActive: true }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const activeSession = student.room.sessions[0];
    if (!activeSession) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 400 }
      );
    }

    // Calculate current total points from participations
    const currentTotalPoints = student.participations.reduce((sum, p) => sum + p.points, 0);
    
    // For subtract, don't allow going below 0
    if (action === 'subtract' && currentTotalPoints <= 0) {
      return NextResponse.json(
        { error: 'Student already has 0 points' },
        { status: 400 }
      );
    }

    const pointChange = action === 'add' ? 1 : -1;

    // Create a direct participation record (auto-approved)
    const participation = await prisma.participation.create({
      data: {
        studentId,
        roomId: student.roomId,
        sessionId: activeSession.id,
        points: pointChange > 0 ? 1 : -1, // Store as positive or negative
        status: 'APPROVED',
        approvedAt: new Date(),
        submittedAt: new Date()
      }
    });

    // Calculate new total points
    const newTotalPoints = currentTotalPoints + pointChange;

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        totalPoints: newTotalPoints
      },
      participation: {
        id: participation.id,
        points: participation.points,
        action: action
      }
    });
  } catch (error) {
    console.error('Error adjusting student points:', error);
    return NextResponse.json(
      { error: 'Failed to adjust student points' },
      { status: 500 }
    );
  }
}
