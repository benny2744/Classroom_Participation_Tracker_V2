
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get pending participations for approval queue
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    const pendingParticipations = await prisma.participation.findMany({
      where: {
        roomId,
        status: 'PENDING',
        session: { isActive: true }
      },
      include: {
        student: true,
        session: true
      },
      orderBy: { submittedAt: 'asc' }
    });

    const formattedParticipations = pendingParticipations.map(p => ({
      id: p.id,
      studentName: p.student.name,
      points: p.points,
      submittedAt: p.submittedAt,
      sessionName: p.session.name
    }));

    return NextResponse.json(formattedParticipations);
  } catch (error) {
    console.error('Error fetching pending participations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending participations' },
      { status: 500 }
    );
  }
}
