export type Gender = 'Nam' | 'Nữ' | '';
export type SchoolType = 'van_lang' | 'other';
export type YesNo = 'yes' | 'no' | '';

export interface CompetitionInfo {
  classification: string;
  competitionName: string;
  schoolYear: string;
}

export interface Member {
  id: string; // Unique ID for React key prop
  lastName: string;
  firstName: string;
  gender: Gender;
  ethnicity: string;
  studentId: string;
  phone: string;
  email: string;
  schoolType: SchoolType;
  // Van Lang specific
  faculty: string;
  major: string;
  // Other school specific
  otherSchoolName: string;
  otherFacultyName: string;
  otherMajorName: string;
  cv?: File | null;
  cvFileName?: string;
}

export interface Advisor {
  hasAdvisor: YesNo;
  lastName: string;
  firstName: string;
  title: string;
}

export interface ProjectSpecificInfo {
    fields: string[];
    description: string;
    startDate: string;
    advisor: Advisor;
    completionLevel: string;
    hasBusinessLicense: YesNo;
    taxCode: string;
    projectStatus: string;
    stoppedDate: string;
    pitchDeck: File | null;
    pitchDeckFileName: string;
    projectDetailsFile: File | null;
    projectDetailsFileName: string;
    websiteLink: string;
    fanpageLink: string;
    youtubeLink: string;
    mediaLink: string;
    projectImage: File | null;
    projectImageFileName: string;
}

export interface Achievement {
  id: string;
  competitionName: string;
  achievement: string;
  prizeValue: string;
  link: string;
}

export type PartnerType = 'individual' | 'organization';

export interface Investment {
  id: string;
  type: PartnerType;
  name: string;
  amount: string;
  form: string;
}

export interface Sponsorship {
  id: string;
  type: PartnerType;
  name: string;
  content: string;
  value: string;
}

export interface PrizeSponsorshipInfo {
    achievements: Achievement[];
    investments: Investment[];
    sponsorships: Sponsorship[];
}


export interface ProjectData {
    id: string;
    competitionInfo: CompetitionInfo;
    projectName: string;
    leader: Member;
    teammates: Member[];
    projectInfo: ProjectSpecificInfo;
    prizeInfo: PrizeSponsorshipInfo;
}
