
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Toggle session active status
export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    const { sessionId, isActive } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // If activating this session, deactivate others
    if (isActive) {
      await prisma.session.updateMany({
        where: { roomId, isActive: true },
        data: { 
          isActive: false,
          endedAt: new Date()
        }
      });
    }

    // Update the target session
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive,
        endedAt: isActive ? null : new Date()
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error toggling session:', error);
    return NextResponse.json(
      { error: 'Failed to toggle session' },
      { status: 500 }
    );
  }
}
