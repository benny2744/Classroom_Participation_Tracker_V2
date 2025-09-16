
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Reset individual student's participation data
export async function POST(request: Request) {
  try {
    const { studentId, sessionId } = await request.json();
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const whereClause: any = { studentId };
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
      studentName: participationsToDelete[0]?.student?.name || 'Unknown',
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
    console.error('Error resetting student:', error);
    return NextResponse.json(
      { error: 'Failed to reset student data' },
      { status: 500 }
    );
  }
}
