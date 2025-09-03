import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface StudentParticipationData {
  department: string;
  competitions: number;
  projects: number;
}

export const StudentParticipationTable: React.FC = () => {
  const [data, setData] = useState<StudentParticipationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: tableData, error } = await supabase
          .from('studentparticipationoverview')
          .select('*')
          .order('competitions', { ascending: false })
          .order('projects', { ascending: false });

        if (error) {
          throw error;
        }

        setData(tableData || []);
      } catch (err) {
        console.error('Error fetching student participation data:', err);
        setError('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Student Participation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Student Participation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Participation Overview</CardTitle>
        <p className="text-sm text-gray-600">
          Tổng quan về sự tham gia của sinh viên theo khoa/ngành
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                  Department
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                  Competitions
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 bg-gray-50">
                  Projects
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                  }`}
                >
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {row.department}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    <span className="inline-flex items-center justify-center min-w-[40px] h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {row.competitions}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    <span className="inline-flex items-center justify-center min-w-[40px] h-8 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {row.projects}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Summary */}
        <div className="mt-6 flex justify-end space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span>Total Competitions: {data.reduce((sum, row) => sum + row.competitions, 0)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            <span>Total Projects: {data.reduce((sum, row) => sum + row.projects, 0)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
