
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Export participation data as CSV
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');
    const sessionId = url.searchParams.get('sessionId');
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
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

    // Get room info
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { teacher: true }
    });

    // Create CSV content
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
        `"${room?.name || 'Unknown Room'}"`,
        `"${room?.teacher?.name || 'Unknown Teacher'}"`
      ].join(',');
    });

    const csvContent = csvHeader + csvRows.join('\n');
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `participation_data_${room?.code}_${timestamp}.csv`;

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
