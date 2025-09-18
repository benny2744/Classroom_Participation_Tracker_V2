
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Send, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  totalPoints: number;
}

interface Room {
  id: string;
  name: string;
  code: string;
}

export default function StudentRoomPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedPoints, setSelectedPoints] = useState('1');
  const [participationType, setParticipationType] = useState('POINTS'); // 'POINTS' or 'RAISE_HAND'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSubmission, setLastSubmission] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRoomData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchRoomData, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}/students`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Room not found');
          router.push('/student');
          return;
        }
        throw new Error('Failed to fetch room data');
      }

      const data = await response.json();
      setRoom(data.room);
      setStudents(data.students || []);

      if (!data.activeSession) {
        toast.warning('No active session in this room');
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      toast.error('Failed to load room data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitParticipation = async () => {
    if (!selectedStudentId) {
      toast.error('Please select your name');
      return;
    }

    if (participationType === 'POINTS' && (!selectedPoints || parseInt(selectedPoints) < 1 || parseInt(selectedPoints) > 3)) {
      toast.error('Please select points (1-3)');
      return;
    }

    const selectedStudent = students.find(s => s.id === selectedStudentId);
    if (!selectedStudent) {
      toast.error('Selected student not found');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/participations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          roomId: params.id,
          points: participationType === 'RAISE_HAND' ? 0 : parseInt(selectedPoints),
          type: participationType
        })
      });

      const data = await response.json();

      if (data.success) {
        setLastSubmission(data.participation);
        const message = participationType === 'RAISE_HAND' 
          ? 'Hand raised! Teacher will be notified.' 
          : `Participation submitted! (${selectedPoints} ${selectedPoints === '1' ? 'point' : 'points'})`;
        toast.success(message);
        
        // Reset form
        setSelectedStudentId('');
        setSelectedPoints('1');
        setParticipationType('POINTS');
        
        // Refresh data
        fetchRoomData();
      } else {
        toast.error(data.error || 'Failed to submit participation');
      }
    } catch (error) {
      console.error('Error submitting participation:', error);
      toast.error('Failed to submit participation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <Link 
            href="/student" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Room
          </Link>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{room?.name}</h1>
          <p className="text-gray-600">Room Code: {room?.code}</p>
        </div>

        {/* Last Submission Status */}
        {lastSubmission && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">
                    {lastSubmission.type === 'RAISE_HAND' ? 'Hand Raised!' : 'Submission Received!'}
                  </p>
                  <p className="text-sm text-green-700">
                    {lastSubmission.type === 'RAISE_HAND' 
                      ? 'Teacher will be notified of your question'
                      : `${lastSubmission.points} ${lastSubmission.points === 1 ? 'point' : 'points'} - Status: ${lastSubmission.status}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participation Form */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Submit Participation
            </CardTitle>
            <CardDescription>
              Select points and choose your name from the list below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Participation Type Selection */}
            <div>
              <Label htmlFor="type">What would you like to do?</Label>
              <Select 
                value={participationType === 'POINTS' ? selectedPoints : 'raise_hand'} 
                onValueChange={(value) => {
                  if (value === 'raise_hand') {
                    setParticipationType('RAISE_HAND');
                    setSelectedPoints('0'); // 0 points for hand raising
                  } else {
                    setParticipationType('POINTS');
                    setSelectedPoints(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raise_hand" className="bg-yellow-50 border-l-4 border-l-yellow-400">
                    🙋‍♂️ Raise Hand - Ask a question or get attention
                  </SelectItem>
                  <SelectItem value="1">1 Point - Simple question/comment</SelectItem>
                  <SelectItem value="2">2 Points - Good contribution</SelectItem>
                  <SelectItem value="3">3 Points - Excellent insight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection - Radio Button Grid */}
            <div>
              <Label>Select Your Name</Label>
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No students in this room yet</p>
              ) : (
                <RadioGroup 
                  value={selectedStudentId} 
                  onValueChange={setSelectedStudentId}
                  className="mt-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {students
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((student) => (
                        <div 
                          key={student.id} 
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          <RadioGroupItem 
                            value={student.id} 
                            id={student.id}
                            className="flex-shrink-0"
                          />
                          <Label 
                            htmlFor={student.id} 
                            className="flex-1 cursor-pointer font-medium"
                          >
                            <div className="flex justify-between items-center">
                              <span>{student.name}</span>
                              <span className="text-sm text-blue-600 font-bold">
                                {student.totalPoints} pts
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))
                    }
                  </div>
                </RadioGroup>
              )}
            </div>

            <Button 
              onClick={handleSubmitParticipation}
              disabled={isSubmitting || !selectedStudentId || (participationType === 'POINTS' && !selectedPoints)}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {participationType === 'RAISE_HAND' ? 'Raising hand...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {participationType === 'RAISE_HAND' 
                    ? '🙋‍♂️ Raise Hand' 
                    : `Submit ${selectedPoints} ${selectedPoints === '1' ? 'Point' : 'Points'}`
                  }
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Standings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No participants yet</p>
            ) : (
              <div className="space-y-2">
                {students
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .slice(0, 10)
                  .map((student, index) => (
                    <div 
                      key={student.id} 
                      className={`flex justify-between items-center p-2 rounded ${
                        index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">
                        {index + 1}. {student.name}
                      </span>
                      <span className="text-blue-600 font-bold">
                        {student.totalPoints} pts
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
