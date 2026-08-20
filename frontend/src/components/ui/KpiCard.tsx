import React from 'react';
import { cn } from '../../utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type SignalColor = 'blue' | 'amber' | 'green' | 'red';

interface KpiCardProps {
  id?: string;             // e.g. "KPI 01"
  label: string;           // e.g. "TOTAL APPLICATIONS"
  value: string | number;
  icon?: React.ElementType;
  delta?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    text?: string;
  };
  signal?: SignalColor;
  className?: string;
}

const signalStyles: Record<SignalColor, { borderLeft: string; iconBg: string; iconText: string }> = {
  blue: {
    borderLeft: 'border-l-[#4C8DFF]',
    iconBg: 'bg-[#4C8DFF]/10',
    iconText: 'text-[#4C8DFF]',
  },
  amber: {
    borderLeft: 'border-l-[#F2A93B]',
    iconBg: 'bg-[#F2A93B]/10',
    iconText: 'text-[#F2A93B]',
  },
  green: {
    borderLeft: 'border-l-[#34D399]',
    iconBg: 'bg-[#34D399]/10',
    iconText: 'text-[#34D399]',
  },
  red: {
    borderLeft: 'border-l-[#F0555A]',
    iconBg: 'bg-[#F0555A]/10',
    iconText: 'text-[#F0555A]',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  label,
  value,
  icon: Icon,
  delta,
  signal = 'blue',
  className,
}) => {
  const style = signalStyles[signal];

  return (
    <div
      className={cn(
        'px-panel border-l-2 p-4 transition-all duration-150 hover:bg-[#171B24]',
        style.borderLeft,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium tracking-wider text-[#8B93A7] uppercase mb-1">
            {id && <span className="text-[#4C8DFF]">{id}</span>}
            {id && <span>//</span>}
            <span>{label}</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#E7EAF0] tracking-tight mt-1">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={cn('p-2.5 rounded-none border border-[#262B38]', style.iconBg, style.iconText)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Delta Chip */}
      {delta && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#262B38]/60 text-xs">
          <div
            className={cn(
              'flex items-center gap-1 font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-none border',
              delta.trend === 'up' && 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/30',
              delta.trend === 'down' && 'text-[#F0555A] bg-[#F0555A]/10 border-[#F0555A]/30',
              delta.trend === 'neutral' && 'text-[#4C8DFF] bg-[#4C8DFF]/10 border-[#4C8DFF]/30'
            )}
          >
            {delta.trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {delta.trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {delta.trend === 'neutral' && <Minus className="h-3 w-3" />}
            <span>{delta.value}</span>
          </div>
          {delta.text && <span className="text-[11px] text-[#565E70]">{delta.text}</span>}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
