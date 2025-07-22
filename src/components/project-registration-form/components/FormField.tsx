
import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, className = '' }) => {
  return (
    <div className={className}>
      <label className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      {children}
    </div>
  );
};

export default FormField;
