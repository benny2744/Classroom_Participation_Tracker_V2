
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get students in a room with their participation data
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        students: {
          include: {
            participations: {
              where: {
                session: { isActive: true }
              },
              include: {
                session: true
              }
            }
          },
          orderBy: { name: 'asc' }
        },
        sessions: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Calculate total points for each student
    const studentsWithPoints = room.students.map(student => {
      const approvedParticipations = student.participations.filter(
        p => p.status === 'APPROVED'
      );
      const totalPoints = approvedParticipations.reduce((sum, p) => sum + p.points, 0);
      const pendingSubmissions = student.participations.filter(
        p => p.status === 'PENDING'
      );

      return {
        id: student.id,
        name: student.name,
        totalPoints,
        participationsCount: approvedParticipations.length,
        pendingCount: pendingSubmissions.length,
        createdAt: student.createdAt
      };
    });

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        code: room.code
      },
      students: studentsWithPoints,
      activeSession: room.sessions[0] || null
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// Add/Update student in room
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    const { studentName } = await request.json();
    
    if (!studentName?.trim()) {
      return NextResponse.json(
        { error: 'Student name is required' },
        { status: 400 }
      );
    }

    // Check if room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: roomId, isActive: true }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or inactive' },
        { status: 404 }
      );
    }

    // Try to find existing student or create new one
    const student = await prisma.student.upsert({
      where: {
        name_roomId: {
          name: studentName.trim(),
          roomId
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        name: studentName.trim(),
        roomId
      }
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    );
  }
}
