
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Room {
  id: string;
  name: string;
  code: string;
  teacher: string;
  hasActiveSession: boolean;
}

export default function StudentLandingPage() {
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const router = useRouter();

  const handleValidateRoom = async () => {
    if (!roomCode.trim() || roomCode.length !== 6) {
      setError('Room code must be exactly 6 characters');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/rooms/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: roomCode.toUpperCase() })
      });

      const data = await response.json();

      if (data.valid && data.room) {
        setRoom(data.room);
        setIsValidated(true);
      } else {
        setError(data.error || 'Invalid room code');
        setRoom(null);
        setIsValidated(false);
      }
    } catch (error) {
      setError('Failed to validate room code');
      setRoom(null);
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleJoinRoom = () => {
    if (room) {
      router.push(`/student/room/${room.id}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      if (isValidated && room) {
        handleJoinRoom();
      } else {
        handleValidateRoom();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Classroom</h1>
          <p className="text-gray-600">Enter your 6-character room code to participate</p>
        </div>

        {/* Room Code Input */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Room Code
            </CardTitle>
            <CardDescription>
              Ask your teacher for the room code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="roomCode">Enter Room Code</Label>
              <Input
                id="roomCode"
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length <= 6) {
                    setRoomCode(value);
                    setError('');
                    setIsValidated(false);
                    setRoom(null);
                  }
                }}
                onKeyPress={handleKeyPress}
                className="text-center text-lg font-mono tracking-widest"
                maxLength={6}
                disabled={isValidating}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {isValidated && room && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Room Found!
                </div>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Room:</strong> {room.name}</p>
                  <p><strong>Teacher:</strong> {room.teacher}</p>
                  <p><strong>Status:</strong> {room.hasActiveSession ? 'Active Session' : 'No Active Session'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!isValidated ? (
                <Button 
                  onClick={handleValidateRoom}
                  disabled={isValidating || roomCode.length !== 6}
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Validate Room'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleJoinRoom}
                  disabled={!room || !room.hasActiveSession}
                  className="flex-1"
                >
                  Join Room
                </Button>
              )}
            </div>

            {isValidated && room && !room.hasActiveSession && (
              <div className="text-center text-sm text-amber-600">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                No active session. Please wait for teacher to start a session.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
