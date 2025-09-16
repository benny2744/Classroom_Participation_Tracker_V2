
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Approve a participation
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const participationId = params.id;
    
    const participation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
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
        approvedAt: participation.approvedAt
      }
    });
  } catch (error) {
    console.error('Error approving participation:', error);
    return NextResponse.json(
      { error: 'Failed to approve participation' },
      { status: 500 }
    );
  }
}
