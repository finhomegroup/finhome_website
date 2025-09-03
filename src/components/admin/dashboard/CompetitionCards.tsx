import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, DollarSign } from 'lucide-react';

export const CompetitionCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {/* Card 1: Tổng số cuộc thi sinh viên đã tham gia */}
      <Card className="bg-gradient-to-r from-green-100 to-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">20</div>
              <div className="text-sm text-gray-600">
                Tổng số cuộc thi sinh viên đã tham gia
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Tổng giá trị giải thưởng */}
      <Card className="bg-gradient-to-r from-blue-100 to-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">500tr</div>
              <div className="text-sm text-gray-600">
                Tổng giá trị giải thưởng
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
