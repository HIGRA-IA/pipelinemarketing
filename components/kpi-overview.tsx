'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';

const ComparisonCharts = dynamic(() => import('./comparison-charts'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div> });

interface ChannelData {
  cost: number;
  leads: number;
  mqls: number;
  sqls: number;
  clicks: number;
  impressions: number;
}

interface ProjectKpis {
  cpl: number | null;
  mqlToSql: number | null;
  ctr: number | null;
  custoMql: number | null;
  custoSql: number | null;
  totalCost: number;
  totalLeads: number;
  totalMqls: number;
  totalSqls: number;
}

function calcProjectKpis(channelData: ChannelData[]): ProjectKpis {
  const totals = (channelData ?? []).reduce(
    (acc, ch) => ({
      cost: acc.cost + (ch?.cost ?? 0),
      leads: acc.leads + (ch?.leads ?? 0),
      mqls: acc.mqls + (ch?.mqls ?? 0),
      sqls: acc.sqls + (ch?.sqls ?? 0),
      clicks: acc.clicks + (ch?.clicks ?? 0),
      impressions: acc.impressions + (ch?.impressions ?? 0),
    }),
    { cost: 0, leads: 0, mqls: 0, sqls: 0, clicks: 0, impressions: 0 }
  );

  return {
    cpl: totals.leads > 0 ? totals.cost / totals.leads : null,
    mqlToSql: totals.mqls > 0 ? (totals.sqls / totals.mqls) * 100 : null,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : null,
    custoMql: totals.mqls > 0 ? totals.cost / totals.mqls : null,
    custoSql: totals.sqls > 0 ? totals.cost / totals.sqls : null,
    totalCost: totals.cost,
    totalLeads: totals.leads,
    totalMqls: totals.mqls,
    totalSqls: totals.sqls,
  };
}

export default function KpiOverview() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setProjects(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const projectsWithKpis = useMemo(() => {
    return (projects ?? []).map((p: any) => ({
      ...p,
      calculatedKpis: calcProjectKpis(p?.channelData ?? []),
    })).filter((p: any) => (p?.channelData?.length ?? 0) > 0);
  }, [projects]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (projectsWithKpis.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center shadow-sm">
        <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">Sem dados para comparar</h3>
        <p className="text-slate-400">Adicione dados de canais de marketing nos projetos para visualizar comparações</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project KPI Summary Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-accent" /> Resumo de KPIs por Projeto</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Projeto</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">CPL</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">MQL→SQL</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">CTR</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Custo MQL</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Custo SQL</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Investido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectsWithKpis.map((p: any) => {
                const kpis = p.calculatedKpis;
                return (
                  <tr key={p?.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="text-xs text-accent block">{p?.company?.name}</span>
                      <span className="font-medium">{p?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{kpis.cpl != null ? formatCurrency(kpis.cpl) : '-'}</td>
                    <td className="px-4 py-3 text-right">{kpis.mqlToSql != null ? formatPercent(kpis.mqlToSql) : '-'}</td>
                    <td className="px-4 py-3 text-right">{kpis.ctr != null ? formatPercent(kpis.ctr) : '-'}</td>
                    <td className="px-4 py-3 text-right">{kpis.custoMql != null ? formatCurrency(kpis.custoMql) : '-'}</td>
                    <td className="px-4 py-3 text-right">{kpis.custoSql != null ? formatCurrency(kpis.custoSql) : '-'}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(kpis.totalCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Comparison Charts */}
      <ComparisonCharts projects={projectsWithKpis} />
    </div>
  );
}
