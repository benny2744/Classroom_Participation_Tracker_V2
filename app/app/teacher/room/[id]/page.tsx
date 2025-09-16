
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  XCircle
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

export default function RoomManagementPage({ params }: { params: { id: string } }) {
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoomStats();
  }, [params.id]);

  const fetchRoomStats = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}/stats`);
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

  const handleExportCSV = () => {
    window.open(`/api/export/csv?roomId=${params.id}`, '_blank');
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
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
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
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Top Students</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
