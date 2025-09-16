
export interface Teacher {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  name: string;
  isActive: boolean;
  roomId: string;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participation {
  id: string;
  points: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  studentId: string;
  roomId: string;
  sessionId: string;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RoomValidation {
  valid: boolean;
  room?: {
    id: string;
    name: string;
    code: string;
    teacher: string;
    hasActiveSession: boolean;
  };
  error?: string;
}

export interface ParticipationSubmission {
  studentName: string;
  roomId: string;
  points: number;
}

export interface PendingParticipation {
  id: string;
  studentName: string;
  points: number;
  submittedAt: string;
  sessionName: string;
}
