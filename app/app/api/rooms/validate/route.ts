
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRoomCode } from '@/lib/room-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    
    if (!code || !validateRoomCode(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format', valid: false },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        teacher: true,
        sessions: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found', valid: false },
        { status: 404 }
      );
    }

    if (!room.isActive) {
      return NextResponse.json(
        { error: 'Room is not active', valid: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      room: {
        id: room.id,
        name: room.name,
        code: room.code,
        teacher: room.teacher.name,
        hasActiveSession: room.sessions.length > 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate room code', valid: false },
      { status: 500 }
    );
  }
}
