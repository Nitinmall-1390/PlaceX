import React from 'react';
import { cn } from '../../utils';

export type StatusVariant = 'blue' | 'amber' | 'green' | 'red' | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  pulse?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, { bg: string; text: string; border: string; dot: string }> = {
  blue: {
    bg: 'bg-[#4C8DFF]/10',
    text: 'text-[#7DB0FF]',
    border: 'border-[#4C8DFF]/30',
    dot: 'bg-[#4C8DFF]',
  },
  amber: {
    bg: 'bg-[#F2A93B]/10',
    text: 'text-[#F2A93B]',
    border: 'border-[#F2A93B]/30',
    dot: 'bg-[#F2A93B]',
  },
  green: {
    bg: 'bg-[#34D399]/10',
    text: 'text-[#34D399]',
    border: 'border-[#34D399]/30',
    dot: 'bg-[#34D399]',
  },
  red: {
    bg: 'bg-[#F0555A]/10',
    text: 'text-[#F0555A]',
    border: 'border-[#F0555A]/30',
    dot: 'bg-[#F0555A]',
  },
  neutral: {
    bg: 'bg-[#262B38]/40',
    text: 'text-[#8B93A7]',
    border: 'border-[#262B38]',
    dot: 'bg-[#8B93A7]',
  },
};

// Automatic status to variant mapper
export const getStatusVariant = (status: string): StatusVariant => {
  const normalized = status?.toUpperCase() || '';
  
  if (['OFFERED', 'ACCEPTED', 'SELECTED', 'VERIFIED', 'PUBLISHED', 'COMPLETED', 'ACTIVE', 'PASSED'].includes(normalized)) {
    return 'green';
  }
  if (['INTERVIEW', 'SHORTLISTED', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'PENDING_APPROVAL', 'SCHEDULED'].includes(normalized)) {
    return 'amber';
  }
  if (['REJECTED', 'DECLINED', 'WITHDRAWN', 'SUSPENDED', 'CANCELLED', 'FAILED'].includes(normalized)) {
    return 'red';
  }
  if (['APPLIED', 'DRAFT', 'ONGOING', 'IN_PROGRESS', 'SENT'].includes(normalized)) {
    return 'blue';
  }

  return 'neutral';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  pulse = false,
  className,
}) => {
  const activeVariant = variant || getStatusVariant(status);
  const style = variantStyles[activeVariant];

  return (
    <span
      className={cn(
        'px-badge',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className={cn('px-pulse-dot', style.dot, !pulse && 'after:hidden')} />
      <span>{status?.replace(/_/g, ' ')}</span>
    </span>
  );
};

export default StatusBadge;
