import DashboardContent from '@/components/dashboard-content';

export default function HomePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Dashboard de Marketing</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral dos projetos de performance do Grupo HIGRA</p>
      </div>
      <DashboardContent />
    </div>
  );
}
