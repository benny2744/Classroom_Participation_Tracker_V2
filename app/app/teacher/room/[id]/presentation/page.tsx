
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  Settings, 
  Download, 
  RotateCcw,
  AlertTriangle,
  Maximize2,
  ArrowLeft,
  Trophy,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  totalPoints: number;
  participationsCount: number;
  pendingCount: number;
}

interface PendingParticipation {
  id: string;
  studentName: string;
  points: number;
  type: 'POINTS' | 'RAISE_HAND';
  submittedAt: string;
}

interface Room {
  id: string;
  name: string;
  code: string;
}

interface Session {
  id: string;
  name: string;
  isActive: boolean;
}

export default function PresentationView({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [pendingParticipations, setPendingParticipations] = useState<PendingParticipation[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingApprovals, setProcessingApprovals] = useState<Set<string>>(new Set());
  const [undoData, setUndoData] = useState<any>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [processingPointAdjustments, setProcessingPointAdjustments] = useState<Set<string>>(new Set());
  const [processingBulkAdjustment, setProcessingBulkAdjustment] = useState(false);

  useEffect(() => {
    fetchAllData();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchAllData();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [params.id]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStudents(),
        fetchPendingParticipations()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}/students`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
        setStudents(data.students || []);
        setActiveSession(data.activeSession);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchPendingParticipations = async () => {
    try {
      const response = await fetch(`/api/participations/pending?roomId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPendingParticipations(data);
      }
    } catch (error) {
      console.error('Error fetching pending participations:', error);
    }
  };

  const handleApproval = async (participationId: string, action: 'approve' | 'reject') => {
    setProcessingApprovals(prev => new Set(prev).add(participationId));

    try {
      const response = await fetch(`/api/participations/${participationId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success(`Participation ${action}d!`);
        // Remove from pending list immediately for better UX
        setPendingParticipations(prev => prev.filter(p => p.id !== participationId));
        // Refresh data
        await fetchAllData();
      } else {
        toast.error(`Failed to ${action} participation`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} participation`);
    } finally {
      setProcessingApprovals(prev => {
        const newSet = new Set(prev);
        newSet.delete(participationId);
        return newSet;
      });
    }
  };

  const handleAcknowledge = async (participationId: string) => {
    setProcessingApprovals(prev => new Set(prev).add(participationId));

    try {
      const response = await fetch(`/api/participations/${participationId}/acknowledge`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Hand raise acknowledged!');
        // Remove from pending list immediately for better UX
        setPendingParticipations(prev => prev.filter(p => p.id !== participationId));
        // Refresh data
        await fetchAllData();
      } else {
        toast.error('Failed to acknowledge hand raise');
      }
    } catch (error) {
      toast.error('Failed to acknowledge hand raise');
    } finally {
      setProcessingApprovals(prev => {
        const newSet = new Set(prev);
        newSet.delete(participationId);
        return newSet;
      });
    }
  };

  const handleResetStudent = async (studentId: string, studentName: string) => {
    try {
      const response = await fetch('/api/reset/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      const data = await response.json();

      if (data.success) {
        setUndoData(data);
        toast.success(`Reset ${studentName} (${data.deletedCount} participations)`);
        fetchAllData();
      } else {
        toast.error('Failed to reset student');
      }
    } catch (error) {
      toast.error('Failed to reset student');
    }
  };

  const handleResetClass = async () => {
    try {
      const response = await fetch('/api/reset/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: params.id })
      });

      const data = await response.json();

      if (data.success) {
        setUndoData(data);
        toast.success(`Reset entire class (${data.deletedCount} participations)`);
        fetchAllData();
      } else {
        toast.error('Failed to reset class');
      }
    } catch (error) {
      toast.error('Failed to reset class');
    }
  };

  const handleResetSession = async () => {
    try {
      const response = await fetch('/api/reset/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: params.id })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`New session started: ${data.newSession.name}`);
        fetchAllData();
      } else {
        toast.error('Failed to reset session');
      }
    } catch (error) {
      toast.error('Failed to reset session');
    }
  };

  const handleUndo = async () => {
    if (!undoData) return;

    try {
      const response = await fetch('/api/reset/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ undoData: undoData.undoData })
      });

      const data = await response.json();

      if (data.success) {
        setUndoData(null);
        toast.success(`Restored ${data.restoredCount} participations`);
        fetchAllData();
      } else {
        toast.error('Failed to undo reset');
      }
    } catch (error) {
      toast.error('Failed to undo reset');
    }
  };

  const handlePointAdjustment = async (studentId: string, studentName: string, action: 'add' | 'subtract') => {
    setProcessingPointAdjustments(prev => new Set(prev).add(studentId));

    try {
      const response = await fetch(`/api/students/${studentId}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${action === 'add' ? 'Added' : 'Subtracted'} 1 point ${action === 'add' ? 'to' : 'from'} ${studentName}`);
        // Refresh data
        await fetchAllData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${action} point`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} point`);
    } finally {
      setProcessingPointAdjustments(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const handleBulkPointAdjustment = async (action: 'add' | 'subtract') => {
    setProcessingBulkAdjustment(true);

    try {
      const response = await fetch(`/api/rooms/${params.id}/bulk-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${action === 'add' ? 'Added' : 'Subtracted'} 1 point ${action === 'add' ? 'to' : 'from'} all ${data.studentsUpdated} students`);
        // Refresh data
        await fetchAllData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${action} points for all students`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} points for all students`);
    } finally {
      setProcessingBulkAdjustment(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/export/csv?roomId=${params.id}`, '_blank');
  };

  const sortedStudents = students.sort((a, b) => b.totalPoints - a.totalPoints);
  const totalParticipations = students.reduce((sum, s) => sum + s.participationsCount, 0);
  const totalPendingCount = pendingParticipations.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading presentation view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${showFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!showFullscreen && (
              <Link 
                href={`/teacher/room/${params.id}`}
                className="inline-flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Room
              </Link>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{room?.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Room: {room?.code}</span>
                <span>Session: {activeSession?.name || 'No Active Session'}</span>
                <Badge variant={activeSession?.isActive ? "default" : "secondary"}>
                  {activeSession?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {undoData && (
              <Button variant="outline" onClick={handleUndo} size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Undo Reset
              </Button>
            )}
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFullscreen(!showFullscreen)}
              size="sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Class Roster - Left Panel */}
        <div className="flex-1 lg:flex-[3] p-3 lg:p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Class Roster ({students.length} students)</span>
                <span className="sm:hidden">Roster ({students.length})</span>
              </h2>
              
              {/* Reset Controls */}
              <div className="flex gap-1 lg:gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm px-2 lg:px-3">
                      <span className="hidden sm:inline">Reset Class</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Entire Class?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete all participation data for the current session. 
                        This action can be undone immediately after.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetClass}>
                        Reset Class
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm px-2 lg:px-3">
                      <span className="hidden sm:inline">New Session</span>
                      <span className="sm:hidden">Session</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Start New Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end the current session and create a new one. 
                        Previous session data will be preserved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetSession}>
                        Start New Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{students.length}</div>
                  <p className="text-xs text-muted-foreground">Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalParticipations}</div>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalPendingCount}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {students.length > 0 ? Math.round(totalParticipations / students.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg per Student</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Student List */}
          <div className="space-y-2">
            {sortedStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students have joined yet</p>
                <p className="text-sm text-gray-500">Share room code: <span className="font-mono font-bold">{room?.code}</span></p>
              </div>
            ) : (
              sortedStudents.map((student, index) => (
                <Card key={student.id} className={`hover:shadow-md transition-shadow ${index < 3 ? 'border-l-4 border-l-yellow-400' : ''}`}>
                  <CardContent className="py-3 lg:py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-6 h-6 lg:w-8 lg:h-8 bg-gray-100 rounded-full text-xs lg:text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium flex items-center gap-1 lg:gap-2 text-sm lg:text-base truncate">
                            <span className="truncate">{student.name}</span>
                            {index < 3 && <Trophy className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500 flex-shrink-0" />}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600">
                            <span className="hidden sm:inline">{student.participationsCount} participations</span>
                            <span className="sm:hidden">{student.participationsCount}p</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-3 flex-shrink-0">
                        {student.pendingCount > 0 && (
                          <Badge variant="outline" className="text-xs px-1 lg:px-2">
                            <span className="hidden sm:inline">{student.pendingCount} pending</span>
                            <span className="sm:hidden">{student.pendingCount}p</span>
                          </Badge>
                        )}
                        <div className="text-right">
                          <p className="text-base lg:text-lg font-bold text-blue-600">{student.totalPoints}</p>
                          <p className="text-xs text-gray-500">
                            <span className="hidden sm:inline">points</span>
                            <span className="sm:hidden">pts</span>
                          </p>
                        </div>
                        
                        {/* Point Adjustment Buttons */}
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePointAdjustment(student.id, student.name, 'subtract')}
                            disabled={processingPointAdjustments.has(student.id) || student.totalPoints <= 0}
                            className="w-6 h-6 lg:w-8 lg:h-8 p-0 text-red-600 hover:bg-red-50 border-red-200"
                          >
                            <Minus className="w-2 h-2 lg:w-3 lg:h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePointAdjustment(student.id, student.name, 'add')}
                            disabled={processingPointAdjustments.has(student.id)}
                            className="w-6 h-6 lg:w-8 lg:h-8 p-0 text-green-600 hover:bg-green-50 border-green-200"
                          >
                            <Plus className="w-2 h-2 lg:w-3 lg:h-3" />
                          </Button>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-6 h-6 lg:w-8 lg:h-8 p-0">
                              <RotateCcw className="w-2 h-2 lg:w-3 lg:h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reset {student.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete all participation data for {student.name} in the current session.
                                This action can be undone immediately after.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleResetStudent(student.id, student.name)}>
                                Reset Student
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Approval Queue - Right Panel */}
        <div className="lg:flex-1 lg:max-w-xs bg-white border-t lg:border-t-0 lg:border-l p-3 lg:p-4 lg:min-h-0">
          <div className="sticky top-0 bg-white pb-3">
            <h3 className="text-base lg:text-lg font-semibold flex items-center gap-1 lg:gap-2 mb-3">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Queue ({pendingParticipations.length})</span>
              <span className="sm:hidden">Q ({pendingParticipations.length})</span>
            </h3>
            
            {/* Bulk Point Adjustment Buttons */}
            <div className="space-y-2 mb-4 pb-3 border-b">
              <p className="text-xs text-gray-600 font-medium">
                <span className="hidden sm:inline">All Students:</span>
                <span className="sm:hidden">All:</span>
              </p>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPointAdjustment('subtract')}
                  disabled={processingBulkAdjustment || students.length === 0}
                  className="text-red-600 hover:bg-red-50 border-red-200 text-xs px-1 lg:px-2 py-1 h-auto"
                >
                  <Minus className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                  <span className="hidden sm:inline">-1 All</span>
                  <span className="sm:hidden">-1</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkPointAdjustment('add')}
                  disabled={processingBulkAdjustment || students.length === 0}
                  className="text-green-600 hover:bg-green-50 border-green-200 text-xs px-1 lg:px-2 py-1 h-auto"
                >
                  <Plus className="w-2 h-2 lg:w-3 lg:h-3 mr-1" />
                  <span className="hidden sm:inline">+1 All</span>
                  <span className="sm:hidden">+1</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {pendingParticipations.length === 0 ? (
              <div className="text-center py-6">
                <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No pending</p>
                <p className="text-xs text-gray-500">Submissions appear here</p>
              </div>
            ) : (
              pendingParticipations.map((participation) => (
                <Card 
                  key={participation.id} 
                  className={`shadow-sm border-l-4 ${
                    participation.type === 'RAISE_HAND' 
                      ? 'border-l-yellow-500 bg-yellow-50' 
                      : 'border-l-amber-400'
                  }`}
                >
                  <CardContent className="py-3">
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{participation.studentName}</p>
                          {participation.type === 'RAISE_HAND' && (
                            <span className="text-lg">🙋‍♂️</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {participation.type === 'RAISE_HAND' 
                              ? 'Raised Hand' 
                              : `${participation.points}pt${participation.points !== 1 ? 's' : ''}`
                            }
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(participation.submittedAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {participation.type === 'RAISE_HAND' ? (
                        // Acknowledge button for hand raises
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAcknowledge(participation.id)}
                          disabled={processingApprovals.has(participation.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 h-auto text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Acknowledge
                        </Button>
                      ) : (
                        // Approve/Reject buttons for point submissions
                        <div className="grid grid-cols-2 gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproval(participation.id, 'approve')}
                            disabled={processingApprovals.has(participation.id)}
                            className="bg-green-600 hover:bg-green-700 px-2 py-1 h-auto text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Yes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproval(participation.id, 'reject')}
                            disabled={processingApprovals.has(participation.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 px-2 py-1 h-auto text-xs"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            No
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
