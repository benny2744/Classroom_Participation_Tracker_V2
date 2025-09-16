
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get sessions for a room
export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    
    const sessions = await prisma.session.findMany({
      where: { roomId },
      include: {
        _count: {
          select: { participations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// Create new session
export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    const { name } = await request.json();
    
    // Deactivate current active session
    await prisma.session.updateMany({
      where: { roomId, isActive: true },
      data: { 
        isActive: false,
        endedAt: new Date()
      }
    });

    // Get session count for naming
    const sessionCount = await prisma.session.count({
      where: { roomId }
    });

    // Create new active session
    const session = await prisma.session.create({
      data: {
        roomId,
        name: name || `Session ${sessionCount + 1}`,
        isActive: true
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
