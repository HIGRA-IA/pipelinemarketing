'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#80D8C3', '#A19AD3', '#FF6363', '#FF90BB'];

export default function ComparisonCharts({ projects = [] }: { projects: any[] }) {
  // CPL Comparison - using calculated KPIs from channelData
  const cplData = (projects ?? []).map((p: any, i: number) => ({
    name: p?.name?.substring?.(0, 20) ?? `Projeto ${i + 1}`,
    CPL: p?.calculatedKpis?.cpl ?? 0,
    'Meta CPL': p?.targetCpl ?? 600,
  })).filter((d: any) => (d?.CPL ?? 0) > 0);

  // Custo SQL Comparison
  const custoSqlData = (projects ?? []).map((p: any, i: number) => ({
    name: p?.name?.substring?.(0, 20) ?? `Projeto ${i + 1}`,
    'Custo SQL': p?.calculatedKpis?.custoSql ?? 0,
    'Meta Custo SQL': p?.targetCustoSql ?? 0,
  })).filter((d: any) => (d?.['Custo SQL'] ?? 0) > 0);

  // Radar data using calculated KPIs
  const radarData = [
    { 
      metric: 'CTR', 
      ...Object.fromEntries(
        (projects ?? []).map((p: any, i: number) => [
          p?.name?.substring?.(0, 15) ?? `P${i}`, 
          p?.calculatedKpis?.ctr ?? 0
        ])
      ) 
    },
    { 
      metric: 'MQL→SQL', 
      ...Object.fromEntries(
        (projects ?? []).map((p: any, i: number) => [
          p?.name?.substring?.(0, 15) ?? `P${i}`, 
          p?.calculatedKpis?.mqlToSql ?? 0
        ])
      ) 
    },
    { 
      metric: 'Eficiência CPL', 
      ...Object.fromEntries(
        (projects ?? []).map((p: any, i: number) => {
          const cpl = p?.calculatedKpis?.cpl ?? 0;
          const targetCpl = p?.targetCpl ?? 600;
          // Inverse metric: lower is better, so calculate efficiency as target/actual * 100
          const efficiency = cpl > 0 ? Math.min((targetCpl / cpl) * 100, 200) : 0;
          return [p?.name?.substring?.(0, 15) ?? `P${i}`, efficiency];
        })
      ) 
    },
    { 
      metric: 'Eficiência MQL', 
      ...Object.fromEntries(
        (projects ?? []).map((p: any, i: number) => {
          const custoMql = p?.calculatedKpis?.custoMql ?? 0;
          const targetCustoMql = p?.targetCustoMql ?? 500;
          const efficiency = custoMql > 0 ? Math.min((targetCustoMql / custoMql) * 100, 200) : 0;
          return [p?.name?.substring?.(0, 15) ?? `P${i}`, efficiency];
        })
      ) 
    },
    { 
      metric: 'Eficiência SQL', 
      ...Object.fromEntries(
        (projects ?? []).map((p: any, i: number) => {
          const custoSql = p?.calculatedKpis?.custoSql ?? 0;
          const targetCustoSql = p?.targetCustoSql ?? 1000;
          const efficiency = custoSql > 0 ? Math.min((targetCustoSql / custoSql) * 100, 200) : 0;
          return [p?.name?.substring?.(0, 15) ?? `P${i}`, efficiency];
        })
      ) 
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* CPL vs Meta */}
      {cplData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">CPL vs Meta por Projeto</h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cplData} margin={{ top: 5, right: 10, left: 10, bottom: 30 }}>
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="CPL" fill="#FF9149" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Meta CPL" fill="#80D8C3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Custo SQL vs Meta */}
      {custoSqlData.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Custo SQL vs Meta por Projeto</h4>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={custoSqlData} margin={{ top: 5, right: 10, left: 10, bottom: 30 }}>
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Custo SQL" fill="#60B5FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Meta Custo SQL" fill="#A19AD3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Radar Chart - Performance Metrics */}
      {(projects?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Radar de Performance</h4>
          <p className="text-xs text-slate-500 mb-2">CTR e MQL→SQL em %, Eficiências calculadas como (Meta/Real) × 100</p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 'auto']} />
                {(projects ?? []).map((p: any, i: number) => (
                  <Radar 
                    key={p?.id ?? i} 
                    name={p?.name?.substring?.(0, 15) ?? `Projeto ${i}`} 
                    dataKey={p?.name?.substring?.(0, 15) ?? `P${i}`} 
                    stroke={COLORS?.[i % COLORS.length]} 
                    fill={COLORS?.[i % COLORS.length]} 
                    fillOpacity={0.2} 
                  />
                ))}
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(value: number) => value.toFixed(2)} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
