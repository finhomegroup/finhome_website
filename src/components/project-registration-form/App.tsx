

import React, { useState, useMemo } from 'react';
import { Member, Advisor, Achievement, Investment, Sponsorship, YesNo, PartnerType, CompetitionInfo, ProjectData, ProjectSpecificInfo } from './types';
import { COMPLETION_LEVELS, PROJECT_STATUSES, CLASSIFICATIONS, VAN_LANG_FACULTIES } from './constants';
import MemberForm from './components/MemberForm';
import FormField from './components/FormField';
import SectionHeader from './components/SectionHeader';
import { PlusIcon, UserMinusIcon, PaperAirplaneIcon, TrashIcon, UploadIcon, ChartBarIcon, DocumentTextIcon } from './components/Icons';
import Dashboard from './components/Dashboard';

const createNewMember = (): Member => ({
  id: crypto.randomUUID(),
  lastName: '',
  firstName: '',
  gender: '',
  ethnicity: '',
  studentId: '',
  phone: '',
  email: '',
  schoolType: 'van_lang',
  faculty: '',
  major: '',
  otherSchoolName: '',
  otherFacultyName: '',
  otherMajorName: '',
  cv: null,
  cvFileName: ''
});

const createNewProjectData = (): ProjectData => ({
  id: crypto.randomUUID(),
  competitionInfo: { classification: '', competitionName: '', schoolYear: '' },
  projectName: '',
  leader: createNewMember(),
  teammates: [],
  projectInfo: {
      fields: [''],
      description: '',
      startDate: '',
      advisor: { hasAdvisor: '', lastName: '', firstName: '', title: '' },
      completionLevel: '',
      hasBusinessLicense: '',
      taxCode: '',
      projectStatus: '',
      stoppedDate: '',
      pitchDeck: null,
      pitchDeckFileName: '',
      projectDetailsFile: null,
      projectDetailsFileName: '',
      websiteLink: '',
      fanpageLink: '',
      youtubeLink: '',
      mediaLink: '',
      projectImage: null,
      projectImageFileName: '',
  },
  prizeInfo: {
      achievements: [],
      investments: [],
      sponsorships: [],
  },
});


const RegistrationForm: React.FC<{ onFormSubmit: (data: ProjectData) => void }> = ({ onFormSubmit }) => {
  const [projectData, setProjectData] = useState<ProjectData>(createNewProjectData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberCount = useMemo(() => 1 + projectData.teammates.length, [projectData.teammates]);
  
  const handleUpdate = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) => {
    setProjectData(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedUpdate = <K1 extends keyof ProjectData, K2 extends keyof ProjectData[K1]>(k1: K1, k2: K2, value: ProjectData[K1][K2]) => {
    setProjectData(prev => ({
        ...prev,
        [k1]: {
            ...prev[k1],
            [k2]: value
        }
    }));
  };
  
  const handleLeaderUpdate = (field: keyof Member, value: any) => {
    setProjectData(prev => ({...prev, leader: {...prev.leader, [field]: value}}));
  };
  
  const handleTeammateUpdate = (id: string, field: keyof Member, value: any) => {
    handleUpdate('teammates', projectData.teammates.map(mate => (mate.id === id ? { ...mate, [field]: value } : mate)));
  };

  const removeTeammate = (id: string) => handleUpdate('teammates', projectData.teammates.filter(mate => mate.id !== id));
  
  const handleMemberCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCount = parseInt(e.target.value, 10);
    if (isNaN(newCount) || newCount < 1) return;

    const currentTeammates = projectData.teammates;
    const desiredTeammateCount = newCount - 1;

    if (desiredTeammateCount > currentTeammates.length) {
        const newMembersToAdd = Array.from(
            { length: desiredTeammateCount - currentTeammates.length },
            () => createNewMember()
        );
        handleUpdate('teammates', [...currentTeammates, ...newMembersToAdd]);
    } else if (desiredTeammateCount < currentTeammates.length) {
        handleUpdate('teammates', currentTeammates.slice(0, desiredTeammateCount));
    }
  };
  
  const handleAdvisorChange = (field: keyof Advisor, value: any) => {
    setProjectData(prev => ({...prev, projectInfo: {...prev.projectInfo, advisor: {...prev.projectInfo.advisor, [field]: value}}}));
  };
  
  const handleFileChange = (field: 'pitchDeck' | 'projectDetailsFile' | 'projectImage', e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null;
      handleNestedUpdate('projectInfo', field, file as any);
      const fileNameKey = {
          pitchDeck: 'pitchDeckFileName',
          projectDetailsFile: 'projectDetailsFileName',
          projectImage: 'projectImageFileName',
      }[field] as keyof ProjectSpecificInfo;
      handleNestedUpdate('projectInfo', fileNameKey, file ? file.name : '' as any);
  };

  const handleDynamicListChange = (
    listKey: 'fields' | 'achievements' | 'investments' | 'sponsorships',
    index: number,
    value: string,
    field?: any
  ) => {
    setProjectData(prev => {
      if (listKey === 'fields') {
        const newFields = [...prev.projectInfo.fields];
        newFields[index] = value;
        return {
          ...prev,
          projectInfo: { ...prev.projectInfo, fields: newFields },
        };
      }
  
      const newPrizeInfo = { ...prev.prizeInfo };
      switch (listKey) {
        case 'achievements': {
          const newList = [...newPrizeInfo.achievements];
          if (field && newList[index]) {
            newList[index] = { ...newList[index], [field]: value };
            newPrizeInfo.achievements = newList;
          }
          break;
        }
        case 'investments': {
          const newList = [...newPrizeInfo.investments];
          if (field && newList[index]) {
            newList[index] = { ...newList[index], [field]: value };
            newPrizeInfo.investments = newList;
          }
          break;
        }
        case 'sponsorships': {
          const newList = [...newPrizeInfo.sponsorships];
          if (field && newList[index]) {
            newList[index] = { ...newList[index], [field]: value };
            newPrizeInfo.sponsorships = newList;
          }
          break;
        }
      }
  
      return {
        ...prev,
        prizeInfo: newPrizeInfo,
      };
    });
  };


  const addDynamicListItem = (listName: keyof ProjectData['prizeInfo'], itemFactory: () => any) => {
    setProjectData(prev => {
        const newPrizeInfo = { ...prev.prizeInfo };
        const newItem = itemFactory();

        switch (listName) {
            case 'achievements':
                newPrizeInfo.achievements = [...newPrizeInfo.achievements, newItem];
                break;
            case 'investments':
                newPrizeInfo.investments = [...newPrizeInfo.investments, newItem];
                break;
            case 'sponsorships':
                newPrizeInfo.sponsorships = [...newPrizeInfo.sponsorships, newItem];
                break;
        }

        return {
            ...prev,
            prizeInfo: newPrizeInfo,
        };
    });
  };
  
  const removeDynamicListItem = (listName: 'fields' | keyof typeof projectData.prizeInfo, idOrIndex: string | number) => {
    setProjectData(prev => {
        const dataCopy = { ...prev };
        if (listName === 'fields') {
            const newList = dataCopy.projectInfo.fields.filter((_, i) => i !== idOrIndex);
            dataCopy.projectInfo = { ...dataCopy.projectInfo, fields: newList };
        } else {
            const prizeInfoListKey = listName as keyof typeof dataCopy.prizeInfo;
            const oldList = dataCopy.prizeInfo[prizeInfoListKey] as any[];
            const newList = typeof idOrIndex === 'number'
                ? oldList.filter((_, i) => i !== idOrIndex)
                : oldList.filter(item => item.id !== idOrIndex);
            dataCopy.prizeInfo = { ...dataCopy.prizeInfo, [prizeInfoListKey]: newList };
        }
        return dataCopy;
    });
  };
  
  const createNewAchievement = (): Achievement => ({ id: crypto.randomUUID(), competitionName: '', achievement: '', prizeValue: '', link: '' });
  const createNewInvestment = (type: PartnerType): Investment => ({ id: crypto.randomUUID(), type, name: '', amount: '', form: '' });
  const createNewSponsorship = (type: PartnerType): Sponsorship => ({ id: crypto.randomUUID(), type, name: '', content: '', value: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const webhookUrl = 'https://united-glider-becoming.ngrok-free.app/webhook-test/94822706-8518-4d25-8a06-ff132fb745a6';
    const formData = new FormData();

    // Deep copy and remove file objects for JSON part.
    // File objects will be sent separately.
    const dataWithoutFiles = JSON.parse(JSON.stringify(projectData, (key, value) => {
        if (value instanceof File) {
            return undefined; // Exclude File objects from JSON stringification
        }
        return value;
    }));

    formData.append('jsonData', JSON.stringify(dataWithoutFiles));

    // Append files to FormData
    if (projectData.leader.cv) {
        formData.append('leader_cv', projectData.leader.cv, projectData.leader.cv.name);
    }
    projectData.teammates.forEach((teammate, index) => {
        if (teammate.cv) {
            formData.append(`teammate_${index}_cv`, teammate.cv, teammate.cv.name);
        }
    });
    if (projectData.projectInfo.pitchDeck) {
        formData.append('pitchDeck', projectData.projectInfo.pitchDeck, projectData.projectInfo.pitchDeck.name);
    }
    if (projectData.projectInfo.projectDetailsFile) {
        formData.append('projectDetailsFile', projectData.projectInfo.projectDetailsFile, projectData.projectInfo.projectDetailsFile.name);
    }
    if (projectData.projectInfo.projectImage) {
        formData.append('projectImage', projectData.projectInfo.projectImage, projectData.projectInfo.projectImage.name);
    }
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            // Original success logic
            onFormSubmit(projectData);
            alert('Đăng ký thành công! Dữ liệu đã được gửi và ghi nhận vào Dashboard.');
            setProjectData(createNewProjectData());
        } else {
            const errorText = await response.text();
            console.error('Webhook submission failed:', response.status, errorText);
            alert(`Đăng ký thất bại. Server trả về lỗi: ${response.statusText}. Vui lòng thử lại.`);
        }
    } catch (error) {
        console.error('Failed to submit to webhook', error);
        alert('Không thể gửi đăng ký. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
        <form onSubmit={handleSubmit} className="space-y-12">
           {/* Competition/Program Information Section */}
           <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
            <SectionHeader title="THÔNG TIN CHƯƠG TRÌNH / CUỘC THI" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <FormField label="Phân loại">
                <select
                  value={projectData.competitionInfo.classification}
                  onChange={e => handleNestedUpdate('competitionInfo', 'classification', e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="" disabled>Chọn phân loại</option>
                  {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Tên chương trình/cuộc thi">
                <input
                  type="text"
                  value={projectData.competitionInfo.competitionName}
                  onChange={e => handleNestedUpdate('competitionInfo', 'competitionName', e.target.value)}
                  className="form-input"
                  placeholder="Nhập tên..."
                  required
                />
              </FormField>
              <FormField label="Năm học">
                <input
                  type="text"
                  value={projectData.competitionInfo.schoolYear}
                  onChange={e => handleNestedUpdate('competitionInfo', 'schoolYear', e.target.value)}
                  className="form-input"
                  placeholder="e.g., 2023-2024"
                  required
                />
              </FormField>
            </div>
          </section>

          {/* Group Information Section */}
          <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
            <SectionHeader title="THÔNG TIN NHÓM" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <FormField label="Tên dự án/ý tưởng">
                <input
                  type="text"
                  value={projectData.projectName}
                  onChange={e => handleUpdate('projectName', e.target.value)}
                  className="form-input"
                  placeholder="Nhập tên dự án..."
                  required
                />
              </FormField>
              <FormField label="Số lượng thành viên">
                <select
                  value={memberCount}
                  onChange={handleMemberCountChange}
                  className="form-input"
                  aria-label="Chọn số lượng thành viên"
                >
                  {Array.from({ length: Math.max(15, memberCount) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </FormField>
            </div>
          </section>

          {/* Leader Information Section */}
          <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
            <SectionHeader title="THÔNG TIN TRƯỞNG NHÓM" />
            <MemberForm
              member={projectData.leader}
              onUpdate={handleLeaderUpdate}
            />
          </section>

          {/* Teammate Information Section */}
          {projectData.teammates.length > 0 && (
            <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
              <SectionHeader title="THÔNG TIN THÀNH VIÊN" subtitle={`(${projectData.teammates.length} thành viên khác)`}/>
                {projectData.teammates.map((teammate, index) => (
                  <div key={teammate.id} className="relative mt-8 border-t-2 border-dashed border-gray-700 pt-8">
                    <h3 className="text-lg font-semibold text-teal-400 mb-4">Thành viên {index + 2}</h3>
                    <MemberForm
                      member={teammate}
                      onUpdate={(field, value) => handleTeammateUpdate(teammate.id, field, value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeTeammate(teammate.id)}
                      className="absolute top-6 right-0 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition duration-300 transform hover:scale-110"
                      aria-label="Xóa thành viên"
                    >
                      <UserMinusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
            </section>
          )}

          {/* Project Information Section */}
          <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg">
            <SectionHeader title="THÔNG TIN DỰ ÁN" />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6">
                <FormField label="Lĩnh vực" className="md:col-span-3">
                    {projectData.projectInfo.fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input type="text" value={field} onChange={e => handleDynamicListChange('fields', index, e.target.value)} className="form-input" placeholder={`Lĩnh vực ${index + 1}`} />
                            {projectData.projectInfo.fields.length > 1 && (
                                <button type="button" onClick={() => removeDynamicListItem('fields', index)} className="p-2 bg-red-600/80 hover:bg-red-700 rounded-full"><TrashIcon className="h-4 w-4 text-white" /></button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={() => handleNestedUpdate('projectInfo', 'fields', [...projectData.projectInfo.fields, ''])} className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-2">
                        <PlusIcon className="h-4 w-4"/> Thêm lĩnh vực
                    </button>
                </FormField>
                <FormField label="Mô tả dự án ngắn gọn" className="md:col-span-3">
                    <textarea value={projectData.projectInfo.description} onChange={e => handleNestedUpdate('projectInfo', 'description', e.target.value)} rows={4} className="form-input" placeholder="Mô tả về dự án của bạn..." />
                </FormField>
                <FormField label="Thời gian bắt đầu dự án">
                    <input type="date" value={projectData.projectInfo.startDate} onChange={e => handleNestedUpdate('projectInfo', 'startDate', e.target.value)} className="form-input" />
                </FormField>
                <FormField label="Mức độ hoàn thiện" className="md:col-span-2">
                    <select value={projectData.projectInfo.completionLevel} onChange={e => handleNestedUpdate('projectInfo', 'completionLevel', e.target.value)} className="form-input" required><option value="" disabled>Chọn mức độ</option>{COMPLETION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                </FormField>

                <div className="md:col-span-3 border-t border-gray-700 my-2"></div>

                <FormField label="Người hướng dẫn dự án" className="md:col-span-3">
                    <div className="flex items-center space-x-6 mt-2">
                        <label className="flex items-center space-x-2 text-gray-300 cursor-pointer"><input type="radio" name="hasAdvisor" value="no" checked={projectData.projectInfo.advisor.hasAdvisor === 'no'} onChange={() => handleAdvisorChange('hasAdvisor', 'no')} className="h-4 w-4 radio-input" /><span>Không</span></label>
                        <label className="flex items-center space-x-2 text-gray-300 cursor-pointer"><input type="radio" name="hasAdvisor" value="yes" checked={projectData.projectInfo.advisor.hasAdvisor === 'yes'} onChange={() => handleAdvisorChange('hasAdvisor', 'yes')} className="h-4 w-4 radio-input" /><span>Có</span></label>
                    </div>
                </FormField>
                {projectData.projectInfo.advisor.hasAdvisor === 'yes' && (
                    <>
                        <FormField label="Họ và tên lót"><input type="text" value={projectData.projectInfo.advisor.lastName} onChange={e => handleAdvisorChange('lastName', e.target.value)} className="form-input" placeholder="Nguyễn Văn" required /></FormField>
                        <FormField label="Tên"><input type="text" value={projectData.projectInfo.advisor.firstName} onChange={e => handleAdvisorChange('firstName', e.target.value)} className="form-input" placeholder="B" required /></FormField>
                        <FormField label="Chức danh - Đơn vị/DN"><input type="text" value={projectData.projectInfo.advisor.title} onChange={e => handleAdvisorChange('title', e.target.value)} className="form-input" placeholder="Giảng viên - Đại học Văn Lang" required /></FormField>
                    </>
                )}

                <div className="md:col-span-3 border-t border-gray-700 my-2"></div>

                <FormField label="Đã đăng kí giấy phép thành lập doanh nghiệp" className="md:col-span-2">
                    <div className="flex items-center space-x-6 mt-2">
                        <label className="flex items-center space-x-2 text-gray-300 cursor-pointer"><input type="radio" name="hasBusinessLicense" value="no" checked={projectData.projectInfo.hasBusinessLicense === 'no'} onChange={e => handleNestedUpdate('projectInfo', 'hasBusinessLicense', 'no')} className="h-4 w-4 radio-input" /><span>Chưa</span></label>
                        <label className="flex items-center space-x-2 text-gray-300 cursor-pointer"><input type="radio" name="hasBusinessLicense" value="yes" checked={projectData.projectInfo.hasBusinessLicense === 'yes'} onChange={e => handleNestedUpdate('projectInfo', 'hasBusinessLicense', 'yes')} className="h-4 w-4 radio-input" /><span>Có</span></label>
                    </div>
                </FormField>
                {projectData.projectInfo.hasBusinessLicense === 'yes' && <FormField label="Mã số thuế"><input type="text" value={projectData.projectInfo.taxCode} onChange={e => handleNestedUpdate('projectInfo', 'taxCode', e.target.value)} className="form-input" placeholder="Nhập mã số thuế" required /></FormField>}

                <div className="md:col-span-3 border-t border-gray-700 my-2"></div>

                <FormField label="Tình trạng dự án" className="md:col-span-2">
                     <select value={projectData.projectInfo.projectStatus} onChange={e => handleNestedUpdate('projectInfo', 'projectStatus', e.target.value)} className="form-input" required><option value="" disabled>Chọn tình trạng</option>{PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </FormField>
                {projectData.projectInfo.projectStatus === 'Đã dừng' && <FormField label="Thời gian dừng hoạt động"><input type="date" value={projectData.projectInfo.stoppedDate} onChange={e => handleNestedUpdate('projectInfo', 'stoppedDate', e.target.value)} className="form-input" required /></FormField>}

                <div className="md:col-span-3 border-t border-gray-700 my-2"></div>

                <FormField label="File dự án (Pitchdeck, Thông tin chi tiết)" className="md:col-span-3">
                    <div className="grid md:grid-cols-2 gap-4">
                        <label className="file-upload-label"><UploadIcon className="h-5 w-5 mr-2" /><span>{projectData.projectInfo.pitchDeckFileName || 'Tải lên Pitchdeck (Slide)...'}</span><input type="file" onChange={(e) => handleFileChange('pitchDeck', e)} className="hidden" /></label>
                        <label className="file-upload-label"><UploadIcon className="h-5 w-5 mr-2" /><span>{projectData.projectInfo.projectDetailsFileName || 'Tải lên thông tin chi tiết...'}</span><input type="file" onChange={(e) => handleFileChange('projectDetailsFile', e)} className="hidden" /></label>
                    </div>
                </FormField>
                <FormField label="Ảnh đại diện dự án" className="md:col-span-3">
                    <label className="file-upload-label"><UploadIcon className="h-5 w-5 mr-2" /><span>{projectData.projectInfo.projectImageFileName || 'Tải lên ảnh đại diện...'}</span><input type="file" onChange={(e) => handleFileChange('projectImage', e)} className="hidden" accept="image/*"/></label>
                </FormField>

                <div className="md:col-span-3 border-t border-gray-700 my-2"></div>
                <h3 className="text-lg font-semibold text-teal-400 md:col-span-3">Link</h3>
                <FormField label="Website"><input type="url" value={projectData.projectInfo.websiteLink} onChange={e => handleNestedUpdate('projectInfo', 'websiteLink', e.target.value)} className="form-input" placeholder="https://example.com" /></FormField>
                <FormField label="Fanpage"><input type="url" value={projectData.projectInfo.fanpageLink} onChange={e => handleNestedUpdate('projectInfo', 'fanpageLink', e.target.value)} className="form-input" placeholder="https://facebook.com/..." /></FormField>
                <FormField label="Youtube"><input type="url" value={projectData.projectInfo.youtubeLink} onChange={e => handleNestedUpdate('projectInfo', 'youtubeLink', e.target.value)} className="form-input" placeholder="https://youtube.com/..." /></FormField>
                <FormField label="Bài truyền thông về dự án" className="md:col-span-3"><input type="url" value={projectData.projectInfo.mediaLink} onChange={e => handleNestedUpdate('projectInfo', 'mediaLink', e.target.value)} className="form-input" placeholder="Link bài báo, bài đăng,..." /></FormField>
            </div>
          </section>

          {/* Prize Value / Sponsorship Section */}
          <section className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 sm:p-8 shadow-lg space-y-8">
            <SectionHeader title="GIÁ TRỊ GIẢI THƯỞNG / TÀI TRỢ" />
            
            {/* Achievements */}
            <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-4">Thành tựu - Cuộc thi đã tham gia</h3>
                {projectData.prizeInfo.achievements.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-700 rounded-lg p-4 mb-4 relative">
                        <button type="button" onClick={() => removeDynamicListItem('achievements', item.id)} className="absolute -top-3 -right-3 p-1.5 bg-red-600 hover:bg-red-700 rounded-full"><TrashIcon className="h-4 w-4 text-white" /></button>
                        <FormField label="Tên cuộc thi" className="md:col-span-2"><input type="text" value={item.competitionName} onChange={e => handleDynamicListChange('achievements', index, e.target.value, 'competitionName')} className="form-input" /></FormField>
                        <FormField label="Thành tựu đạt được"><input type="text" value={item.achievement} onChange={e => handleDynamicListChange('achievements', index, e.target.value, 'achievement')} className="form-input" /></FormField>
                        <FormField label="Giá trị giải thưởng"><input type="text" value={item.prizeValue} onChange={e => handleDynamicListChange('achievements', index, e.target.value, 'prizeValue')} className="form-input" placeholder="e.g., 10000000" /></FormField>
                        <FormField label="Link cuộc thi truyền thông" className="md:col-span-2"><input type="url" value={item.link} onChange={e => handleDynamicListChange('achievements', index, e.target.value, 'link')} className="form-input" /></FormField>
                    </div>
                ))}
                <button type="button" onClick={() => addDynamicListItem('achievements', createNewAchievement)} className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-2"><PlusIcon className="h-4 w-4"/> Thêm thành tựu</button>
            </div>
            
            {/* Investments */}
            <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-4">Đầu tư đã nhận</h3>
                {projectData.prizeInfo.investments.map((item, index) => (
                     <div key={item.id} className="border border-gray-700 rounded-lg p-4 mb-4 relative">
                        <button type="button" onClick={() => removeDynamicListItem('investments', item.id)} className="absolute -top-3 -right-3 p-1.5 bg-red-600 hover:bg-red-700 rounded-full"><TrashIcon className="h-4 w-4 text-white" /></button>
                        <p className="text-md font-semibold text-gray-300 mb-2">{item.type === 'individual' ? 'Cá nhân' : 'Tổ chức/Doanh nghiệp'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Tên"><input type="text" value={item.name} onChange={e => handleDynamicListChange('investments', index, e.target.value, 'name')} className="form-input" /></FormField>
                            <FormField label="Số tiền"><input type="text" value={item.amount} onChange={e => handleDynamicListChange('investments', index, e.target.value, 'amount')} className="form-input" placeholder="e.g., 50000000" /></FormField>
                            <FormField label="Hình thức"><input type="text" value={item.form} onChange={e => handleDynamicListChange('investments', index, e.target.value, 'form')} className="form-input" /></FormField>
                        </div>
                    </div>
                ))}
                <div className="flex items-center gap-4 mt-2">
                    <button type="button" onClick={() => addDynamicListItem('investments', () => createNewInvestment('individual'))} className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Thêm nhà đầu tư cá nhân</button>
                    <button type="button" onClick={() => addDynamicListItem('investments', () => createNewInvestment('organization'))} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Thêm nhà đầu tư tổ chức</button>
                </div>
            </div>

             {/* Sponsorships */}
            <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-4">Đối tác tài trợ/hỗ trợ</h3>
                {projectData.prizeInfo.sponsorships.map((item, index) => (
                    <div key={item.id} className="border border-gray-700 rounded-lg p-4 mb-4 relative">
                        <button type="button" onClick={() => removeDynamicListItem('sponsorships', item.id)} className="absolute -top-3 -right-3 p-1.5 bg-red-600 hover:bg-red-700 rounded-full"><TrashIcon className="h-4 w-4 text-white" /></button>
                        <p className="text-md font-semibold text-gray-300 mb-2">{item.type === 'individual' ? 'Cá nhân' : 'Tổ chức/Doanh nghiệp'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField label="Tên" className="md:col-span-3"><input type="text" value={item.name} onChange={e => handleDynamicListChange('sponsorships', index, e.target.value, 'name')} className="form-input" /></FormField>
                            <FormField label="Nội dung tài trợ/hỗ trợ"><input type="text" value={item.content} onChange={e => handleDynamicListChange('sponsorships', index, e.target.value, 'content')} className="form-input" /></FormField>
                            <FormField label="Giá trị tài trợ/hỗ trợ"><input type="text" value={item.value} onChange={e => handleDynamicListChange('sponsorships', index, e.target.value, 'value')} className="form-input" placeholder="e.g., 5000000" /></FormField>
                        </div>
                    </div>
                ))}
                 <div className="flex items-center gap-4 mt-2">
                    <button type="button" onClick={() => addDynamicListItem('sponsorships', () => createNewSponsorship('individual'))} className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Thêm đối tác cá nhân</button>
                    <button type="button" onClick={() => addDynamicListItem('sponsorships', () => createNewSponsorship('organization'))} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Thêm đối tác tổ chức</button>
                </div>
            </div>
          </section>

          {/* Submission Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-3 w-full sm:w-auto justify-center bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-wait"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
              {isSubmitting ? 'Đang gửi...' : 'Đăng Ký'}
            </button>
          </div>
        </form>
  )
}

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'dashboard'>('form');
  const [submissions, setSubmissions] = useState<ProjectData[]>([]);

  const handleFormSubmit = (data: ProjectData) => {
    setSubmissions(prev => [...prev, data]);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                {view === 'form' ? 'Form Đăng Ký Dự Án' : 'Dashboard Tổng Quan'}
              </h1>
              <p className="mt-1 text-base text-gray-400">
                {view === 'form' ? 'Vui lòng điền đầy đủ thông tin bên dưới.' : `Phân tích dựa trên ${submissions.length} dự án đã nộp.`}
              </p>
          </div>
          <button
            onClick={() => setView(v => v === 'form' ? 'dashboard' : 'form')}
            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {view === 'form' ? <ChartBarIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
            <span>{view === 'form' ? 'Dashboard' : 'Quay lại Form'}</span>
          </button>
        </header>

        {view === 'form' ? (
          <RegistrationForm onFormSubmit={handleFormSubmit} />
        ) : (
          <Dashboard submissions={submissions} />
        )}
      </div>
    </div>
  );
};

// Inject base styles for reuse
const styleEl = document.createElement('style');
styleEl.innerHTML = `
    .form-input, .dashboard-select {
      width: 100%;
      background-color: #374151; /* bg-gray-700 */
      border: 1px solid #4B5563; /* border-gray-600 */
      color: #D1D5DB; /* text-gray-300 */
      border-radius: 0.375rem; /* rounded-md */
      padding: 0.5rem 1rem;
      transition: all 0.2s ease-in-out;
    }
    .form-input:focus, .form-input:focus-within, .dashboard-select:focus {
        outline: none;
        border-color: #14B8A6; /* border-teal-500 */
        box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.5);
    }
    .form-input::placeholder { color: #6B7280; /* text-gray-500 */ }
    .radio-input {
        color: #0D9488; /* text-teal-600 */
        background-color: #374151; /* bg-gray-700 */
        border-color: #4B5563; /* border-gray-600 */
        transition: all 0.2s ease-in-out;
    }
    .radio-input:checked {
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
    }
    .radio-input:focus {
        --tw-ring-color: #14B8A6;
    }
    .file-upload-label {
        width: 100%;
        background-color: #374151; /* bg-gray-700 */
        border: 2px dashed #4B5563; /* border-gray-600 */
        border-radius: 0.375rem; /* rounded-md */
        padding: 0.75rem 1rem;
        color: #9CA3AF; /* text-gray-400 */
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
    .file-upload-label:hover {
        border-color: #14B8A6; /* border-teal-500 */
        color: #5EEAD4; /* text-teal-300 */
    }
`;
document.head.appendChild(styleEl);


export default App;