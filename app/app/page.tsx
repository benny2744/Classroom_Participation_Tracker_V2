
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Classroom Participation 
            <span className="text-blue-600 block">Tracker</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time participation tracking for engaging classroom experiences
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4 mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <CardTitle>Easy for Students</CardTitle>
              <CardDescription>
                Simple room code entry and participation submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Enter 6-character room code</li>
                <li>• Select name and submit points (1-3)</li>
                <li>• Real-time feedback</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4 mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <CardTitle>Powerful for Teachers</CardTitle>
              <CardDescription>
                Comprehensive dashboard with real-time approval queue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Multi-room management</li>
                <li>• Live presentation view</li>
                <li>• Quick approval/rejection</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4 mx-auto">
                <BarChart3 className="w-6 h-6" />
              </div>
              <CardTitle>Rich Analytics</CardTitle>
              <CardDescription>
                Track participation patterns and export data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Session-based tracking</li>
                <li>• Reset functionality</li>
                <li>• CSV export</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/student">
            <Button size="lg" className="w-full sm:w-auto">
              <Users className="w-5 h-5 mr-2" />
              Join as Student
            </Button>
          </Link>
          <Link href="/teacher">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <GraduationCap className="w-5 h-5 mr-2" />
              Teacher Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
