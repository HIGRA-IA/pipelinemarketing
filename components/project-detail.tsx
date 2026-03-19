'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Calendar, Target, DollarSign, Edit2, Save, X, MessageSquare, History } from 'lucide-react';
import StatusBadge from './status-badge';
import ProgressBar from './progress-bar';
import SprintView from './sprint-view';
import ChannelDataForm from './channel-data-form';
import KpiDashboard from './kpi-dashboard';
import ProjectSettings from './project-settings';
import { formatDate, formatCurrency, calcProgress } from '@/lib/utils';
import { STATUS_OPTIONS } from '@/lib/template-data';

function MateriaisTab({ projectId }: { projectId: string }) {
  const [agents, setAgents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Record<string, any[]>>({});

  useEffect(() => {
    fetch('/api/agents').then(r => r.json()).then(data => {
      const active = (Array.isArray(data) ? data : []).filter((a: any) => a.isActive);
      setAgents(active);
      active.forEach((agent: any) => {
        fetch(`/api/projects/${projectId}/conversations?agentId=${agent.id}`)
          .then(r => r.json())
          .then(convs => setConversations(prev => ({ ...prev, [agent.id]: Array.isArray(convs) ? convs : [] })));
      });
    });
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Materiais da Campanha</h2>
        <p className="text-sm text-slate-500">Produza conteúdos, imagens e análises com agentes IA treinados para o setor industrial B2B.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => {
          const convs = conversations[agent.id] ?? [];
          const lastMsg = convs[0]?.messages?.[0];
          return (
            <div key={agent.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{agent.icon ?? '🤖'}</span>
                <div>
                  <p className="font-semibold text-slate-800">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.modelProvider === 'openai' ? 'OpenAI' : 'Anthropic'} · {convs.length} conversa{convs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 flex-1">{agent.description}</p>
              {lastMsg ? (
                <p className="text-xs text-slate-400 italic truncate">
                  Último: {lastMsg.content?.slice(0, 90)}{lastMsg.content?.length > 90 ? '…' : ''}
                </p>
              ) : (
                <p className="text-xs text-slate-300 italic">Nenhum material gerado ainda</p>
              )}
              <div className="flex gap-2">
                <Link
                  href={`/projetos/${projectId}/materiais/${agent.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-white text-sm py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  <MessageSquare size={14} /> Abrir Chat
                </Link>
                {convs.length > 0 && (
                  <Link
                    href={`/projetos/${projectId}/materiais/${agent.id}/historico`}
                    className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-600 text-sm px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                  >
                    <History size={14} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TABS = [
  { key: 'sprints', label: 'Sprints & Tarefas' },
  { key: 'canais', label: 'Canais de Marketing' },
  { key: 'materiais', label: '📦 Materiais da Campanha' },
  { key: 'kpis', label: 'KPIs & Métricas' },
  { key: 'config', label: 'Configurações' },
];

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sprints');

  const loadProject = useCallback(() => {
    if (!projectId) return;
    fetch(`/api/projects/${projectId}`)
      .then(r => r.json())
      .then(d => { if (!d?.error) setProject(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Projeto não encontrado</p>
        <Link href="/projetos" className="text-primary hover:underline mt-2 inline-block">Voltar aos projetos</Link>
      </div>
    );
  }

  const allTasks = project?.sprints?.flatMap?.((s: any) => s?.tasks ?? []) ?? [];
  const progress = calcProgress(allTasks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/projetos" className="mt-1 p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={14} className="text-accent" />
            <span className="text-xs font-semibold text-accent">{project?.company?.name}</span>
            <StatusBadge status={project?.status} />
          </div>
          <h1 className="text-2xl font-bold text-primary">{project?.name}</h1>
          {project?.theme && <p className="text-sm text-slate-500 mt-0.5">{project.theme}</p>}
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Calendar size={12} /> Período</div>
          <p className="text-sm font-semibold">{formatDate(project?.startDate)}</p>
          <p className="text-xs text-slate-400">até {formatDate(project?.endDate)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Target size={12} /> Objetivo</div>
          <p className="text-sm font-semibold">{project?.objective ?? 'Gerar SQL'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><DollarSign size={12} /> Orçamento</div>
          <p className="text-sm font-semibold">{formatCurrency(project?.budgetTraffic)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><DollarSign size={12} /> Meta CPL</div>
          <p className="text-sm font-semibold">{formatCurrency(project?.targetCpl)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 mb-1">Progresso Geral</div>
          <ProgressBar value={progress} height={6} />
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm overflow-x-auto">
        {TABS?.map?.(t => (
          <button
            key={t?.key}
            onClick={() => setTab(t?.key ?? 'sprints')}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t?.key ? 'bg-primary text-white shadow' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t?.label}
          </button>
        )) ?? []}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === 'sprints' && <SprintView sprints={project?.sprints ?? []} onUpdate={loadProject} />}
        {tab === 'canais' && <ChannelDataForm projectId={projectId} channelData={project?.channelData ?? []} onUpdate={loadProject} />}
        {tab === 'materiais' && <MateriaisTab projectId={projectId} />}
        {tab === 'kpis' && <KpiDashboard project={project} channelData={project?.channelData ?? []} onUpdate={loadProject} />}
        {tab === 'config' && <ProjectSettings project={project} onUpdate={loadProject} />}
      </motion.div>
    </div>
  );
}
