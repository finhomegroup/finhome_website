
import React from 'react';
import { Member } from '../types';
import FormField from './FormField';
import { VAN_LANG_FACULTIES } from '../constants';
import { UploadIcon } from './Icons';

interface MemberFormProps {
  member: Member;
  onUpdate: (field: keyof Member, value: any) => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onUpdate }) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    onUpdate('cv', file);
    onUpdate('cvFileName', file ? file.name : '');
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
      {/* Personal Info */}
      <FormField label="Họ và tên lót">
        <input type="text" value={member.lastName} onChange={e => onUpdate('lastName', e.target.value)} className="form-input" placeholder="Nguyễn Văn" required />
      </FormField>
      <FormField label="Tên">
        <input type="text" value={member.firstName} onChange={e => onUpdate('firstName', e.target.value)} className="form-input" placeholder="A" required />
      </FormField>
      <FormField label="Giới tính">
        <select value={member.gender} onChange={e => onUpdate('gender', e.target.value)} className="form-input" required>
          <option value="" disabled>Chọn giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
      </FormField>
      <FormField label="Dân tộc">
        <input type="text" value={member.ethnicity} onChange={e => onUpdate('ethnicity', e.target.value)} className="form-input" placeholder="Kinh" required />
      </FormField>
      <FormField label="MSSV">
        <input type="text" value={member.studentId} onChange={e => onUpdate('studentId', e.target.value)} className="form-input" placeholder="217..."/>
      </FormField>
      <FormField label="SĐT">
        <input type="tel" value={member.phone} onChange={e => onUpdate('phone', e.target.value)} className="form-input" placeholder="09..."/>
      </FormField>
      <FormField label="Email" className="sm:col-span-2 md:col-span-3">
        <input type="email" value={member.email} onChange={e => onUpdate('email', e.target.value)} className="form-input" placeholder="example@email.com" required/>
      </FormField>

      {/* School Info */}
      <div className="sm:col-span-2 md:col-span-3 border-t border-gray-700 my-4"></div>
      
      <FormField label="Trường" className="sm:col-span-2 md:col-span-3">
        <div className="flex items-center space-x-6 mt-2">
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input type="radio" name={`schoolType-${member.id}`} value="van_lang" checked={member.schoolType === 'van_lang'} onChange={() => onUpdate('schoolType', 'van_lang')} className="h-4 w-4 radio-input" />
                <span>Trường Đại học Văn Lang</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input type="radio" name={`schoolType-${member.id}`} value="other" checked={member.schoolType === 'other'} onChange={() => onUpdate('schoolType', 'other')} className="h-4 w-4 radio-input" />
                <span>Trường khác</span>
            </label>
        </div>
      </FormField>

      {member.schoolType === 'van_lang' ? (
        <>
            <FormField label="Khoa">
                <select value={member.faculty} onChange={e => onUpdate('faculty', e.target.value)} className="form-input" required>
                    <option value="" disabled>Chọn khoa</option>
                    {VAN_LANG_FACULTIES.map(faculty => (
                        <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                </select>
            </FormField>
            <FormField label="Ngành">
                <input type="text" value={member.major} onChange={e => onUpdate('major', e.target.value)} className="form-input" placeholder="Nhập ngành học" required/>
            </FormField>
        </>
      ) : (
         <>
            <FormField label="Tên trường">
                <input type="text" value={member.otherSchoolName} onChange={e => onUpdate('otherSchoolName', e.target.value)} className="form-input" placeholder="Nhập tên trường" required/>
            </FormField>
            <FormField label="Tên khoa">
                <input type="text" value={member.otherFacultyName} onChange={e => onUpdate('otherFacultyName', e.target.value)} className="form-input" placeholder="Nhập tên khoa" required/>
            </FormField>
            <FormField label="Tên ngành">
                <input type="text" value={member.otherMajorName} onChange={e => onUpdate('otherMajorName', e.target.value)} className="form-input" placeholder="Nhập tên ngành" required/>
            </FormField>
         </>
      )}

      <FormField label="CV (Nếu có)" className="sm:col-span-2 md:col-span-3">
        <label htmlFor={`cv-upload-${member.id}`} className="file-upload-label">
            <UploadIcon className="h-5 w-5 mr-2" />
            <span>{member.cvFileName || 'Tải lên tệp tin...'}</span>
        </label>
        <input id={`cv-upload-${member.id}`} type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
      </FormField>
    </div>
  );
};

export default MemberForm;
