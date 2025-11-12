import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Toggle whether to accept point requests for a room
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    
    // Get current room state
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Toggle the acceptPointRequests field
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        acceptPointRequests: !room.acceptPointRequests
      }
    });

    return NextResponse.json({
      success: true,
      acceptPointRequests: updatedRoom.acceptPointRequests
    });
  } catch (error) {
    console.error('Error toggling point requests:', error);
    return NextResponse.json(
      { error: 'Failed to toggle point requests' },
      { status: 500 }
    );
  }
}

// Get current state
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        acceptPointRequests: true
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      acceptPointRequests: room.acceptPointRequests
    });
  } catch (error) {
    console.error('Error fetching point requests setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting' },
      { status: 500 }
    );
  }
}


