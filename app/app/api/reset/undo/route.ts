
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Undo reset operation by restoring participation data
export async function POST(request: Request) {
  try {
    const { undoData } = await request.json();
    
    if (!undoData || !Array.isArray(undoData)) {
      return NextResponse.json(
        { error: 'Invalid undo data' },
        { status: 400 }
      );
    }

    // Restore participations
    const restoredParticipations = await Promise.all(
      undoData.map(async (data: any) => {
        return await prisma.participation.create({
          data: {
            studentId: data.studentId,
            roomId: data.roomId,
            sessionId: data.sessionId,
            points: data.points,
            status: data.status,
            submittedAt: data.submittedAt,
            approvedAt: data.approvedAt,
            rejectedAt: data.rejectedAt,
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      restoredCount: restoredParticipations.length
    });
  } catch (error) {
    console.error('Error undoing reset:', error);
    return NextResponse.json(
      { error: 'Failed to undo reset operation' },
      { status: 500 }
    );
  }
}
