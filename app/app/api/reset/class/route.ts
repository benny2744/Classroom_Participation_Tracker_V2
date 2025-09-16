
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Reset entire class participation data
export async function POST(request: Request) {
  try {
    const { roomId, sessionId } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { roomId };
    if (sessionId) {
      whereClause.sessionId = sessionId;
    } else {
      // If no session specified, reset current session only
      whereClause.session = { isActive: true };
    }

    // Store deleted participations for undo functionality
    const participationsToDelete = await prisma.participation.findMany({
      where: whereClause,
      include: {
        student: true,
        session: true
      }
    });

    // Delete participations
    const result = await prisma.participation.deleteMany({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      affectedStudents: [...new Set(participationsToDelete.map(p => p.student.name))],
      undoData: participationsToDelete.map(p => ({
        studentId: p.studentId,
        roomId: p.roomId,
        sessionId: p.sessionId,
        points: p.points,
        status: p.status,
        submittedAt: p.submittedAt,
        approvedAt: p.approvedAt,
        rejectedAt: p.rejectedAt
      }))
    });
  } catch (error) {
    console.error('Error resetting class:', error);
    return NextResponse.json(
      { error: 'Failed to reset class data' },
      { status: 500 }
    );
  }
}
