
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;
    const formData = await request.formData();
    const csvFile = formData.get('csvFile') as File;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    if (!csvFile) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      );
    }

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

    // Get existing students to avoid duplicates
    const existingStudents = await prisma.student.findMany({
      where: { roomId },
      select: { name: true }
    });
    
    const existingNames = new Set(existingStudents.map(s => s.name));
    const newStudentNames = studentNames.filter(name => !existingNames.has(name));

    if (newStudentNames.length === 0) {
      return NextResponse.json(
        { error: 'All students in the CSV already exist in this room' },
        { status: 400 }
      );
    }

    // Create new students
    const studentsData = newStudentNames.map(studentName => ({
      name: studentName,
      roomId: roomId
    }));

    await prisma.student.createMany({
      data: studentsData,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      studentsAdded: newStudentNames.length,
      duplicatesSkipped: studentNames.length - newStudentNames.length,
      newStudents: newStudentNames
    });
  } catch (error) {
    console.error('Error uploading students:', error);
    return NextResponse.json(
      { error: 'Failed to upload students' },
      { status: 500 }
    );
  }
}
