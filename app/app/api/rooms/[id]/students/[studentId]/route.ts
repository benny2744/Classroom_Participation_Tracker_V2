
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Delete a student from a room
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; studentId: string } }
) {
  try {
    const { id: roomId, studentId } = params;

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

    // Check if student exists and belongs to the room
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        roomId: roomId
      },
      include: {
        participations: {
          select: { id: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found in this room' },
        { status: 404 }
      );
    }

    // Delete the student (cascades to participations due to onDelete: Cascade)
    await prisma.student.delete({
      where: { id: studentId }
    });

    return NextResponse.json({
      success: true,
      message: `Student "${student.name}" removed from roster`,
      deletedStudent: {
        id: student.id,
        name: student.name,
        participationsDeleted: student.participations.length
      }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}


