import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'max-w-7xl',
}) => {
  return (
    <div className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 pt-4 sm:pt-5 pb-6 flex flex-col gap-4 text-[#482813] ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
