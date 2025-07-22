import { ProjectData } from '../types';

const escapeCSV = (field: any): string => {
    if (field === null || typeof field === 'undefined') {
        return '';
    }
    const str = String(field);
    // If the string contains a comma, a double quote, or a newline, enclose it in double quotes.
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        // Within a double-quoted string, any double quote must be escaped by another double quote.
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const headers = [
    'project_id', 'project_name',
    'competition_classification', 'competition_name', 'school_year',
    'leader_lastName', 'leader_firstName', 'leader_gender', 'leader_ethnicity', 'leader_studentId', 'leader_phone', 'leader_email', 'leader_schoolType', 'leader_faculty', 'leader_major', 'leader_otherSchoolName', 'leader_otherFacultyName', 'leader_otherMajorName',
    'teammates_count', 'teammates_data',
    'project_fields', 'project_description', 'project_startDate', 'project_completionLevel', 'project_status', 'project_stoppedDate',
    'advisor_hasAdvisor', 'advisor_lastName', 'advisor_firstName', 'advisor_title',
    'business_hasLicense', 'business_taxCode',
    'link_website', 'link_fanpage', 'link_youtube', 'link_media',
    'achievements_count', 'achievements_data',
    'investments_count', 'investments_data',
    'sponsorships_count', 'sponsorships_data'
];

const convertToCSV = (data: ProjectData[]): string => {
    const rows = data.map(p => {
        const leader = p.leader;
        const projectInfo = p.projectInfo;
        const advisor = projectInfo.advisor;
        const prizeInfo = p.prizeInfo;

        const teammatesData = p.teammates.map(t => `${t.firstName} ${t.lastName} (${t.email})`).join('; ');
        const achievementsData = prizeInfo.achievements.map(a => `${a.competitionName}: ${a.achievement} (${a.prizeValue})`).join('; ');
        const investmentsData = prizeInfo.investments.map(i => `${i.type} - ${i.name}: ${i.amount} [${i.form}]`).join('; ');
        const sponsorshipsData = prizeInfo.sponsorships.map(s => `${s.type} - ${s.name}: ${s.content} (${s.value})`).join('; ');

        const row = [
            p.id, p.projectName,
            p.competitionInfo.classification, p.competitionInfo.competitionName, p.competitionInfo.schoolYear,
            leader.lastName, leader.firstName, leader.gender, leader.ethnicity, leader.studentId, leader.phone, leader.email, leader.schoolType, leader.faculty, leader.major, leader.otherSchoolName, leader.otherFacultyName, leader.otherMajorName,
            p.teammates.length, teammatesData,
            projectInfo.fields.join('; '), projectInfo.description, projectInfo.startDate, projectInfo.completionLevel, projectInfo.projectStatus, projectInfo.stoppedDate,
            advisor.hasAdvisor, advisor.lastName, advisor.firstName, advisor.title,
            projectInfo.hasBusinessLicense, projectInfo.taxCode,
            projectInfo.websiteLink, projectInfo.fanpageLink, projectInfo.youtubeLink, projectInfo.mediaLink,
            prizeInfo.achievements.length, achievementsData,
            prizeInfo.investments.length, investmentsData,
            prizeInfo.sponsorships.length, sponsorshipsData
        ];
        return row.map(escapeCSV).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

export const exportToCSV = (data: ProjectData[], filename: string = 'project_data.csv') => {
    if (data.length === 0) {
        console.warn("No data to export.");
        return;
    }

    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};