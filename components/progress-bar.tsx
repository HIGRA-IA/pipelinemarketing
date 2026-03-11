'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value = 0, color = '#00c853', height = 8, showLabel = true }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-500">Progresso</span>
          <span className="text-xs font-semibold text-slate-700">{safeValue}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
