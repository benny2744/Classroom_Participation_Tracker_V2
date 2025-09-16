
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get room statistics
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        teacher: true,
        sessions: true,
        students: {
          include: {
            participations: true
          }
        },
        participations: true
      }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalStudents = room.students.length;
    const totalSessions = room.sessions.length;
    const totalParticipations = room.participations.length;
    const approvedParticipations = room.participations.filter(p => p.status === 'APPROVED').length;
    const pendingParticipations = room.participations.filter(p => p.status === 'PENDING').length;
    const rejectedParticipations = room.participations.filter(p => p.status === 'REJECTED').length;
    
    // Most active students
    const studentStats = room.students.map(student => {
      const approved = student.participations.filter(p => p.status === 'APPROVED');
      const totalPoints = approved.reduce((sum, p) => sum + p.points, 0);
      return {
        name: student.name,
        totalPoints,
        participationsCount: approved.length,
        pendingCount: student.participations.filter(p => p.status === 'PENDING').length
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    // Session stats
    const sessionStats = room.sessions.map(session => {
      const sessionParticipations = room.participations.filter(p => p.sessionId === session.id);
      return {
        id: session.id,
        name: session.name,
        isActive: session.isActive,
        participationsCount: sessionParticipations.length,
        approvedCount: sessionParticipations.filter(p => p.status === 'APPROVED').length,
        startedAt: session.startedAt,
        endedAt: session.endedAt
      };
    });

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        code: room.code,
        teacher: room.teacher.name,
        isActive: room.isActive,
        createdAt: room.createdAt
      },
      stats: {
        totalStudents,
        totalSessions,
        totalParticipations,
        approvedParticipations,
        pendingParticipations,
        rejectedParticipations,
        approvalRate: totalParticipations > 0 ? Math.round((approvedParticipations / totalParticipations) * 100) : 0
      },
      topStudents: studentStats.slice(0, 10),
      allStudents: studentStats,
      sessions: sessionStats
    });
  } catch (error) {
    console.error('Error fetching room stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room statistics' },
      { status: 500 }
    );
  }
}
