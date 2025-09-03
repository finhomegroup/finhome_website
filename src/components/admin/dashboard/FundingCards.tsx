import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, DollarSign, Users, Handshake, Building } from 'lucide-react';

export const FundingCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      {/* Card 1: Số lượng dự án được tài trợ/hỗ trợ */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Rocket className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-gray-900">100</div>
              <div className="text-xs text-gray-600 leading-tight">
                Số lượng dự án<br />
                được tài trợ/hỗ trợ
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Tổng số tiền được đầu tư & Tài trợ/hỗ trợ */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-gray-900">100tr</div>
              <div className="text-xs text-gray-600 leading-tight">
                Tổng số tiền được<br />
                đầu tư & Tài trợ/hỗ trợ
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Số lượng nhà đầu tư cá nhân / tổ chức */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-gray-900">23</div>
              <div className="text-xs text-gray-600 leading-tight">
                Số lượng nhà đầu tư cá<br />
                nhân / tổ chức
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Số lượng đối tác hỗ trợ khác */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Handshake className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-gray-900">10</div>
              <div className="text-xs text-gray-600 leading-tight">
                Số lượng đối tác<br />
                hỗ trợ khác
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 5: VLU Funding Support */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Building className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-900">19.973.321 đ</div>
              <div className="text-xs text-gray-600 leading-tight">
                VLU Funding Support<br />
                <span className="text-gray-500">total funding provided</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
