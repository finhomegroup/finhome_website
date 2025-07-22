import React, { useMemo, useState } from 'react';
import { ProjectData } from '../types';
import { processSubmissions } from '../utils/analytics';
import { exportToCSV } from '../utils/csv';
import DashboardMetric from './DashboardMetric';
import { BarChart, PieChart } from './charts';
import SectionHeader from './SectionHeader';
import { ChevronDownIcon, DocumentDownloadIcon } from './Icons';

interface DashboardProps {
  submissions: ProjectData[];
}

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full">
                <div className="flex justify-between items-center">
                    <SectionHeader title={title} />
                    <ChevronDownIcon className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isOpen ? '' : '-rotate-90'}`} />
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100 pt-6' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </section>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ submissions }) => {
  const analyticsData = useMemo(() => processSubmissions(submissions), [submissions]);
  
  const handleExport = () => {
    exportToCSV(submissions, `du_lieu_du_an_${new Date().toISOString().slice(0,10)}.csv`);
  };

  if (!analyticsData) {
    return (
      <div className="text-center py-20 bg-gray-800/50 rounded-xl">
        <h2 className="text-2xl font-bold text-gray-300">Không có dữ liệu để hiển thị</h2>
        <p className="text-gray-400 mt-2">Vui lòng điền và nộp form để xem dashboard.</p>
      </div>
    );
  }

  const { core, funding, lifecycle, fields, competitions, studentStats, projectStats } = analyticsData;
  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="space-y-12">
        {/* Dashboard Header with Export Button */}
        <div className="flex justify-end items-center -mt-6 mb-6">
            <button
                onClick={handleExport}
                disabled={submissions.length === 0}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                aria-label="Export data to CSV"
            >
                <DocumentDownloadIcon className="h-5 w-5" />
                <span>Export CSV</span>
            </button>
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            <DashboardMetric title="Tổng SV Khởi nghiệp" value={core.totalStartupStudents} />
            <DashboardMetric title="Tổng Dự án KN" value={core.totalStartupProjects} />
            <DashboardMetric title="Dự án/SV (TB)" value={core.avgProjectsPerStudent.toFixed(2)} />
            <DashboardMetric title="SV trong trường" value={core.studentsInSchoolProjects} />
            <DashboardMetric title="SV ngoài trường" value={core.studentsOutOfSchoolProjects} />
        </div>

        {/* Funding & Sponsorship */}
        <CollapsibleSection title="Tài trợ – Đầu tư – Hỗ trợ">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                 <DashboardMetric title="Tổng giá trị giải thưởng" value={formatCurrency(funding.totalPrizeValue)} />
                 <DashboardMetric title="Tổng vốn đã gọi" value={formatCurrency(funding.totalInvestedValue)} />
                 <DashboardMetric title="Tổng giá trị tài trợ" value={formatCurrency(funding.totalSponsorshipValue)} />
                 <DashboardMetric title="Dự án nhận đầu tư" value={`${projectStats.totalProjects > 0 ? ((funding.projectsWithInvestment / projectStats.totalProjects) * 100).toFixed(0) : 0}%`} subtitle={`${funding.projectsWithInvestment}/${projectStats.totalProjects} dự án`} />
                 <DashboardMetric title="Nhà đầu tư cá nhân" value={funding.individualInvestors} />
                 <DashboardMetric title="Nhà đầu tư tổ chức" value={funding.organizationInvestors} />
             </div>
        </CollapsibleSection>
        
        {/* Project Stats */}
         <CollapsibleSection title="Thống kê Dự án & Nhóm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <DashboardMetric title="Tổng số dự án" value={projectStats.totalProjects} />
                    <DashboardMetric title="Dự án có Mentor" value={`${projectStats.totalProjects > 0 ? ((projectStats.mentoredProjects / projectStats.totalProjects) * 100).toFixed(0) : 0}%`} subtitle={`${projectStats.mentoredProjects}/${projectStats.totalProjects} dự án`} />
                    <DashboardMetric title="Đã đăng ký kinh doanh" value={`${projectStats.totalProjects > 0 ? ((projectStats.registeredBusinesses / projectStats.totalProjects) * 100).toFixed(0) : 0}%`} subtitle={`${projectStats.registeredBusinesses}/${projectStats.totalProjects} dự án`} />
                </div>
                 <div className="space-y-8">
                    <PieChart title="Dự án theo Mức độ hoàn thiện" data={projectStats.projectsByCompletion} />
                    <PieChart title="Tình trạng Dự án" data={projectStats.projectsByStatus} />
                </div>
            </div>
        </CollapsibleSection>
        
        {/* Student Stats */}
         <CollapsibleSection title="Thống kê Thành viên / Sinh viên">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <div className="space-y-6">
                    <DashboardMetric title="Tổng số sinh viên" value={studentStats.totalStudents} />
                    <DashboardMetric title="Sinh viên trường ngoài" value={studentStats.studentsFromOtherSchools} />
                    <DashboardMetric title="Sinh viên có CV" value={studentStats.studentsWithCV} />
                    <PieChart title="Phân bổ theo giới tính" data={studentStats.studentsByGender} />
                 </div>
                <BarChart title="Số lượng sinh viên theo Khoa" data={studentStats.studentsByFaculty} />
            </div>
        </CollapsibleSection>

        {/* Fields & Industries */}
        <CollapsibleSection title="Lĩnh vực – Ngành nghề">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <DashboardMetric title="Lĩnh vực có nhiều Startup nhất" value={fields.mostPopularField} />
                <BarChart title="Số lượng dự án theo lĩnh vực" data={fields.projectsByField} />
            </div>
        </CollapsibleSection>
        
        {/* Project Lifecycle */}
        <CollapsibleSection title="Thời gian – Vòng đời Dự án">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <DashboardMetric title="Dự án hoạt động > 1 năm" value={lifecycle.activeProjectsAfter1Year} />
                <DashboardMetric title="Dự án hoạt động > 2 năm" value={lifecycle.activeProjectsAfter2Years} />
                <DashboardMetric title="Dự án hoạt động > 3 năm" value={lifecycle.activeProjectsAfter3Years} />
                <DashboardMetric title="Dừng sau < 6 tháng" value={lifecycle.stoppedUnder6Months} />
                <DashboardMetric title="Dừng sau < 1 năm" value={lifecycle.stoppedUnder1Year} />
                <DashboardMetric title="Dự án đã ĐKKD" value={lifecycle.registeredBusinesses} />
            </div>
        </CollapsibleSection>

        {/* Competitions */}
        <CollapsibleSection title="Cuộc thi – Thành tựu – Giải thưởng">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <DashboardMetric title="Tổng số cuộc thi tham gia" value={competitions.competitionsAttended} />
                <DashboardMetric title="Tổng số giải thưởng" value={competitions.awardsWon} />
                <DashboardMetric title="Tổng giá trị giải thưởng" value={formatCurrency(competitions.totalPrizeValue)} />
            </div>
        </CollapsibleSection>

    </div>
  );
};

export default Dashboard;