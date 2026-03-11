'use client';

import { STATUS_OPTIONS, TASK_STATUS_OPTIONS } from '@/lib/template-data';

export default function StatusBadge({ status, type = 'project' }: { status?: string; type?: 'project' | 'task' }) {
  const options = type === 'task' ? TASK_STATUS_OPTIONS : STATUS_OPTIONS;
  const found = options?.find?.(s => s?.value === status) ?? options?.[0];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: found?.color ?? '#A19AD3' }}
    >
      {found?.label ?? status ?? 'Desconhecido'}
    </span>
  );
}
