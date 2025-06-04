import React from 'react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  icon?: React.ReactNode;
  title: string;
  content: string;
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  contentClassName?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  content,
  className,
  iconClassName,
  titleClassName,
  contentClassName,
}) => {
  return (
    <div className={cn("flex flex-col p-6 bg-white rounded-lg shadow-md h-full", className)}>
      {icon && (
        <div className={cn("mb-4 text-[#5a9e97]", iconClassName)}>
          {icon}
        </div>
      )}
      <h3 className={cn("text-xl font-semibold mb-2 text-gray-800", titleClassName)}>
        {title}
      </h3>
      <p className={cn("text-gray-600 flex-grow", contentClassName)}>
        {content}
      </p>
    </div>
  );
};

export default InfoCard;