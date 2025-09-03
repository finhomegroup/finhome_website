import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Handshake } from 'lucide-react';

export const ProjectCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Card 1: Total Project Registered & Incorporated startups */}
      <Card className="bg-gradient-to-r from-emerald-100 to-emerald-50 border-emerald-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-500 bg-opacity-20 p-3 rounded-full">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">50</div>
              <div className="text-sm text-gray-600">
                Total Project<br />
                Registered & Incorporated startups
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Total Project Startup projects with business mentor */}
      <Card className="bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
              <Handshake className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">50</div>
              <div className="text-sm text-gray-600">
                Total Project<br />
                Startup projects with business mentor
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
