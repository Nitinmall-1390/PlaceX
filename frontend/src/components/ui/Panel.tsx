import React from 'react';
import { cn } from '../../utils';

interface PanelProps {
  id?: string;             // e.g. "PANEL 01"
  label?: string;          // e.g. "APPLICATION PIPELINE"
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  raised?: boolean;
  brackets?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  id,
  label,
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  raised = false,
  brackets = true,
}) => {
  return (
    <div
      className={cn(
        raised ? 'px-panel-raised' : 'px-panel',
        brackets && 'px-bracket-corners',
        'p-5 transition-colors duration-150',
        className
      )}
    >
      {/* Panel Header */}
      {(id || label || title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#262B38]">
          <div>
            {(id || label) && (
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#8B93A7] uppercase mb-1">
                {id && <span className="text-[#4C8DFF] font-semibold">{id}</span>}
                {id && label && <span className="text-[#565E70]">·</span>}
                {label && <span>{label}</span>}
              </div>
            )}
            {title && (
              <h3 className="text-base font-bold text-[#E7EAF0] tracking-tight font-display">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#8B93A7] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      {/* Panel Content */}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};

export default Panel;
