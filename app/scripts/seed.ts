
import { PrismaClient, ParticipationStatus } from '@prisma/client';
import { generateRoomCode } from '../lib/room-utils';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test teachers
  const teacher1Password = await bcrypt.hash('password123', 10);
  const teacher2Password = await bcrypt.hash('password456', 10);
  
  const teacher1 = await prisma.teacher.upsert({
    where: { email: 'dr.smith@university.edu' },
    update: {},
    create: {
      name: 'Dr. Sarah Smith',
      email: 'dr.smith@university.edu',
      password: teacher1Password,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { email: 'prof.johnson@university.edu' },
    update: {},
    create: {
      name: 'Prof. Michael Johnson',
      email: 'prof.johnson@university.edu',
      password: teacher2Password,
    },
  });

  console.log('✅ Teachers created');

  // Create test rooms
  const room1 = await prisma.room.upsert({
    where: { code: 'MATH01' },
    update: {},
    create: {
      code: 'MATH01',
      name: 'Advanced Mathematics 101',
      description: 'Advanced calculus and linear algebra course for undergraduate students',
      teacherId: teacher1.id,
      isActive: true,
    },
  });

  const room2 = await prisma.room.upsert({
    where: { code: 'PHYS02' },
    update: {},
    create: {
      code: 'PHYS02',
      name: 'Quantum Physics Laboratory',
      description: 'Hands-on quantum physics experiments and theoretical discussions',
      teacherId: teacher1.id,
      isActive: true,
    },
  });

  const room3 = await prisma.room.upsert({
    where: { code: 'COMP03' },
    update: {},
    create: {
      code: 'COMP03',
      name: 'Computer Science Fundamentals',
      description: 'Introduction to programming and computer science concepts',
      teacherId: teacher2.id,
      isActive: true,
    },
  });

  console.log('✅ Rooms created');

  // Create sessions for each room
  const session1 = await prisma.session.upsert({
    where: { id: room1.id + '-session-1' },
    update: {},
    create: {
      id: room1.id + '-session-1',
      name: 'Week 1: Introduction to Calculus',
      roomId: room1.id,
      isActive: true,
    },
  });

  const session2 = await prisma.session.upsert({
    where: { id: room2.id + '-session-1' },
    update: {},
    create: {
      id: room2.id + '-session-1',
      name: 'Quantum Mechanics Basics',
      roomId: room2.id,
      isActive: true,
    },
  });

  const session3 = await prisma.session.upsert({
    where: { id: room3.id + '-session-1' },
    update: {},
    create: {
      id: room3.id + '-session-1',
      name: 'Programming Fundamentals',
      roomId: room3.id,
      isActive: true,
    },
  });

  console.log('✅ Sessions created');

  // Create test students for room1 (Math)
  const mathStudents = [
    'Alice Johnson', 'Bob Chen', 'Carol Davis', 'David Rodriguez', 'Emma Wilson',
    'Frank Martinez', 'Grace Kim', 'Henry Thompson', 'Isabella Garcia', 'Jack Anderson',
    'Karen Lee', 'Luis Santos', 'Maya Patel', 'Noah Brown', 'Olivia Taylor'
  ];

  const createdMathStudents = [];
  for (const name of mathStudents) {
    const student = await prisma.student.upsert({
      where: { 
        name_roomId: { name, roomId: room1.id }
      },
      update: {},
      create: {
        name,
        roomId: room1.id,
      },
    });
    createdMathStudents.push(student);
  }

  // Create test students for room2 (Physics)
  const physicsStudents = [
    'Alex Cooper', 'Bella Singh', 'Chris Wang', 'Diana Lopez', 'Ethan Miller',
    'Fiona Clark', 'Gabriel Torres', 'Hannah White', 'Ian Baker', 'Julia Kim'
  ];

  const createdPhysicsStudents = [];
  for (const name of physicsStudents) {
    const student = await prisma.student.upsert({
      where: { 
        name_roomId: { name, roomId: room2.id }
      },
      update: {},
      create: {
        name,
        roomId: room2.id,
      },
    });
    createdPhysicsStudents.push(student);
  }

  // Create test students for room3 (Computer Science)
  const csStudents = [
    'Aaron Scott', 'Brenda Adams', 'Carlos Mitchell', 'Deborah Young', 'Edward Hall',
    'Felicia Green', 'George Allen', 'Helen King', 'Ivan Wright', 'Jessica Hill',
    'Kevin Lewis', 'Linda Walker'
  ];

  const createdCSStudents = [];
  for (const name of csStudents) {
    const student = await prisma.student.upsert({
      where: { 
        name_roomId: { name, roomId: room3.id }
      },
      update: {},
      create: {
        name,
        roomId: room3.id,
      },
    });
    createdCSStudents.push(student);
  }

  console.log('✅ Students created');

  // Create sample participations for Math class
  const mathParticipations = [
    { student: createdMathStudents[0], points: 3, status: ParticipationStatus.APPROVED },
    { student: createdMathStudents[1], points: 2, status: ParticipationStatus.APPROVED },
    { student: createdMathStudents[2], points: 1, status: ParticipationStatus.APPROVED },
    { student: createdMathStudents[0], points: 2, status: ParticipationStatus.APPROVED },
    { student: createdMathStudents[3], points: 3, status: ParticipationStatus.PENDING },
    { student: createdMathStudents[4], points: 1, status: ParticipationStatus.APPROVED },
    { student: createdMathStudents[5], points: 2, status: ParticipationStatus.REJECTED },
    { student: createdMathStudents[1], points: 3, status: ParticipationStatus.PENDING },
    { student: createdMathStudents[6], points: 1, status: ParticipationStatus.APPROVED },
    { student: createdMathStudents[7], points: 2, status: ParticipationStatus.APPROVED },
  ];

  for (const participation of mathParticipations) {
    let approvedAt: Date | null = null;
    let rejectedAt: Date | null = null;
    
    if (participation.status === ParticipationStatus.APPROVED) {
      approvedAt = new Date();
    } else if (participation.status === ParticipationStatus.REJECTED) {
      rejectedAt = new Date();
    }
    
    await prisma.participation.create({
      data: {
        studentId: participation.student.id,
        roomId: room1.id,
        sessionId: session1.id,
        points: participation.points,
        status: participation.status,
        submittedAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
        approvedAt,
        rejectedAt,
      },
    });
  }

  // Create sample participations for Physics class
  const physicsParticipations = [
    { student: createdPhysicsStudents[0], points: 2, status: ParticipationStatus.APPROVED },
    { student: createdPhysicsStudents[1], points: 3, status: ParticipationStatus.APPROVED },
    { student: createdPhysicsStudents[2], points: 1, status: ParticipationStatus.PENDING },
    { student: createdPhysicsStudents[0], points: 1, status: ParticipationStatus.APPROVED },
    { student: createdPhysicsStudents[3], points: 2, status: ParticipationStatus.APPROVED },
    { student: createdPhysicsStudents[4], points: 3, status: ParticipationStatus.PENDING },
    { student: createdPhysicsStudents[5], points: 1, status: ParticipationStatus.REJECTED },
  ];

  for (const participation of physicsParticipations) {
    let approvedAt: Date | null = null;
    let rejectedAt: Date | null = null;
    
    if (participation.status === ParticipationStatus.APPROVED) {
      approvedAt = new Date();
    } else if (participation.status === ParticipationStatus.REJECTED) {
      rejectedAt = new Date();
    }
    
    await prisma.participation.create({
      data: {
        studentId: participation.student.id,
        roomId: room2.id,
        sessionId: session2.id,
        points: participation.points,
        status: participation.status,
        submittedAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
        approvedAt,
        rejectedAt,
      },
    });
  }

  // Create sample participations for CS class
  const csParticipations = [
    { student: createdCSStudents[0], points: 3, status: ParticipationStatus.APPROVED },
    { student: createdCSStudents[1], points: 2, status: ParticipationStatus.APPROVED },
    { student: createdCSStudents[2], points: 2, status: ParticipationStatus.PENDING },
    { student: createdCSStudents[3], points: 1, status: ParticipationStatus.APPROVED },
    { student: createdCSStudents[0], points: 1, status: ParticipationStatus.APPROVED },
    { student: createdCSStudents[4], points: 2, status: ParticipationStatus.REJECTED },
  ];

  for (const participation of csParticipations) {
    let approvedAt: Date | null = null;
    let rejectedAt: Date | null = null;
    
    if (participation.status === ParticipationStatus.APPROVED) {
      approvedAt = new Date();
    } else if (participation.status === ParticipationStatus.REJECTED) {
      rejectedAt = new Date();
    }
    
    await prisma.participation.create({
      data: {
        studentId: participation.student.id,
        roomId: room3.id,
        sessionId: session3.id,
        points: participation.points,
        status: participation.status,
        submittedAt: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
        approvedAt,
        rejectedAt,
      },
    });
  }

  console.log('✅ Participations created');

  console.log('\n🎉 Database seeding completed!');
  console.log('\n📋 Test Data Summary:');
  console.log(`   Teachers: ${[teacher1, teacher2].length}`);
  console.log(`   Rooms: ${[room1, room2, room3].length}`);
  console.log(`   Students: ${mathStudents.length + physicsStudents.length + csStudents.length}`);
  console.log(`   Participations: ${mathParticipations.length + physicsParticipations.length + csParticipations.length}`);
  
  console.log('\n🔑 Room Codes for Testing:');
  console.log(`   Math 101: MATH01`);
  console.log(`   Physics Lab: PHYS02`);
  console.log(`   CS Fundamentals: COMP03`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
