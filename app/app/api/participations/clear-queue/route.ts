import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Clear all pending participations in a room (reject them)
export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Reject all pending participations
    const result = await prisma.participation.updateMany({
      where: {
        roomId,
        status: 'PENDING'
      },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      rejectedCount: result.count
    });
  } catch (error) {
    console.error('Error clearing queue:', error);
    return NextResponse.json(
      { error: 'Failed to clear queue' },
      { status: 500 }
    );
  }
}


