

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Acknowledge a hand raise (different from approve - just removes it from queue)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const participationId = params.id;
    
    // Find the participation first to verify it's a hand raise
    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: { student: true, session: true }
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'Participation not found' },
        { status: 404 }
      );
    }

    if (participation.type !== 'RAISE_HAND') {
      return NextResponse.json(
        { error: 'Only hand raises can be acknowledged' },
        { status: 400 }
      );
    }

    // Update the participation to acknowledged status
    const updatedParticipation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        status: 'APPROVED', // We'll use APPROVED status but with acknowledgedAt timestamp
        acknowledgedAt: new Date()
      },
      include: {
        student: true,
        session: true
      }
    });

    return NextResponse.json({
      success: true,
      participation: {
        id: updatedParticipation.id,
        studentName: updatedParticipation.student.name,
        type: updatedParticipation.type,
        status: updatedParticipation.status,
        acknowledgedAt: updatedParticipation.acknowledgedAt
      }
    });
  } catch (error) {
    console.error('Error acknowledging hand raise:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge hand raise' },
      { status: 500 }
    );
  }
}
