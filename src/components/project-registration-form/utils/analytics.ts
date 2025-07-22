import { ProjectData, Member } from '../types';

const safeParseInt = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? 0 : num;
    }
    return 0;
};

const countBy = <T>(arr: T[], keyFn: (item: T) => string): Record<string, number> => {
    return arr.reduce((acc, item) => {
        const key = keyFn(item);
        if (key) {
           acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
};

export const processSubmissions = (submissions: ProjectData[]) => {
    if (submissions.length === 0) {
        return null;
    }

    const allProjects = submissions.filter(s => s.competitionInfo.classification === 'Khởi nghiệp');
    const allStudents: Member[] = submissions.flatMap(p => [p.leader, ...p.teammates]);
    const uniqueStudents = Array.from(new Set(allStudents.map(s => s.email.toLowerCase()))).map(email => {
        return allStudents.find(s => s.email.toLowerCase() === email)!;
    });

    // CORE METRICS
    const totalStartupStudents = new Set(allProjects.flatMap(p => [p.leader, ...p.teammates]).map(s => s.email.toLowerCase())).size;
    const totalStartupProjects = allProjects.length;
    const avgProjectsPerStudent = totalStartupProjects > 0 && uniqueStudents.length > 0
        ? (allProjects.flatMap(p => p.leader.email).length + allProjects.flatMap(p => p.teammates.map(t => t.email)).length) / uniqueStudents.length
        : 0;
    const studentsInSchoolProjects = new Set(submissions.filter(s => s.leader.schoolType === 'van_lang').flatMap(p => [p.leader, ...p.teammates]).map(s => s.email.toLowerCase())).size;
    const studentsOutOfSchoolProjects = new Set(submissions.filter(s => s.leader.schoolType !== 'van_lang').flatMap(p => [p.leader, ...p.teammates]).map(s => s.email.toLowerCase())).size;
    
    // FUNDING & PRIZES
    const totalPrizeValue = submissions.flatMap(p => p.prizeInfo.achievements).reduce((sum, a) => sum + safeParseInt(a.prizeValue), 0);
    const totalInvestedValue = submissions.flatMap(p => p.prizeInfo.investments).reduce((sum, i) => sum + safeParseInt(i.amount), 0);
    const totalSponsorshipValue = submissions.flatMap(p => p.prizeInfo.sponsorships).reduce((sum, s) => sum + safeParseInt(s.value), 0);

    // PROJECT LIFECYCLE
    const now = new Date();
    const activeProjects = submissions.filter(p => p.projectInfo.projectStatus === 'Đang hoạt động');
    const projectAge = (p: ProjectData) => (now.getTime() - new Date(p.projectInfo.startDate).getTime()) / (1000 * 3600 * 24 * 365.25);
    
    const activeProjectsAfter1Year = activeProjects.filter(p => projectAge(p) >= 1).length;
    const activeProjectsAfter2Years = activeProjects.filter(p => projectAge(p) >= 2).length;
    const activeProjectsAfter3Years = activeProjects.filter(p => projectAge(p) >= 3).length;

    const stoppedProjects = submissions.filter(p => p.projectInfo.projectStatus === 'Đã dừng' && p.projectInfo.startDate && p.projectInfo.stoppedDate);
    const projectLifetimeDays = (p: ProjectData) => (new Date(p.projectInfo.stoppedDate).getTime() - new Date(p.projectInfo.startDate).getTime()) / (1000 * 3600 * 24);
    
    const stoppedUnder6Months = stoppedProjects.filter(p => projectLifetimeDays(p) < 182.5).length;
    const stoppedUnder1Year = stoppedProjects.filter(p => projectLifetimeDays(p) < 365).length;
    
    const registeredBusinesses = submissions.filter(p => p.projectInfo.hasBusinessLicense === 'yes').length;
    const mentoredProjects = submissions.filter(p => p.projectInfo.advisor.hasAdvisor === 'yes').length;
    
    // FIELDS
    const projectsByField = submissions.flatMap(p => p.projectInfo.fields.filter(f => f.trim() !== '')).reduce((acc, field) => {
        acc[field] = (acc[field] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const mostPopularField = Object.entries(projectsByField).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // INVESTMENTS & SPONSORSHIPS
    const individualInvestors = submissions.flatMap(p => p.prizeInfo.investments.filter(i => i.type === 'individual')).length;
    const organizationInvestors = submissions.flatMap(p => p.prizeInfo.investments.filter(i => i.type === 'organization')).length;
    const projectsWithInvestment = submissions.filter(p => p.prizeInfo.investments.length > 0).length;
    const projectsWithSponsorship = submissions.filter(p => p.prizeInfo.sponsorships.length > 0).length;
    
    // COMPETITIONS
    const competitionsAttended = submissions.flatMap(p => p.prizeInfo.achievements).length;
    const awardsWon = submissions.flatMap(p => p.prizeInfo.achievements.filter(a => a.achievement.trim() !== '')).length;
    
    // STUDENT STATS
    const studentsByFaculty = countBy(allStudents.filter(s => s.schoolType === 'van_lang'), s => s.faculty);
    const studentsByGender = countBy(allStudents, s => s.gender);
    const studentsFromOtherSchools = allStudents.filter(s => s.schoolType === 'other').length;
    const studentsWithCV = allStudents.filter(s => !!s.cv).length;

    // PROJECT STATS
    const projectsByCompletion = countBy(submissions, p => p.projectInfo.completionLevel);
    const projectsByStatus = countBy(submissions, p => p.projectInfo.projectStatus);
    const projectsWithPitchdeck = submissions.filter(p => !!p.projectInfo.pitchDeck).length;
    const projectsWithWebsite = submissions.filter(p => p.projectInfo.websiteLink.trim() !== '').length;

    return {
        core: {
            totalStartupStudents,
            totalStartupProjects,
            avgProjectsPerStudent,
            studentsInSchoolProjects,
            studentsOutOfSchoolProjects
        },
        funding: {
            totalPrizeValue,
            totalInvestedValue,
            totalSponsorshipValue,
            individualInvestors,
            organizationInvestors,
            projectsWithInvestment,
            projectsWithSponsorship,
        },
        lifecycle: {
            activeProjectsAfter1Year,
            activeProjectsAfter2Years,
            activeProjectsAfter3Years,
            stoppedUnder6Months,
            stoppedUnder1Year,
            registeredBusinesses,
            mentoredProjects,
        },
        fields: {
            projectsByField: Object.entries(projectsByField).map(([label, value]) => ({ label, value })),
            mostPopularField,
        },
        competitions: {
            competitionsAttended,
            awardsWon,
            totalPrizeValue,
        },
        studentStats: {
            totalStudents: uniqueStudents.length,
            studentsByFaculty: Object.entries(studentsByFaculty).map(([label, value]) => ({ label, value })),
            studentsByGender: Object.entries(studentsByGender).map(([label, value]) => ({ label, value })),
            studentsFromOtherSchools,
            studentsWithCV,
        },
        projectStats: {
            totalProjects: submissions.length,
            mentoredProjects,
            projectsByCompletion: Object.entries(projectsByCompletion).map(([label, value]) => ({ label, value })),
            registeredBusinesses,
            projectsByStatus: Object.entries(projectsByStatus).map(([label, value]) => ({ label, value })),
            projectsWithPitchdeck,
            projectsWithWebsite,
        }
    };
};

export type AnalyticsData = ReturnType<typeof processSubmissions>;
