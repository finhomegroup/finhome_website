import React from 'react';
import { Entrepreneurship } from '@/components/admin/entrepreneurship';

const EntrepreneurshipPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <Entrepreneurship />
        </main>
      </div>
    </div>
  );
};

export default EntrepreneurshipPage;
