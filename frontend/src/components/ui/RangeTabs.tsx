import React from 'react';
import { cn } from '../../utils';

export interface TabOption {
  id: string;
  label: string;
}

interface RangeTabsProps {
  options: TabOption[];
  value: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const RangeTabs: React.FC<RangeTabsProps> = ({
  options,
  value,
  onChange,
  size = 'sm',
  className,
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-[#0A0C10] border border-[#262B38] p-0.5 rounded-none font-mono',
        className
      )}
    >
      {options.map((tab) => {
        const isActive = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3 transition-colors duration-150 text-center font-medium tracking-wide uppercase',
              size === 'sm' ? 'py-1 text-[11px]' : 'py-1.5 text-xs',
              isActive
                ? 'bg-[#4C8DFF] text-[#0A0C10] font-bold shadow-sm'
                : 'text-[#8B93A7] hover:text-[#E7EAF0] hover:bg-[#171B24]'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default RangeTabs;
