
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: {
            students: true,
            participations: true,
            sessions: true
          }
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Delete room (cascade will handle students, sessions, and participations)
    await prisma.room.delete({
      where: { id: roomId }
    });

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
      deletedCounts: {
        students: room._count.students,
        participations: room._count.participations,
        sessions: room._count.sessions
      }
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}
