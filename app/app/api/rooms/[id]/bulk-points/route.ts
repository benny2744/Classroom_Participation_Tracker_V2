
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Bulk adjust points for all students in a room (add or subtract 1 point each)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json(); // 'add' or 'subtract'
    const roomId = params.id;

    if (!action || !['add', 'subtract'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "add" or "subtract"' },
        { status: 400 }
      );
    }

    // Get the room with students, current participations, and active session
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        students: {
          include: {
            participations: {
              where: {
                status: 'APPROVED',
                session: { isActive: true }
              }
            }
          }
        },
        sessions: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
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

    if (room.students.length === 0) {
      return NextResponse.json(
        { error: 'No students in this room' },
        { status: 400 }
      );
    }

    const pointChange = action === 'add' ? 1 : -1;
    const results: Array<{
      studentId: string;
      studentName: string;
      oldPoints: number;
      newPoints: number;
      pointChange: number;
      participationId: string;
    }> = [];

    // Use transaction for consistency
    await prisma.$transaction(async (tx) => {
      for (const student of room.students) {
        // Calculate current total points from participations
        const currentTotalPoints = student.participations.reduce((sum, p) => sum + p.points, 0);
        
        // For subtract, don't allow going below 0, but still create a participation record with 0 effect
        let actualPointChange = pointChange;
        if (action === 'subtract' && currentTotalPoints <= 0) {
          actualPointChange = 0;
        }

        const newTotalPoints = currentTotalPoints + actualPointChange;

        // Create participation record for each student (even if points don't change)
        const participation = await tx.participation.create({
          data: {
            studentId: student.id,
            roomId,
            sessionId: activeSession.id,
            points: actualPointChange,
            status: 'APPROVED',
            approvedAt: new Date(),
            submittedAt: new Date()
          }
        });

        results.push({
          studentId: student.id,
          studentName: student.name,
          oldPoints: currentTotalPoints,
          newPoints: newTotalPoints,
          pointChange: actualPointChange,
          participationId: participation.id
        });
      }
    });

    return NextResponse.json({
      success: true,
      action,
      studentsUpdated: results.length,
      results
    });
  } catch (error) {
    console.error('Error bulk adjusting points:', error);
    return NextResponse.json(
      { error: 'Failed to bulk adjust points' },
      { status: 500 }
    );
  }
}
