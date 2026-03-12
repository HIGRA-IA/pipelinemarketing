'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FolderKanban, TrendingUp, Target, DollarSign, Users, ArrowRight, AlertCircle, Plus, BarChart3, Calculator } from 'lucide-react';
import AnimatedCounter from './animated-counter';
import ProgressBar from './progress-bar';
import StatusBadge from './status-badge';
import { formatCurrency, formatDate, calcProgress } from '@/lib/utils';

interface ChannelData {
  id: string;
  cost: number;
  leads: number;
  sqls: number;
}

interface ProjectData {
  id: string;
  name: string;
  theme: string;
  status: string;
  startDate: string;
  endDate: string;
  budgetTraffic: number;
  targetCpl: number;
  company: { name: string };
  sprints: Array<{ number: number; name: string; startDate?: string; endDate?: string; tasks: Array<{ status: string }> }>;
  channelData?: ChannelData[];
  _count: { channelData: number; kpiEntries: number };
}

const getProjectHealth = (project: any, progress: number) => {
  const now = new Date();
  const start = new Date(project?.startDate);
  const end = new Date(project?.endDate);
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const expectedProgress = totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 0;
  const diff = progress - expectedProgress;
  if (diff >= -10) return { label: 'No prazo', color: '#00c853', emoji: '🟢' };
  if (diff >= -25) return { label: 'Atenção', color: '#FF9149', emoji: '🟡' };
  return { label: 'Atrasado', color: '#ef4444', emoji: '🔴' };
};

export default function DashboardContent() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setProjects(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculate totals and averages for marketing metrics (must be before any conditional returns)
  const marketingMetrics = useMemo(() => {
    const allChannelData = projects?.flatMap?.(p => p?.channelData ?? []) ?? [];
    const projectsWithData = projects?.filter?.(p => (p?.channelData?.length ?? 0) > 0) ?? [];
    const numProjects = projectsWithData.length || 1;

    const totals = {
      cost: allChannelData?.reduce?.((sum, c) => sum + (c?.cost ?? 0), 0) ?? 0,
      leads: allChannelData?.reduce?.((sum, c) => sum + (c?.leads ?? 0), 0) ?? 0,
      sqls: allChannelData?.reduce?.((sum, c) => sum + (c?.sqls ?? 0), 0) ?? 0,
    };

    const averages = {
      cost: totals.cost / numProjects,
      leads: totals.leads / numProjects,
      sqls: totals.sqls / numProjects,
    };

    return { totals, averages, hasData: allChannelData.length > 0 };
  }, [projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeProjects = projects?.filter?.(p => ['planejamento', 'em_andamento'].includes(p?.status?.toLowerCase?.() ?? '')) ?? [];
  const totalTasks = projects?.flatMap?.(p => p?.sprints?.flatMap?.(s => s?.tasks ?? []) ?? []) ?? [];
  const completedTasks = totalTasks?.filter?.(t => t?.status === 'concluido') ?? [];
  const totalBudget = projects?.reduce?.((sum, p) => sum + (p?.budgetTraffic ?? 0), 0) ?? 0;

  const stats = [
    { label: 'Projetos Ativos', value: activeProjects?.length ?? 0, icon: FolderKanban, color: '#1e3a5f' },
    { label: 'Tarefas Concluídas', value: completedTasks?.length ?? 0, suffix: `/${totalTasks?.length ?? 0}`, icon: Target, color: '#00c853' },
    { label: 'Orçamento Total', value: totalBudget, prefix: 'R$ ', icon: DollarSign, color: '#FF9149' },
    { label: 'Total Projetos', value: projects?.length ?? 0, icon: Users, color: '#A19AD3' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.map?.((stat, i) => {
          const Icon = stat?.icon;
          return (
            <motion.div
              key={stat?.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat?.color}15` }}>
                  {Icon && <Icon size={20} style={{ color: stat?.color }} />}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {stat?.prefix}{stat?.label === 'Orçamento Total' ? stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) : (stat?.value ?? 0)}
                {stat?.suffix && <span className="text-sm text-slate-400">{stat.suffix}</span>}
              </p>
              <p className="text-xs text-slate-500 mt-1">{stat?.label}</p>
            </motion.div>
          );
        }) ?? []}
      </div>

      {/* Marketing Metrics Dashboards */}
      {marketingMetrics.hasData && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Totals Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-5 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-semibold">Total de Todos os Projetos</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                  <DollarSign size={12} />
                  Custo Total
                </div>
                <p className="text-lg font-bold">{formatCurrency(marketingMetrics.totals.cost)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                  <Users size={12} />
                  Total Leads
                </div>
                <p className="text-lg font-bold">{marketingMetrics.totals.leads.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                  <Target size={12} />
                  Total SQLs
                </div>
                <p className="text-lg font-bold">{marketingMetrics.totals.sqls.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </motion.div>

          {/* Averages Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-accent to-accent-dark rounded-xl p-5 text-white shadow-lg"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <Calculator size={20} />
              </div>
              <h3 className="font-semibold">Média por Projeto</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                  <DollarSign size={12} />
                  Custo Médio
                </div>
                <p className="text-lg font-bold">{formatCurrency(marketingMetrics.averages.cost)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                  <Users size={12} />
                  Média Leads
                </div>
                <p className="text-lg font-bold">{Math.round(marketingMetrics.averages.leads).toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1 text-white/70 text-xs mb-1">
                  <Target size={12} />
                  Média SQLs
                </div>
                <p className="text-lg font-bold">{Math.round(marketingMetrics.averages.sqls).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Company Status Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Status por Empresa</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {['HIGRA Industrial', 'HIGRA Systems', 'HIGRA Customer Service', 'HIGRA Service Sul', 'HIGRA Motors', 'HIGRA Mining', 'Voltson Brasil'].map(companyName => {
            const companyProjects = projects.filter(p => p?.company?.name === companyName);
            const hasActive = companyProjects.some(p => ['planejamento', 'em_andamento'].includes(p?.status?.toLowerCase?.() ?? ''));
            const activeCount = companyProjects.filter(p => ['planejamento', 'em_andamento'].includes(p?.status?.toLowerCase?.() ?? '')).length;
            return (
              <div key={companyName} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${hasActive ? 'border-green-500' : 'border-slate-200'}`}>
                <p className="text-xs font-semibold text-slate-700 leading-tight">{companyName}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: hasActive ? '#00c853' : '#94a3b8' }}>{activeCount}</p>
                <p className="text-[10px] text-slate-400">{hasActive ? `projeto${activeCount > 1 ? 's' : ''} ativo${activeCount > 1 ? 's' : ''}` : 'sem projetos ativos'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Projetos Ativos</h2>
          <Link
            href="/projetos/novo"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors shadow-sm"
          >
            <Plus size={16} /> Novo Projeto
          </Link>
        </div>

        {(activeProjects?.length ?? 0) === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-10 text-center shadow-sm">
            <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhum projeto ativo no momento</p>
            <Link href="/projetos/novo" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
              <Plus size={16} /> Criar Primeiro Projeto
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeProjects?.map?.((project, i) => {
              const allTasks = project?.sprints?.flatMap?.(s => s?.tasks ?? []) ?? [];
              const progress = calcProgress(allTasks);
              const health = getProjectHealth(project, progress);
              const currentSprint = project?.sprints?.find?.(s => {
                const now = new Date();
                return new Date(s?.startDate ?? '') <= now && now <= new Date(s?.endDate ?? '');
              }) ?? project?.sprints?.[0];

              return (
                <motion.div
                  key={project?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-accent font-semibold">{project?.company?.name}</p>
                      <h3 className="text-base font-bold text-slate-800 mt-0.5">{project?.name}</h3>
                      {project?.theme && <p className="text-xs text-slate-500 mt-0.5">{project.theme}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={project?.status} />
                      <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: health.color }}>
                        {health.emoji} {health.label}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <ProgressBar value={progress} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-4">
                    <div>
                      <span className="text-slate-400">Sprint Atual</span>
                      <p className="font-medium">{currentSprint ? `${currentSprint?.number} - ${currentSprint?.name}` : '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Período</span>
                      <p className="font-medium">{formatDate(project?.startDate)} - {formatDate(project?.endDate)}</p>
                    </div>
                  </div>

                  <Link
                    href={`/projetos/${project?.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary/5 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all"
                  >
                    Ver Detalhes <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            }) ?? []}
          </div>
        )}
      </div>

      {/* All Projects */}
      {(projects?.length ?? 0) > (activeProjects?.length ?? 0) && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Todos os Projetos</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Empresa</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Projeto</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Período</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Progresso</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects?.map?.((p) => {
                    const allTasks = p?.sprints?.flatMap?.(s => s?.tasks ?? []) ?? [];
                    return (
                      <tr key={p?.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium">{p?.company?.name}</td>
                        <td className="px-4 py-3">{p?.name}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDate(p?.startDate)} - {formatDate(p?.endDate)}</td>
                        <td className="px-4 py-3"><StatusBadge status={p?.status} /></td>
                        <td className="px-4 py-3 w-32"><ProgressBar value={calcProgress(allTasks)} showLabel={false} height={6} /></td>
                        <td className="px-4 py-3"><Link href={`/projetos/${p?.id}`} className="text-primary hover:underline">Ver</Link></td>
                      </tr>
                    );
                  }) ?? []}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
