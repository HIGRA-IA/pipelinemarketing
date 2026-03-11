import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '0%';
  return `${value?.toFixed?.(1) ?? '0'}%`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  } catch {
    return '-';
  }
}

export function getSprintStatus(startDate: Date, endDate: Date): string {
  const now = new Date();
  if (now < startDate) return 'pendente';
  if (now > endDate) return 'concluido';
  return 'em_andamento';
}

export function calcProgress(tasks: Array<{ status?: string }>): number {
  if (!tasks?.length) return 0;
  // Considera "nao_aplicavel" como concluída no cálculo de progresso
  const done = tasks?.filter?.(t => t?.status === 'concluido' || t?.status === 'nao_aplicavel')?.length ?? 0;
  return Math.round((done / tasks.length) * 100);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
