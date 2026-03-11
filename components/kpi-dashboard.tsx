'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, Target, TrendingUp, DollarSign, BarChart3, Users, Percent } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface Props {
  project: any;
  channelData: any[];
  onUpdate: () => void;
}

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function KpiDashboard({ project, channelData = [], onUpdate }: Props) {
  const [saving, setSaving] = useState(false);
  const [targets, setTargets] = useState({
    targetCpl: project?.targetCpl ?? 600,
    targetMqlToSql: project?.targetMqlToSql ?? 30,
    targetCtr: project?.targetCtr ?? 2,
    targetCustoMql: project?.targetCustoMql ?? 400,
    targetCustoSql: project?.targetCustoSql ?? 1000,
  });

  // Calcula KPIs agregados a partir dos dados de canais
  const kpiCalculations = useMemo(() => {
    if (!channelData?.length) return null;

    const totals = channelData.reduce(
      (acc, d) => ({
        cost: acc.cost + (d?.cost ?? 0),
        leads: acc.leads + (d?.leads ?? 0),
        mqls: acc.mqls + (d?.mqls ?? 0),
        sqls: acc.sqls + (d?.sqls ?? 0),
        clicks: acc.clicks + (d?.clicks ?? 0),
        impressions: acc.impressions + (d?.impressions ?? 0),
      }),
      { cost: 0, leads: 0, mqls: 0, sqls: 0, clicks: 0, impressions: 0 }
    );

    return {
      cpl: totals.leads > 0 ? totals.cost / totals.leads : 0,
      mqlToSql: totals.mqls > 0 ? (totals.sqls / totals.mqls) * 100 : 0,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      custoMql: totals.mqls > 0 ? totals.cost / totals.mqls : 0,
      custoSql: totals.sqls > 0 ? totals.cost / totals.sqls : 0,
      totals,
    };
  }, [channelData]);

  // Calcula KPIs por semana para o gráfico
  const weeklyKpis = useMemo(() => {
    if (!channelData?.length) return [];

    const grouped: Record<string, any> = {};

    channelData.forEach((d) => {
      const key = `${d?.year}-${d?.month}-${d?.weekNumber}`;
      if (!grouped[key]) {
        grouped[key] = {
          year: d?.year,
          month: d?.month,
          weekNumber: d?.weekNumber,
          cost: 0,
          leads: 0,
          mqls: 0,
          sqls: 0,
          clicks: 0,
          impressions: 0,
        };
      }
      grouped[key].cost += d?.cost ?? 0;
      grouped[key].leads += d?.leads ?? 0;
      grouped[key].mqls += d?.mqls ?? 0;
      grouped[key].sqls += d?.sqls ?? 0;
      grouped[key].clicks += d?.clicks ?? 0;
      grouped[key].impressions += d?.impressions ?? 0;
    });

    return Object.values(grouped)
      .sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return a.weekNumber - b.weekNumber;
      })
      .map((w: any) => ({
        label: `S${w.weekNumber} ${MONTH_NAMES[w.month - 1]}/${w.year}`,
        cpl: w.leads > 0 ? w.cost / w.leads : 0,
        mqlToSql: w.mqls > 0 ? (w.sqls / w.mqls) * 100 : 0,
        ctr: w.impressions > 0 ? (w.clicks / w.impressions) * 100 : 0,
        custoMql: w.mqls > 0 ? w.cost / w.mqls : 0,
        custoSql: w.sqls > 0 ? w.cost / w.sqls : 0,
      }));
  }, [channelData]);

  // Salvar metas
  const handleSaveTargets = async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${project?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targets),
      });
      onUpdate?.();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  // Função para calcular atingimento
  const calcAtingimento = (atual: number, meta: number, inverso = false) => {
    if (!meta || meta === 0) return 0;
    if (inverso) {
      // Para métricas onde menor é melhor (CPL, Custo MQL, Custo SQL)
      return meta > 0 ? (meta / atual) * 100 : 0;
    }
    return (atual / meta) * 100;
  };

  const kpiCards = [
    {
      key: 'cpl',
      label: 'CPL',
      value: kpiCalculations?.cpl ?? 0,
      meta: targets.targetCpl,
      format: 'currency',
      icon: DollarSign,
      color: '#FF9149',
      inverso: true,
      description: 'Valor investido / Leads',
    },
    {
      key: 'mqlToSql',
      label: 'MQL → SQL',
      value: kpiCalculations?.mqlToSql ?? 0,
      meta: targets.targetMqlToSql,
      format: 'percent',
      icon: Target,
      color: '#80D8C3',
      inverso: false,
      description: 'SQL / MQL',
    },
    {
      key: 'ctr',
      label: 'CTR',
      value: kpiCalculations?.ctr ?? 0,
      meta: targets.targetCtr,
      format: 'percent',
      icon: BarChart3,
      color: '#A19AD3',
      inverso: false,
      description: 'Cliques / Impressões',
    },
    {
      key: 'custoMql',
      label: 'Custo MQL',
      value: kpiCalculations?.custoMql ?? 0,
      meta: targets.targetCustoMql,
      format: 'currency',
      icon: Users,
      color: '#60B5FF',
      inverso: true,
      description: 'Valor investido / MQL',
    },
    {
      key: 'custoSql',
      label: 'Custo SQL',
      value: kpiCalculations?.custoSql ?? 0,
      meta: targets.targetCustoSql,
      format: 'currency',
      icon: TrendingUp,
      color: '#FF6363',
      inverso: true,
      description: 'Valor investido / SQL',
    },
  ];

  const [selectedKpi, setSelectedKpi] = useState('cpl');
  const selectedKpiData = kpiCards.find((k) => k.key === selectedKpi);

  return (
    <div className="space-y-6">
      {/* Área de Metas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-5 text-white"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target size={20} /> Metas do Projeto
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-white/70 mb-1">Meta CPL (R$)</label>
            <input
              type="number"
              value={targets.targetCpl}
              onChange={(e) => setTargets((p) => ({ ...p, targetCpl: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/70 mb-1">Meta MQL→SQL (%)</label>
            <input
              type="number"
              value={targets.targetMqlToSql}
              onChange={(e) => setTargets((p) => ({ ...p, targetMqlToSql: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/70 mb-1">Meta CTR (%)</label>
            <input
              type="number"
              step="0.1"
              value={targets.targetCtr}
              onChange={(e) => setTargets((p) => ({ ...p, targetCtr: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/70 mb-1">Meta Custo MQL (R$)</label>
            <input
              type="number"
              value={targets.targetCustoMql}
              onChange={(e) => setTargets((p) => ({ ...p, targetCustoMql: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-white/70 mb-1">Meta Custo SQL (R$)</label>
            <input
              type="number"
              value={targets.targetCustoSql}
              onChange={(e) => setTargets((p) => ({ ...p, targetCustoSql: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSaveTargets}
          disabled={saving}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg text-sm font-medium hover:bg-accent-light transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Metas'}
        </button>
      </motion.div>

      {/* Cards de KPIs com Atingimento */}
      {kpiCalculations ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            const atingimento = calcAtingimento(card.value, card.meta, card.inverso);
            const isGreen = atingimento >= 80;
            const displayValue =
              card.format === 'currency' ? formatCurrency(card.value) : formatPercent(card.value);
            const metaDisplay =
              card.format === 'currency' ? formatCurrency(card.meta) : `${card.meta}%`;

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedKpi(card.key)}
                className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  selectedKpi === card.key ? 'ring-2 ring-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${card.color}15` }}>
                    <Icon size={14} style={{ color: card.color }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{card.label}</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{displayValue}</p>
                <p className="text-xs text-slate-400 mt-1">Meta: {metaDisplay}</p>

                {/* Box de Atingimento */}
                <div
                  className={`mt-3 px-3 py-2 rounded-lg text-center ${
                    isGreen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Percent size={14} />
                    <span className="font-bold text-sm">{atingimento.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs">Atingimento</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-8 text-center">
          <p className="text-slate-500">Adicione dados nos Canais de Marketing para ver os KPIs calculados.</p>
        </div>
      )}

      {/* Gráfico de Linha por Semana */}
      {weeklyKpis.length > 0 && selectedKpiData && (() => {
        // Calculate historical average for the selected KPI
        const kpiValues = weeklyKpis.map((w: any) => w[selectedKpi]).filter((v: number) => v > 0);
        const historicalAverage = kpiValues.length > 0 
          ? kpiValues.reduce((sum: number, v: number) => sum + v, 0) / kpiValues.length 
          : 0;
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {selectedKpiData.label} por Semana
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyKpis}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      selectedKpiData.format === 'currency' ? `R$${v.toFixed(0)}` : `${v.toFixed(1)}%`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      selectedKpiData.format === 'currency'
                        ? formatCurrency(value)
                        : formatPercent(value)
                    }
                  />
                  <Legend />
                  <ReferenceLine
                    y={selectedKpiData.meta}
                    stroke="#FF6363"
                    strokeDasharray="5 5"
                    label={{ value: `Meta: ${selectedKpiData.format === 'currency' ? formatCurrency(selectedKpiData.meta) : `${selectedKpiData.meta}%`}`, fill: '#FF6363', fontSize: 11, position: 'right' }}
                  />
                  {historicalAverage > 0 && (
                    <ReferenceLine
                      y={historicalAverage}
                      stroke="#60B5FF"
                      strokeDasharray="3 3"
                      label={{ value: `Média: ${selectedKpiData.format === 'currency' ? formatCurrency(historicalAverage) : `${historicalAverage.toFixed(1)}%`}`, fill: '#60B5FF', fontSize: 11, position: 'left' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey={selectedKpi}
                    name="Resultado"
                    stroke={selectedKpiData.color}
                    strokeWidth={3}
                    dot={{ fill: selectedKpiData.color, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-3">
              <p className="text-xs text-slate-400">
                Fórmula: {selectedKpiData.description}
              </p>
              {historicalAverage > 0 && (
                <p className="text-xs text-blue-500">
                  Média histórica: {selectedKpiData.format === 'currency' ? formatCurrency(historicalAverage) : `${historicalAverage.toFixed(2)}%`}
                </p>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Resumo dos Dados Base */}
      {kpiCalculations && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 rounded-xl p-5"
        >
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Dados Base (Canais de Marketing)</h4>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Investido</p>
              <p className="font-semibold text-slate-800">{formatCurrency(kpiCalculations.totals.cost)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Leads</p>
              <p className="font-semibold text-slate-800">{kpiCalculations.totals.leads}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">MQLs</p>
              <p className="font-semibold text-slate-800">{kpiCalculations.totals.mqls}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">SQLs</p>
              <p className="font-semibold text-slate-800">{kpiCalculations.totals.sqls}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Cliques</p>
              <p className="font-semibold text-slate-800">{kpiCalculations.totals.clicks}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Impressões</p>
              <p className="font-semibold text-slate-800">{kpiCalculations.totals.impressions.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
