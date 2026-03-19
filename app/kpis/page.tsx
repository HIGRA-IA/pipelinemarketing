import KpiOverview from '@/components/kpi-overview';

export default function KpisPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">KPIs & Métricas</h1>
        <p className="text-slate-500 text-sm mt-1">Comparação de performance entre projetos ativos</p>
      </div>
      <KpiOverview />
    </div>
  );
}
