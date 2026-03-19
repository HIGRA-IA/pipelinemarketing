import ScheduleView from '@/components/schedule-view';

export default function CronogramaPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cronograma</h1>
        <p className="text-sm text-slate-500 mt-1">Visualize o planejamento de todos os projetos por deadline</p>
      </div>
      <ScheduleView />
    </div>
  );
}
