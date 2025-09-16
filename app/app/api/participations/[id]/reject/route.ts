
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Reject a participation
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const participationId = params.id;
    
    const participation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date()
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
        rejectedAt: participation.rejectedAt
      }
    });
  } catch (error) {
    console.error('Error rejecting participation:', error);
    return NextResponse.json(
      { error: 'Failed to reject participation' },
      { status: 500 }
    );
  }
}
