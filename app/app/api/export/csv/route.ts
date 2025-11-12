
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Export participation data as CSV
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');
    const sessionId = url.searchParams.get('sessionId');
    const exportType = url.searchParams.get('type') || 'logs'; // 'logs' or 'totals'
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get room info
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { teacher: true }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];

    // Export totals (current total points per student)
    if (exportType === 'totals') {
      // Build participations where clause
      const participationsWhere: any = { status: 'APPROVED' };
      if (sessionId && sessionId !== 'all') {
        participationsWhere.sessionId = sessionId;
      }

      // Get all students in the room with their participations
      const students = await prisma.student.findMany({
        where: { roomId },
        include: {
          participations: {
            where: participationsWhere
          }
        },
        orderBy: { name: 'asc' }
      });

      // Calculate total points for each student
      const studentsWithTotals = students.map(student => {
        const totalPoints = student.participations.reduce((sum, p) => sum + p.points, 0);
        return {
          name: student.name,
          totalPoints
        };
      });

      // Create CSV content for totals
      const csvHeader = 'Student Name,Total Points,Room,Teacher\n';
      const csvRows = studentsWithTotals.map(s => [
        `"${s.name}"`,
        s.totalPoints.toString(),
        `"${room.name}"`,
        `"${room.teacher?.name || 'Unknown Teacher'}"`
      ].join(','));

      const csvContent = csvHeader + csvRows.join('\n');
      const filename = `student_totals_${room.code}_${timestamp}.csv`;

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Export logs (default behavior - individual participation records)
    const whereClause: any = { roomId };
    if (sessionId && sessionId !== 'all') {
      whereClause.sessionId = sessionId;
    }

    // Get participation data
    const participations = await prisma.participation.findMany({
      where: whereClause,
      include: {
        student: true,
        session: true
      },
      orderBy: [
        { session: { createdAt: 'asc' } },
        { student: { name: 'asc' } },
        { submittedAt: 'asc' }
      ]
    });

    // Create CSV content for logs
    const csvHeader = 'Student Name,Points,Status,Submitted At,Approved/Rejected At,Session,Room,Teacher\n';
    
    const csvRows = participations.map(p => {
      const statusDate = p.status === 'APPROVED' 
        ? p.approvedAt?.toISOString() || ''
        : p.status === 'REJECTED' 
        ? p.rejectedAt?.toISOString() || ''
        : '';
      
      return [
        `"${p.student.name}"`,
        p.points.toString(),
        p.status,
        p.submittedAt.toISOString(),
        statusDate,
        `"${p.session.name}"`,
        `"${room.name}"`,
        `"${room.teacher?.name || 'Unknown Teacher'}"`
      ].join(',');
    });

    const csvContent = csvHeader + csvRows.join('\n');
    const filename = `participation_data_${room.code}_${timestamp}.csv`;

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
