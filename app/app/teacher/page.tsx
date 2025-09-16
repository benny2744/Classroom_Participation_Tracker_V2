
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, Users, BarChart3, Calendar, Settings, ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Room {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  teacher: Teacher;
  _count: {
    students: number;
    sessions: number;
    participations: number;
  };
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTeacherSetup, setShowTeacherSetup] = useState(false);
  
  // Form states
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    // Check if teacher exists in localStorage
    const savedTeacher = localStorage.getItem('teacher');
    if (savedTeacher) {
      const teacherData = JSON.parse(savedTeacher);
      setTeacher(teacherData);
      fetchRooms(teacherData.id);
    } else {
      setShowTeacherSetup(true);
      setIsLoading(false);
    }
  }, []);

  const fetchRooms = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/rooms?teacherId=${teacherId}`);
      if (response.ok) {
        const roomsData = await response.json();
        setRooms(roomsData);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = async () => {
    if (!teacherName.trim() || !teacherEmail.trim()) {
      toast.error('Please enter both name and email');
      return;
    }

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teacherName, email: teacherEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setTeacher(data);
        localStorage.setItem('teacher', JSON.stringify(data));
        setShowTeacherSetup(false);
        fetchRooms(data.id);
        toast.success('Teacher profile created!');
      } else {
        toast.error(data.error || 'Failed to create teacher profile');
      }
    } catch (error) {
      toast.error('Failed to create teacher profile');
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Room name is required');
      return;
    }

    if (!teacher) return;

    setIsCreatingRoom(true);

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          description: roomDescription,
          teacherId: teacher.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRooms([data, ...rooms]);
        setShowCreateDialog(false);
        setRoomName('');
        setRoomDescription('');
        toast.success(`Room created! Code: ${data.code}`);
      } else {
        toast.error(data.error || 'Failed to create room');
      }
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showTeacherSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16 max-w-md">
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Setup</h1>
            <p className="text-gray-600">Create your teacher profile to get started</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Create Teacher Profile</CardTitle>
              <CardDescription>This information will be displayed to students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teacherName">Full Name</Label>
                <Input
                  id="teacherName"
                  placeholder="Dr. Smith"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="teacherEmail">Email Address</Label>
                <Input
                  id="teacherEmail"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCreateTeacher}
                className="w-full"
              >
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome back, {teacher?.name}</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Set up a new classroom for participation tracking
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="Math 101 - Spring 2024"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="roomDescription">Description (Optional)</Label>
                  <Textarea
                    id="roomDescription"
                    placeholder="Advanced mathematics course..."
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom}
                    className="flex-1"
                  >
                    {isCreatingRoom ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.length}</div>
              <p className="text-xs text-muted-foreground">
                {rooms.filter(r => r.isActive).length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rooms.reduce((sum, room) => sum + room._count.students, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all rooms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rooms.reduce((sum, room) => sum + room._count.participations, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {room.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={room.isActive ? "default" : "secondary"}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Room Code */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Room Code</p>
                      <p className="font-mono text-lg font-bold">{room.code}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyRoomCode(room.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded">
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="font-bold text-blue-600">{room._count.students}</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-sm text-gray-600">Sessions</p>
                      <p className="font-bold text-green-600">{room._count.sessions}</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <p className="text-sm text-gray-600">Participations</p>
                      <p className="font-bold text-purple-600">{room._count.participations}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/teacher/room/${room.id}/presentation`)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Present
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/teacher/room/${room.id}`)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
            <p className="text-gray-600 mb-6">Create your first classroom to start tracking participation</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Room
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
