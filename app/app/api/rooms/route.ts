
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode } from '@/lib/room-utils';

export const dynamic = 'force-dynamic';

// Create a new room
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const teacherId = formData.get('teacherId') as string;
    const csvFile = formData.get('csvFile') as File;
    
    if (!name || !teacherId) {
      return NextResponse.json(
        { error: 'Name and teacher ID are required' },
        { status: 400 }
      );
    }

    if (!csvFile) {
      return NextResponse.json(
        { error: 'CSV file with student names is required' },
        { status: 400 }
      );
    }

    // Parse CSV file
    const csvText = await csvFile.text();
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
    const studentNames = lines.map(line => {
      // Handle potential quotes and commas - take only first column
      return line.replace(/^"|"$/g, '').split(',')[0].trim();
    }).filter(name => name && name.length > 0);

    if (studentNames.length === 0) {
      return NextResponse.json(
        { error: 'CSV file must contain at least one student name' },
        { status: 400 }
      );
    }

    if (studentNames.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 students allowed per room' },
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

    // Create room and students in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create room
      const room = await tx.room.create({
        data: {
          name,
          description: description || null,
          code,
          teacherId
        },
        include: {
          teacher: true
        }
      });

      // Create initial session for the room
      await tx.session.create({
        data: {
          name: `${name} - Session 1`,
          roomId: room.id,
          isActive: true
        }
      });

      // Create students
      const studentsData = studentNames.map(studentName => ({
        name: studentName,
        roomId: room.id
      }));

      await tx.student.createMany({
        data: studentsData,
        skipDuplicates: true
      });

      // Get final room data with counts
      const finalRoom = await tx.room.findUnique({
        where: { id: room.id },
        include: {
          teacher: true,
          _count: {
            select: {
              students: true,
              sessions: true,
              participations: true
            }
          }
        }
      });

      return { room: finalRoom, studentsAdded: studentNames.length };
    });

    return NextResponse.json({
      ...result.room,
      studentsAdded: result.studentsAdded
    });
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
