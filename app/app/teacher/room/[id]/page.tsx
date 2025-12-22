
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  Settings, 
  Download, 
  ArrowLeft,
  Copy,
  Eye,
  TrendingUp,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  ChevronDown,
  FileText,
  UserPlus,
  UserMinus,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface RoomStats {
  room: {
    id: string;
    name: string;
    code: string;
    teacher: string;
    isActive: boolean;
    createdAt: string;
  };
  stats: {
    totalStudents: number;
    totalSessions: number;
    totalParticipations: number;
    approvedParticipations: number;
    pendingParticipations: number;
    rejectedParticipations: number;
    approvalRate: number;
  };
  topStudents: Array<{
    name: string;
    totalPoints: number;
    participationsCount: number;
    pendingCount: number;
  }>;
  sessions: Array<{
    id: string;
    name: string;
    isActive: boolean;
    participationsCount: number;
    approvedCount: number;
    startedAt: string;
    endedAt?: string;
  }>;
}

interface RosterStudent {
  id: string;
  name: string;
  totalPoints: number;
  participationsCount: number;
  pendingCount: number;
  createdAt: string;
}

export default function RoomManagementPage({ params }: { params: { id: string } }) {
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Roster management state
  const [rosterStudents, setRosterStudents] = useState<RosterStudent[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState<string | null>(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);

  useEffect(() => {
    fetchRoomStats();
  }, [params.id]);

  const fetchRoomStats = async () => {
    try {
      const response = await fetch(`/participation/api/rooms/${params.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setRoomStats(data);
      } else {
        toast.error('Failed to load room statistics');
      }
    } catch (error) {
      console.error('Error fetching room stats:', error);
      toast.error('Failed to load room statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Room code copied to clipboard!');
  };

  const handleExportCSV = (type: 'logs' | 'totals' = 'logs') => {
    window.open(`/participation/api/export/csv?roomId=${params.id}&type=${type}`, '_blank');
  };

  // Roster management functions
  const fetchRoster = async () => {
    setIsLoadingRoster(true);
    try {
      const response = await fetch(`/participation/api/rooms/${params.id}/students`);
      if (response.ok) {
        const data = await response.json();
        setRosterStudents(data.students || []);
      } else {
        toast.error('Failed to load roster');
      }
    } catch (error) {
      console.error('Error fetching roster:', error);
      toast.error('Failed to load roster');
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
      toast.error('Please enter a student name');
      return;
    }

    setIsAddingStudent(true);
    try {
      const response = await fetch(`/participation/api/rooms/${params.id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: newStudentName.trim() })
      });

      if (response.ok) {
        toast.success(`Added "${newStudentName.trim()}" to roster`);
        setNewStudentName('');
        fetchRoster();
        fetchRoomStats(); // Update stats
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add student');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    setIsDeletingStudent(studentId);
    try {
      const response = await fetch(`/participation/api/rooms/${params.id}/students/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || `Removed "${studentName}" from roster`);
        fetchRoster();
        fetchRoomStats(); // Update stats
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Failed to remove student');
    } finally {
      setIsDeletingStudent(null);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCSV(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch(`/participation/api/rooms/${params.id}/upload-students`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Added ${data.studentsAdded} students to roster`);
        if (data.duplicatesSkipped > 0) {
          toast.info(`${data.duplicatesSkipped} duplicates were skipped`);
        }
        fetchRoster();
        fetchRoomStats(); // Update stats
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to upload CSV');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV');
    } finally {
      setIsUploadingCSV(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!roomStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Room not found</p>
          <Link href="/teacher" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <Link 
              href="/teacher"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{roomStats.room.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Room Code:</span>
                <code className="font-mono text-lg font-bold bg-gray-100 px-2 py-1 rounded">
                  {roomStats.room.code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyRoomCode(roomStats.room.code)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant={roomStats.room.isActive ? "default" : "secondary"}>
                {roomStats.room.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Link href={`/teacher/room/${params.id}/presentation`}>
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                Presentation View
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportCSV('totals')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Student Totals
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportCSV('logs')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Participation Logs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomStats.stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Registered participants
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomStats.stats.totalParticipations}</div>
              <p className="text-xs text-muted-foreground">
                {roomStats.stats.approvedParticipations} approved
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomStats.stats.approvalRate}%</div>
              <p className="text-xs text-muted-foreground">
                Of all submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomStats.stats.pendingParticipations}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="students" className="space-y-6" onValueChange={(value) => {
          if (value === 'settings' && rosterStudents.length === 0) {
            fetchRoster();
          }
        }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Top Students</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Top Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Performing Students
                </CardTitle>
                <CardDescription>
                  Students ranked by total approved participation points
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roomStats.topStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No students have participated yet</p>
                    <p className="text-sm text-gray-500">Students will appear here after their first participation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roomStats.topStudents.map((student, index) => (
                      <div key={`${student.name}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            index === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {student.name}
                              {index < 3 && <Trophy className="w-4 h-4 text-yellow-500" />}
                            </p>
                            <p className="text-sm text-gray-600">
                              {student.participationsCount} approved participations
                              {student.pendingCount > 0 && (
                                <span className="ml-2 text-amber-600">
                                  • {student.pendingCount} pending
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">
                            {student.totalPoints}
                          </div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Session History
                </CardTitle>
                <CardDescription>
                  All sessions for this room with participation statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roomStats.sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sessions created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roomStats.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{session.name}</h3>
                            <Badge variant={session.isActive ? "default" : "secondary"}>
                              {session.isActive ? 'Active' : 'Ended'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Started: {new Date(session.startedAt).toLocaleString()}</p>
                            {session.endedAt && (
                              <p>Ended: {new Date(session.endedAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{session.approvedCount}</div>
                          <div className="text-xs text-gray-500">approved</div>
                          <div className="text-sm text-gray-600">
                            of {session.participationsCount} total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Participation Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Approved
                      </span>
                      <span className="font-bold text-green-600">
                        {roomStats.stats.approvedParticipations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Pending
                      </span>
                      <span className="font-bold text-amber-600">
                        {roomStats.stats.pendingParticipations}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Rejected
                      </span>
                      <span className="font-bold text-red-600">
                        {roomStats.stats.rejectedParticipations}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold">
                      <span>Total Submissions</span>
                      <span>{roomStats.stats.totalParticipations}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Room Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Average Points per Student</span>
                      <span className="font-bold">
                        {roomStats.stats.totalStudents > 0 
                          ? Math.round((roomStats.stats.approvedParticipations) / roomStats.stats.totalStudents * 10) / 10
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Approval Rate</span>
                      <span className="font-bold text-green-600">
                        {roomStats.stats.approvalRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Sessions</span>
                      <span className="font-bold">
                        {roomStats.sessions.filter(s => s.isActive).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Sessions</span>
                      <span className="font-bold">
                        {roomStats.stats.totalSessions}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Student */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add Student
                  </CardTitle>
                  <CardDescription>
                    Add a single student to the roster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        placeholder="Enter student name"
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        disabled={isAddingStudent}
                      />
                    </div>
                    <Button type="submit" disabled={isAddingStudent || !newStudentName.trim()}>
                      {isAddingStudent ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Student
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Upload CSV */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Bulk Upload
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file with student names (one name per line)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload a CSV file with student names
                      </p>
                      <Label htmlFor="csvUpload" className="cursor-pointer">
                        <Button variant="outline" asChild disabled={isUploadingCSV}>
                          <span>
                            {isUploadingCSV ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Select CSV File
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="csvUpload"
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCSVUpload}
                        className="hidden"
                        disabled={isUploadingCSV}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roster List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Student Roster ({rosterStudents.length})
                      </CardTitle>
                      <CardDescription>
                        Manage students in this room
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchRoster}
                      disabled={isLoadingRoster}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingRoster ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingRoster ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Loading roster...</p>
                    </div>
                  ) : rosterStudents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No students in roster</p>
                      <p className="text-sm text-gray-500">Add students using the form above or upload a CSV file</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {rosterStudents
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((student) => (
                        <div 
                          key={student.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-gray-500">
                                {student.totalPoints} points • {student.participationsCount} participations
                                {student.pendingCount > 0 && (
                                  <span className="text-amber-600"> • {student.pendingCount} pending</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isDeletingStudent === student.id}
                              >
                                {isDeletingStudent === student.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Student?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove <strong>{student.name}</strong> from the roster?
                                  {student.participationsCount > 0 && (
                                    <span className="block mt-2 text-amber-600">
                                      Warning: This will also delete {student.participationsCount} participation record{student.participationsCount !== 1 ? 's' : ''} for this student.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteStudent(student.id, student.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Student
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
