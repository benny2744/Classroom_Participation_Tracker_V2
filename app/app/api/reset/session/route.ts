
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Reset entire session (create new session and deactivate old one)
export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get current active session info for undo
    const currentSession = await prisma.session.findFirst({
      where: { roomId, isActive: true },
      include: {
        participations: {
          include: {
            student: true
          }
        }
      }
    });

    if (!currentSession) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    // Deactivate current session
    await prisma.session.update({
      where: { id: currentSession.id },
      data: { 
        isActive: false,
        endedAt: new Date()
      }
    });

    // Get session count for naming
    const sessionCount = await prisma.session.count({
      where: { roomId }
    });

    // Create new session
    const newSession = await prisma.session.create({
      data: {
        roomId,
        name: `Session ${sessionCount + 1}`,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      previousSession: {
        id: currentSession.id,
        name: currentSession.name,
        participationsCount: currentSession.participations.length
      },
      newSession: {
        id: newSession.id,
        name: newSession.name
      }
    });
  } catch (error) {
    console.error('Error resetting session:', error);
    return NextResponse.json(
      { error: 'Failed to reset session' },
      { status: 500 }
    );
  }
}
