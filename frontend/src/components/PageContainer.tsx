import React from 'react';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <section className={`bg-white rounded-xl shadow-xs border border-neutral-200 p-6 md:p-8 max-w-5xl mx-auto ${className}`}>
      {title && (
        <div className="mb-6 pb-4 border-b border-neutral-100">
          <h2 className="text-2xl font-bold text-neutral-800 tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
};

export default PageContainer;
