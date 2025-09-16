
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/room-utils';

export const dynamic = 'force-dynamic';

// Create a new room
export async function POST(request: Request) {
  try {
    const { name, description, teacherId } = await request.json();
    
    if (!name || !teacherId) {
      return NextResponse.json(
        { error: 'Name and teacher ID are required' },
        { status: 400 }
      );
    }

    // Generate unique room code
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      attempts++;
      
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Failed to generate unique room code' },
          { status: 500 }
        );
      }
    } while (await prisma.room.findUnique({ where: { code } }));

    const room = await prisma.room.create({
      data: {
        name,
        description,
        code,
        teacherId
      },
      include: {
        teacher: true,
        _count: {
          select: {
            students: true,
            sessions: true
          }
        }
      }
    });

    // Create initial session for the room
    await prisma.session.create({
      data: {
        name: `${name} - Session 1`,
        roomId: room.id,
        isActive: true
      }
    });

    return NextResponse.json(room);
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}

// Get rooms for a teacher
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const teacherId = url.searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: { teacherId },
      include: {
        teacher: true,
        _count: {
          select: {
            students: true,
            sessions: true,
            participations: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
