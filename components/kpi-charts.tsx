'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface Props {
  kpiEntries: any[];
  channelData: any[];
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78'];

export default function KpiCharts({ kpiEntries = [], channelData = [] }: Props) {
  // Prepare KPI timeline data (sorted by date ascending)
  const kpiTimeline = [...(kpiEntries ?? [])]
    ?.sort?.((a, b) => new Date(a?.date ?? 0).getTime() - new Date(b?.date ?? 0).getTime())
    ?.map?.((e) => {
      try {
        return {
          date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(e?.date ?? 0)),
          CPL: e?.cpl ?? null,
          CTR: e?.ctr ?? null,
          'Conv. LP': e?.lpConversion ?? null,
          'MQL→SQL': e?.mqlToSqlRate ?? null,
          ROI: e?.projectedRoi ?? null,
        };
      } catch {
        return { date: '-', CPL: null, CTR: null, 'Conv. LP': null, 'MQL→SQL': null, ROI: null };
      }
    }) ?? [];

  // Prepare channel spend by category
  const channelSpend: Record<string, number> = {};
  for (const entry of channelData ?? []) {
    const ch = entry?.channel ?? 'outros';
    channelSpend[ch] = (channelSpend[ch] ?? 0) + (entry?.cost ?? 0);
  }
  const spendData = Object.entries(channelSpend ?? {})?.map?.(([name, value]) => ({ name, value })) ?? [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* KPI Timeline */}
      {kpiTimeline.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Evolução KPIs</h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpiTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10 }} label={{ value: 'Data', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="CPL" stroke="#FF9149" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="CTR" stroke="#60B5FF" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="MQL→SQL" stroke="#80D8C3" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Channel Spend Pie */}
      {spendData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Investimento por Canal</h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100)?.toFixed?.(0)}%`}
                >
                  {spendData?.map?.((_, i) => (
                    <Cell key={i} fill={COLORS?.[i % COLORS.length] ?? '#60B5FF'} />
                  )) ?? []}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => `R$ ${Number(v ?? 0)?.toFixed?.(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Leads Funnel */}
      {kpiTimeline.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Conv. LP e ROI ao Longo do Tempo</h4>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpiTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Conv. LP" fill="#80D8C3" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROI" fill="#A19AD3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
