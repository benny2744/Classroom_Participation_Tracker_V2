
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, Users, BarChart3, Calendar, Settings, ArrowLeft, Copy, Upload, Trash2, LogOut } from 'lucide-react';
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Form states
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);
  const [uploadCsvFile, setUploadCsvFile] = useState<File | null>(null);
  const [uploadCsvPreview, setUploadCsvPreview] = useState<string[]>([]);
  const [selectedRoomForUpload, setSelectedRoomForUpload] = useState<string | null>(null);
  const [isUploadingStudents, setIsUploadingStudents] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState<string | null>(null);
  
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

  const handleLogin = async () => {
    if (!teacherEmail.trim() || !teacherPassword.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherEmail, password: teacherPassword })
      });

      if (response.ok) {
        const data = await response.json();
        setTeacher(data.user);
        localStorage.setItem('teacher', JSON.stringify(data.user));
        setShowTeacherSetup(false);
        fetchRooms(data.user.id);
        toast.success('Logged in successfully!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to login');
      }
    } catch (error) {
      toast.error('Failed to login');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegister = async () => {
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (teacherPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (teacherPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsAuthenticating(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: teacherName, 
          email: teacherEmail,
          password: teacherPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setTeacher(data.user);
        localStorage.setItem('teacher', JSON.stringify(data.user));
        setShowTeacherSetup(false);
        fetchRooms(data.user.id);
        toast.success('Account created successfully!');
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (error) {
      toast.error('Failed to create account');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCsvFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCsvFile(null);
      setCsvPreview([]);
      return;
    }

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      event.target.value = '';
      return;
    }

    setCsvFile(file);

    // Parse CSV for preview
    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      const studentNames = lines.map(line => {
        // Handle potential quotes and commas
        return line.replace(/^"|"$/g, '').split(',')[0].trim();
      }).filter(name => name);

      setCsvPreview(studentNames.slice(0, 10)); // Show first 10 names
    } catch (error) {
      toast.error('Failed to parse CSV file');
      setCsvFile(null);
      setCsvPreview([]);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      toast.error('Room name is required');
      return;
    }

    if (!csvFile) {
      toast.error('Please upload a CSV file with student names');
      return;
    }

    if (!teacher) return;

    setIsCreatingRoom(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', roomName);
      formData.append('description', roomDescription);
      formData.append('teacherId', teacher.id);
      formData.append('csvFile', csvFile);

      const response = await fetch('/api/rooms', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setRooms([data, ...rooms]);
        setShowCreateDialog(false);
        setRoomName('');
        setRoomDescription('');
        setCsvFile(null);
        setCsvPreview([]);
        toast.success(`Room created! Code: ${data.code}. Added ${data.studentsAdded} students.`);
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

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    setIsDeletingRoom(roomId);

    try {
      const response = await fetch(`/api/rooms/${roomId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setRooms(rooms.filter(room => room.id !== roomId));
        toast.success(`Room "${roomName}" deleted successfully`);
      } else {
        toast.error(data.error || 'Failed to delete room');
      }
    } catch (error) {
      toast.error('Failed to delete room');
    } finally {
      setIsDeletingRoom(null);
    }
  };

  const handleUploadCsvFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUploadCsvFile(null);
      setUploadCsvPreview([]);
      return;
    }

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      event.target.value = '';
      return;
    }

    setUploadCsvFile(file);

    // Parse CSV for preview
    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      const studentNames = lines.map(line => {
        // Handle potential quotes and commas
        return line.replace(/^"|"$/g, '').split(',')[0].trim();
      }).filter(name => name);

      setUploadCsvPreview(studentNames.slice(0, 10)); // Show first 10 names
    } catch (error) {
      toast.error('Failed to parse CSV file');
      setUploadCsvFile(null);
      setUploadCsvPreview([]);
    }
  };

  const handleUploadStudents = async (roomId: string) => {
    if (!uploadCsvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    setIsUploadingStudents(true);

    try {
      const formData = new FormData();
      formData.append('csvFile', uploadCsvFile);

      const response = await fetch(`/api/rooms/${roomId}/upload-students`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Added ${data.studentsAdded} new students${data.duplicatesSkipped > 0 ? ` (${data.duplicatesSkipped} duplicates skipped)` : ''}`);
        setUploadCsvFile(null);
        setUploadCsvPreview([]);
        setSelectedRoomForUpload(null);
        // Refresh room data
        fetchRooms(teacher?.id || '');
      } else {
        toast.error(data.error || 'Failed to upload students');
      }
    } catch (error) {
      toast.error('Failed to upload students');
    } finally {
      setIsUploadingStudents(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teacher');
    setTeacher(null);
    setRooms([]);
    setShowTeacherSetup(true);
    toast.success('Logged out successfully');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {authMode === 'login' ? 'Teacher Login' : 'Teacher Registration'}
            </h1>
            <p className="text-gray-600">
              {authMode === 'login' 
                ? 'Sign in to your teacher account' 
                : 'Create your teacher profile to get started'
              }
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {authMode === 'login' 
                  ? 'Enter your credentials to access your dashboard' 
                  : 'This information will be displayed to students'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <Label htmlFor="teacherName">Full Name</Label>
                  <Input
                    id="teacherName"
                    placeholder="Dr. Smith"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </div>
              )}
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
              <div>
                <Label htmlFor="teacherPassword">Password</Label>
                <Input
                  id="teacherPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                />
              </div>
              {authMode === 'register' && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}
              <Button 
                onClick={authMode === 'login' ? handleLogin : handleRegister}
                disabled={isAuthenticating}
                className="w-full"
              >
                {isAuthenticating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  authMode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
              <div className="text-center pt-4">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setTeacherName('');
                    setTeacherEmail('');
                    setTeacherPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  {authMode === 'login' 
                    ? "Don't have an account? Create one" 
                    : 'Already have an account? Sign in'
                  }
                </button>
              </div>
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
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
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
                <div>
                  <Label htmlFor="csvFile">Student Roster (CSV File)</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a CSV file with one student name per line (first column only)
                  </p>
                </div>
                {csvPreview.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">Preview ({csvPreview.length} names):</p>
                    <div className="text-sm text-gray-700 space-y-1">
                      {csvPreview.map((name, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          {name}
                        </div>
                      ))}
                      {csvFile && csvPreview.length < 10 && (
                        <div className="text-xs text-gray-500">
                          ... and potentially more in the file
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
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
                  <div className="space-y-2">
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
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedRoomForUpload(room.id)}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Add Students
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Students to {room.name}</DialogTitle>
                            <DialogDescription>
                              Upload a CSV file with student names to add to this room
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="uploadCsv">Student CSV File</Label>
                              <Input
                                id="uploadCsv"
                                type="file"
                                accept=".csv"
                                onChange={handleUploadCsvFileChange}
                                className="cursor-pointer"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Upload a CSV file with one student name per line
                              </p>
                            </div>
                            {uploadCsvPreview.length > 0 && (
                              <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                                <p className="text-sm font-medium mb-2">Preview ({uploadCsvPreview.length} names):</p>
                                <div className="text-sm text-gray-700 space-y-1">
                                  {uploadCsvPreview.map((name, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs flex items-center justify-center">
                                        {index + 1}
                                      </span>
                                      {name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedRoomForUpload(null);
                                  setUploadCsvFile(null);
                                  setUploadCsvPreview([]);
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => handleUploadStudents(room.id)}
                                disabled={!uploadCsvFile || isUploadingStudents}
                                className="flex-1"
                              >
                                {isUploadingStudents ? 'Uploading...' : 'Add Students'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Room "{room.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the room,
                              all student data ({room._count.students} students), and all participation 
                              records ({room._count.participations} participations).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteRoom(room.id, room.name)}
                              disabled={isDeletingRoom === room.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isDeletingRoom === room.id ? 'Deleting...' : 'Delete Room'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
