export interface CampaignData {
  id: number;
  programCompetition: string;
  projectTitle: string;
  firstName: string;
  lastName: string;
  faculty: string;
  university: string;
  result: string;
  prizeValue: string;
  isSpecialPrize?: boolean;
}

export const campaignsMockData: CampaignData[] = [
  {
    id: 1,
    programCompetition: "VLIC",
    projectTitle: "A Núi",
    firstName: "Lê Công Quốc",
    lastName: "Tín",
    faculty: "Quản trị kinh doanh",
    university: "Trường Đại học Văn Lang",
    result: "Giải Đặc biệt",
    prizeValue: "25.000.000 VND",
    isSpecialPrize: true
  },
  {
    id: 2,
    programCompetition: "Ra Khơi",
    projectTitle: "METAVERSE",
    firstName: "Đỗ Thụy Mai",
    lastName: "Anh",
    faculty: "Quan hệ CC&TT",
    university: "Trường Đại học Văn Lang",
    result: "Giải Nhất",
    prizeValue: "20.000.000 VND",
    isSpecialPrize: true
  },
  {
    id: 3,
    programCompetition: "Ra Khơi",
    projectTitle: "B2G",
    firstName: "Võ Ngọc Mai",
    lastName: "Uyên",
    faculty: "Quản trị kinh doanh",
    university: "Trường Đại học Văn Lang",
    result: "Giải Nhất",
    prizeValue: "20.000.000 VND",
    isSpecialPrize: true
  },
  {
    id: 4,
    programCompetition: "Ra Khơi",
    projectTitle: "BioPicture",
    firstName: "Nguyễn Phúc",
    lastName: "Tân",
    faculty: "Công nghệ Ứng dụng",
    university: "Trường Đại học Văn Lang",
    result: "Giải Nhất",
    prizeValue: "20.000.000 VND",
    isSpecialPrize: true
  },
  {
    id: 5,
    programCompetition: "Ra Khơi",
    projectTitle: "SELF",
    firstName: "Trần Nhật",
    lastName: "Khôi",
    faculty: "Quản trị kinh doanh",
    university: "Trường Đại học Văn Lang",
    result: "Giải Nhất",
    prizeValue: "20.000.000 VND",
    isSpecialPrize: true
  },
  {
    id: 6,
    programCompetition: "Ra Khơi",
    projectTitle: "THE HEIRS",
    firstName: "Phan Lê Diệu",
    lastName: "Hiền",
    faculty: "Quan hệ CC&TT",
    university: "Trường Đại học Văn Lang",
    result: "Giải Nhất",
    prizeValue: "15.000.000 VND",
    isSpecialPrize: true
  }
];

// Helper function to get result badge color
export const getResultBadgeColor = (result: string): string => {
  const specialPrizes = ["Giải Đặc biệt", "Giải Nhất", "Giải nhì", "Giải nhất"];
  return specialPrizes.includes(result) ? "bg-[#3CB550] text-white" : "bg-gray-100 text-gray-700";
};

// Helper function to format faculty badge
export const getFacultyBadgeColor = (): string => {
  return "bg-gray-100 text-gray-700";
};
