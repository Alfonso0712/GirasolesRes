import React from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';

export interface FormMessageProps {
  type?: 'success' | 'error' | 'info' | 'warning' | '';
  message?: string | null;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ type, message, className = 'p-3 mb-3' }) => {
  if (!message) return null;

  let styleClasses = 'bg-[#FDF2F2] text-[#9B1C1C] border border-[#F8B4B4] font-semibold tracking-wide';
  let icon = <AlertTriangle className="w-4 h-4 text-[#C81E1E] shrink-0" />;

  if (type === 'success') {
    styleClasses = 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium';
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
  } else if (type === 'info') {
    styleClasses = 'bg-amber-50 text-amber-900 border border-amber-200 font-medium';
    icon = <Info className="w-4 h-4 text-[#D35400] shrink-0" />;
  } else if (type === 'warning') {
    styleClasses = 'bg-amber-50 text-amber-800 border border-amber-300 font-medium';
    icon = <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
  }

  return (
    <div
      role="alert"
      className={`rounded-xl text-xs flex items-center gap-2.5 transition-all ${className} ${styleClasses}`}
    >
      {icon}
      <span className="leading-snug">{message}</span>
    </div>
  );
};

export default FormMessage;
