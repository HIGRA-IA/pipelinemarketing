'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save, TrendingUp, BarChart3, Users, DollarSign, Target, X, Filter, Activity, Pencil, Trash2, Download, Layers } from 'lucide-react';
import { MARKETING_CHANNELS } from '@/lib/template-data';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  projectId: string;
  channelData: any[];
  onUpdate: () => void;
}

type MetricFilter = 'all' | 'cost' | 'mqls' | 'sqls';
type ViewMode = 'cumulative' | 'isolated';

// Helper to get weeks in a month
const getWeeksInMonth = (year: number, month: number): number[] => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();
  const weeks: number[] = [];
  
  let weekNum = 1;
  for (let day = 1; day <= totalDays; day += 7) {
    weeks.push(weekNum);
    weekNum++;
  }
  return weeks;
};

// Helper to format period label
const formatPeriodLabel = (year: number, month: number, week: number): string => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `S${week} ${monthNames[month - 1]}/${year}`;
};

// Line colors for different channels
const CHANNEL_COLORS: Record<string, string> = {
  'google_ads': '#4285F4',
  'meta_ads': '#0668E1',
  'youtube_ads': '#FF0000',
  'seo': '#34A853',
  'landing_page': '#FBBC05',
  'blog': '#EA4335',
  'youtube_organic': '#FF0000',
  'linkedin': '#0A66C2',
  'instagram': '#E4405F',
  'sprinthub': '#6366F1',
  'sdr': '#8B5CF6',
};

export default function ChannelDataForm({ projectId, channelData = [], onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('isolated');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear();
  const [form, setForm] = useState({
    channel: '',
    subChannel: '',
    year: currentYear,
    month: 1,
    weekNumber: 1,
    impressions: 0,
    clicks: 0,
    cost: 0,
    leads: 0,
    mqls: 0,
    sqls: 0,
    notes: '',
  });

  // Available weeks based on selected month
  const availableWeeks = useMemo(() => {
    return getWeeksInMonth(form.year, form.month);
  }, [form.year, form.month]);

  const resetForm = () => {
    setForm({ channel: '', subChannel: '', year: currentYear, month: 1, weekNumber: 1, impressions: 0, clicks: 0, cost: 0, leads: 0, mqls: 0, sqls: 0, notes: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/channels/${editingId}` : '/api/channels';
      const method = editingId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, projectId }),
      });
      setShowForm(false);
      resetForm();
      onUpdate?.();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleEdit = (entry: any) => {
    setForm({
      channel: entry.channel || '',
      subChannel: entry.subChannel || '',
      year: entry.year || currentYear,
      month: entry.month || 1,
      weekNumber: entry.weekNumber || 1,
      impressions: entry.impressions || 0,
      clicks: entry.clicks || 0,
      cost: entry.cost || 0,
      leads: entry.leads || 0,
      mqls: entry.mqls || 0,
      sqls: entry.sqls || 0,
      notes: entry.notes || '',
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      await fetch(`/api/channels/${id}`, { method: 'DELETE' });
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

  const handleExportXLSX = async () => {
    const XLSX = await import('xlsx');
    
    const exportData = channelData.map(entry => {
      const channelInfo = MARKETING_CHANNELS?.find(c => c?.key === entry?.channel);
      return {
        'Canal': channelInfo?.name ?? entry?.channel,
        'Categoria': channelInfo?.category ?? 'Outros',
        'Ano': entry?.year ?? '',
        'Mês': entry?.month ?? '',
        'Semana': entry?.weekNumber ?? '',
        'Custo (R$)': entry?.cost ?? 0,
        'Impressões': entry?.impressions ?? 0,
        'Cliques': entry?.clicks ?? 0,
        'Leads': entry?.leads ?? 0,
        'MQLs': entry?.mqls ?? 0,
        'SQLs': entry?.sqls ?? 0,
        'Observações': entry?.notes ?? '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados de Canais');
    
    const summaryData = Object.entries(channelTotals).map(([key, data]) => ({
      'Canal': data.name,
      'Categoria': data.category,
      'Custo Total (R$)': data.cost,
      'Total Impressões': data.impressions,
      'Total Cliques': data.clicks,
      'Total Leads': data.leads,
      'Total MQLs': data.mqls,
      'Total SQLs': data.sqls,
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo por Canal');
    
    XLSX.writeFile(workbook, `canais-marketing-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Group channel data by category
  const categories = [...new Set(MARKETING_CHANNELS?.map?.(c => c?.category) ?? [])];
  const grouped: Record<string, any[]> = {};
  for (const entry of channelData ?? []) {
    const cat = MARKETING_CHANNELS?.find?.(c => c?.key === entry?.channel)?.category ?? 'Outros';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  const categoryColors: Record<string, string> = {
    'Tráfego Pago': '#FF9149',
    'Tráfego Orgânico': '#80D8C3',
    'E-mail Marketing': '#60B5FF',
    'Prospecção Ativa': '#A19AD3',
  };

  // Calculate totals per channel
  const channelTotals = useMemo(() => {
    const totals: Record<string, { cost: number; impressions: number; clicks: number; leads: number; mqls: number; sqls: number; name: string; category: string }> = {};
    for (const entry of channelData ?? []) {
      const channelInfo = MARKETING_CHANNELS?.find?.(c => c?.key === entry?.channel);
      const key = entry?.channel ?? 'unknown';
      if (!totals[key]) {
        totals[key] = { cost: 0, impressions: 0, clicks: 0, leads: 0, mqls: 0, sqls: 0, name: channelInfo?.name ?? key, category: channelInfo?.category ?? 'Outros' };
      }
      totals[key].cost += entry?.cost ?? 0;
      totals[key].impressions += entry?.impressions ?? 0;
      totals[key].mqls += entry?.mqls ?? 0;
      totals[key].clicks += entry?.clicks ?? 0;
      totals[key].leads += entry?.leads ?? 0;
      totals[key].sqls += entry?.sqls ?? 0;
    }
    return totals;
  }, [channelData]);

  // Calculate campaign totals
  const campaignTotals = useMemo(() => {
    return {
      cost: channelData?.reduce((sum, e) => sum + (e?.cost ?? 0), 0) ?? 0,
      leads: channelData?.reduce((sum, e) => sum + (e?.leads ?? 0), 0) ?? 0,
      mqls: channelData?.reduce((sum, e) => sum + (e?.mqls ?? 0), 0) ?? 0,
      sqls: channelData?.reduce((sum, e) => sum + (e?.sqls ?? 0), 0) ?? 0,
    };
  }, [channelData]);

  // Get unique channels in data
  const uniqueChannelsInData = useMemo(() => {
    const channels = [...new Set(channelData?.map(e => e?.channel) ?? [])];
    return channels.filter(c => c);
  }, [channelData]);

  // Prepare chart data by week with channel breakdown
  const chartData = useMemo(() => {
    // Sort data by year, month, week
    const sortedData = [...(channelData ?? [])].sort((a, b) => {
      const aKey = `${a.year}-${String(a.month).padStart(2, '0')}-${String(a.weekNumber).padStart(2, '0')}`;
      const bKey = `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.weekNumber).padStart(2, '0')}`;
      return aKey.localeCompare(bKey);
    });

    // Group by period
    const dataByPeriod: Record<string, any> = {};
    
    for (const entry of sortedData) {
      const periodKey = `${entry.year}-${String(entry.month).padStart(2, '0')}-${String(entry.weekNumber).padStart(2, '0')}`;
      const periodLabel = formatPeriodLabel(entry.year, entry.month, entry.weekNumber);
      
      if (!dataByPeriod[periodKey]) {
        dataByPeriod[periodKey] = { 
          period: periodKey,
          label: periodLabel,
          cost: 0, 
          mqls: 0, 
          sqls: 0,
        };
        // Initialize channel-specific fields
        for (const ch of uniqueChannelsInData) {
          dataByPeriod[periodKey][`cost_${ch}`] = 0;
          dataByPeriod[periodKey][`mqls_${ch}`] = 0;
          dataByPeriod[periodKey][`sqls_${ch}`] = 0;
        }
      }
      
      dataByPeriod[periodKey].cost += entry?.cost ?? 0;
      dataByPeriod[periodKey].mqls += entry?.mqls ?? 0;
      dataByPeriod[periodKey].sqls += entry?.sqls ?? 0;
      
      // Channel-specific values
      if (entry.channel) {
        dataByPeriod[periodKey][`cost_${entry.channel}`] = (dataByPeriod[periodKey][`cost_${entry.channel}`] || 0) + (entry?.cost ?? 0);
        dataByPeriod[periodKey][`mqls_${entry.channel}`] = (dataByPeriod[periodKey][`mqls_${entry.channel}`] || 0) + (entry?.mqls ?? 0);
        dataByPeriod[periodKey][`sqls_${entry.channel}`] = (dataByPeriod[periodKey][`sqls_${entry.channel}`] || 0) + (entry?.sqls ?? 0);
      }
    }

    let result = Object.values(dataByPeriod).sort((a: any, b: any) => a.period.localeCompare(b.period));
    
    // Apply cumulative calculation if needed
    if (viewMode === 'cumulative' && result.length > 0) {
      let cumCost = 0, cumMqls = 0, cumSqls = 0;
      const cumChannels: Record<string, { cost: number; mqls: number; sqls: number }> = {};
      
      for (const ch of uniqueChannelsInData) {
        cumChannels[ch] = { cost: 0, mqls: 0, sqls: 0 };
      }
      
      result = result.map((item: any) => {
        cumCost += item.cost;
        cumMqls += item.mqls;
        cumSqls += item.sqls;
        
        const newItem = { 
          ...item, 
          cost: cumCost, 
          mqls: cumMqls, 
          sqls: cumSqls 
        };
        
        for (const ch of uniqueChannelsInData) {
          cumChannels[ch].cost += item[`cost_${ch}`] || 0;
          cumChannels[ch].mqls += item[`mqls_${ch}`] || 0;
          cumChannels[ch].sqls += item[`sqls_${ch}`] || 0;
          newItem[`cost_${ch}`] = cumChannels[ch].cost;
          newItem[`mqls_${ch}`] = cumChannels[ch].mqls;
          newItem[`sqls_${ch}`] = cumChannels[ch].sqls;
        }
        
        return newItem;
      });
    }
    
    return result;
  }, [channelData, uniqueChannelsInData, viewMode]);

  // Find first period for display
  const firstPeriod = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData[0].label;
  }, [chartData]);

  const hasData = (channelData?.length ?? 0) > 0;

  // Determine what to show in chart
  const showAllMetrics = metricFilter === 'all';
  const selectedMetric = metricFilter !== 'all' ? metricFilter : null;

  return (
    <div className="space-y-6">
      {/* Add Data Button */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm text-slate-500">Insira dados de performance dos canais de marketing</p>
        <div className="flex items-center gap-2">
          {hasData && (
            <button
              onClick={handleExportXLSX}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
            >
              <Download size={16} /> Exportar XLSX
            </button>
          )}
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition"
          >
            {showForm ? <><X size={16} /> Fechar</> : <><Plus size={16} /> Adicionar Dados</>}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-5 shadow-sm space-y-4"
        >
          <h3 className="text-base font-semibold text-slate-800">
            {editingId ? 'Editar Dados do Canal' : 'Registrar Dados do Canal'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Canal *</label>
              <select
                value={form.channel}
                onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {MARKETING_CHANNELS?.map?.(ch => (
                  <option key={ch?.key} value={ch?.key}>{ch?.category} - {ch?.name}</option>
                )) ?? []}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ano *</label>
              <select
                value={form.year}
                onChange={e => setForm(p => ({ ...p, year: Number(e.target.value) }))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mês *</label>
              <select
                value={form.month}
                onChange={e => setForm(p => ({ ...p, month: Number(e.target.value), weekNumber: 1 }))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Semana *</label>
              <select
                value={form.weekNumber}
                onChange={e => setForm(p => ({ ...p, weekNumber: Number(e.target.value) }))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                {availableWeeks.map(w => (
                  <option key={w} value={w}>Semana {w}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Custo (R$)</label>
              <input type="number" step="0.01" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Impressões</label>
              <input type="number" value={form.impressions} onChange={e => setForm(p => ({ ...p, impressions: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cliques</label>
              <input type="number" value={form.clicks} onChange={e => setForm(p => ({ ...p, clicks: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Leads</label>
              <input type="number" value={form.leads} onChange={e => setForm(p => ({ ...p, leads: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">MQLs</label>
              <input type="number" value={form.mqls} onChange={e => setForm(p => ({ ...p, mqls: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">SQLs</label>
              <input type="number" value={form.sqls} onChange={e => setForm(p => ({ ...p, sqls: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observações</label>
            <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Notas sobre esta entrada..." />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition disabled:opacity-50">
              <Save size={16} /> {saving ? 'Salvando...' : (editingId ? 'Atualizar' : 'Salvar Dados')}
            </button>
            {editingId && (
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="flex items-center gap-2 px-5 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition">
                Cancelar
              </button>
            )}
          </div>
        </motion.form>
      )}

      {/* Campaign Overview Dashboard */}
      {hasData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Visão Geral da Campanha
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <DollarSign size={16} />
                Custo Total
              </div>
              <div className="text-2xl font-bold">{formatCurrency(campaignTotals.cost)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Users size={16} />
                Total de Leads
              </div>
              <div className="text-2xl font-bold">{campaignTotals.leads.toLocaleString('pt-BR')}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Target size={16} />
                Total de SQLs
              </div>
              <div className="text-2xl font-bold">{campaignTotals.sqls.toLocaleString('pt-BR')}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chart Section */}
      {hasData && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" />
                Evolução por Semana
              </h3>
              {firstPeriod && (
                <p className="text-xs text-slate-500 mt-1">
                  Início: {firstPeriod}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={metricFilter}
                  onChange={e => setMetricFilter(e.target.value as MetricFilter)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="all">Todas as Métricas</option>
                  <option value="cost">Custo por Canal</option>
                  <option value="mqls">MQLs por Canal</option>
                  <option value="sqls">SQLs por Canal</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-slate-400" />
                <select
                  value={viewMode}
                  onChange={e => setViewMode(e.target.value as ViewMode)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="isolated">Resultado por Período</option>
                  <option value="cumulative">Soma Acumulada</option>
                </select>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 60, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11 }} 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`}
                  label={{ value: 'Custo (R$)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#FF9149' } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Volume (MQL/SQL)', angle: 90, position: 'insideRight', style: { fontSize: 11, fill: '#1e3a5f' } }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name.toLowerCase().includes('custo') || name === 'Custo') return formatCurrency(value);
                    return value.toLocaleString('pt-BR');
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                
                {/* Show all metrics with dual Y-axis: Cost on left, MQL/SQL on right */}
                {showAllMetrics && (
                  <>
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="cost" 
                      name="Custo" 
                      stroke="#FF9149" 
                      strokeWidth={2}
                      dot={{ fill: '#FF9149', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="mqls" 
                      name="MQLs" 
                      stroke="#00c853" 
                      strokeWidth={2}
                      dot={{ fill: '#00c853', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="sqls" 
                      name="SQLs" 
                      stroke="#1e3a5f" 
                      strokeWidth={2}
                      dot={{ fill: '#1e3a5f', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </>
                )}
                
                {/* Show metric broken down by channel */}
                {selectedMetric && uniqueChannelsInData.map((channelKey) => {
                  const channelInfo = MARKETING_CHANNELS?.find(c => c?.key === channelKey);
                  const channelName = channelInfo?.name ?? channelKey;
                  const color = CHANNEL_COLORS[channelKey] ?? '#888888';
                  const dataKey = `${selectedMetric}_${channelKey}`;
                  const yAxisId = selectedMetric === 'cost' ? 'left' : 'right';
                  
                  return (
                    <Line
                      key={dataKey}
                      yAxisId={yAxisId}
                      type="monotone"
                      dataKey={dataKey}
                      name={channelName}
                      stroke={color}
                      strokeWidth={2}
                      dot={{ fill: color, strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {showAllMetrics && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Eixo esquerdo: Custo (R$) | Eixo direito: Volume (MQL/SQL)
            </p>
          )}
          {selectedMetric && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Mostrando {selectedMetric === 'cost' ? 'Custo' : selectedMetric === 'mqls' ? 'MQLs' : 'SQLs'} desmembrado por Canal de Marketing
            </p>
          )}
        </motion.div>
      )}

      {/* Channel Performance Summary */}
      {hasData && Object.keys(channelTotals).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} className="text-accent" />
              Resumo de Desempenho por Canal
            </h3>
            <p className="text-sm text-slate-500 mt-1">Totais acumulados durante toda a campanha</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Canal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Categoria</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Custo Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Impressões</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Cliques</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">Leads</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">MQLs</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600">SQLs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(channelTotals).map(([key, data]) => {
                  const color = categoryColors?.[data.category] ?? '#60B5FF';
                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{data.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-slate-600">{data.category}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCurrency(data.cost)}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{data.impressions.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{data.clicks.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{data.leads.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{data.mqls.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{data.sqls.toLocaleString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-primary/5 font-semibold">
                <tr>
                  <td className="px-4 py-3 text-slate-800" colSpan={2}>TOTAL GERAL</td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {formatCurrency(Object.values(channelTotals).reduce((sum, d) => sum + d.cost, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {Object.values(channelTotals).reduce((sum, d) => sum + d.impressions, 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {Object.values(channelTotals).reduce((sum, d) => sum + d.clicks, 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {Object.values(channelTotals).reduce((sum, d) => sum + d.leads, 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {Object.values(channelTotals).reduce((sum, d) => sum + d.mqls, 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-800">
                    {Object.values(channelTotals).reduce((sum, d) => sum + d.sqls, 0).toLocaleString('pt-BR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}

      {/* Existing Data by Category */}
      {categories?.map?.(cat => {
        const entries = grouped?.[cat] ?? [];
        if (entries.length === 0) return null;
        const color = categoryColors?.[cat] ?? '#60B5FF';
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return (
          <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <h3 className="font-semibold text-slate-800">{cat}</h3>
              <span className="text-xs text-slate-400">{entries?.length} registro(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Canal</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-slate-500">Período</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-slate-500">Custo</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-slate-500">Impressões</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-slate-500">Cliques</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-slate-500">Leads</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-slate-500">MQLs</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-slate-500">SQLs</th>
                    <th className="text-center px-4 py-2 text-xs font-medium text-slate-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {entries?.map?.((e: any) => {
                    const channelInfo = MARKETING_CHANNELS?.find?.(c => c?.key === e?.channel);
                    const periodStr = `S${e?.weekNumber} ${monthNames[(e?.month || 1) - 1]}/${e?.year}`;
                    return (
                      <tr key={e?.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium">{channelInfo?.name ?? e?.channel}</td>
                        <td className="px-4 py-2.5 text-slate-500">{periodStr}</td>
                        <td className="px-4 py-2.5 text-right">{formatCurrency(e?.cost)}</td>
                        <td className="px-4 py-2.5 text-right">{(e?.impressions ?? 0)?.toLocaleString?.('pt-BR')}</td>
                        <td className="px-4 py-2.5 text-right">{(e?.clicks ?? 0)?.toLocaleString?.('pt-BR')}</td>
                        <td className="px-4 py-2.5 text-right">{e?.leads ?? 0}</td>
                        <td className="px-4 py-2.5 text-right">{e?.mqls ?? 0}</td>
                        <td className="px-4 py-2.5 text-right">{e?.sqls ?? 0}</td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(e)}
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(e?.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) ?? []}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      }) ?? []}

      {(channelData?.length ?? 0) === 0 && !showForm && (
        <div className="bg-white rounded-xl p-10 text-center shadow-sm">
          <BarChart3 size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">Nenhum dado de canal registrado</p>
          <p className="text-xs text-slate-400 mt-1">Clique em "Adicionar Dados" para começar a registrar</p>
        </div>
      )}
    </div>
  );
}
