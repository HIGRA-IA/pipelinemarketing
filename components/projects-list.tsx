'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Building2, Calendar, Target, Trash2, ArrowRight } from 'lucide-react';
import StatusBadge from './status-badge';
import ProgressBar from './progress-bar';
import { formatDate, calcProgress } from '@/lib/utils';

export default function ProjectsList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = () => {
    setLoading(true);
    fetch('/api/projects')
      .then(r => r.json())
      .then(d => setProjects(d ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProjects(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) return;
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/projetos/novo" className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors shadow-sm">
          <Plus size={16} /> Novo Projeto
        </Link>
      </div>

      {(projects?.length ?? 0) === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Target size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum projeto criado</h3>
          <p className="text-slate-400 mb-4">Crie seu primeiro projeto de marketing de performance</p>
          <Link href="/projetos/novo" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Criar Projeto
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects?.map?.((project, i) => {
            const allTasks = project?.sprints?.flatMap?.((s: any) => s?.tasks ?? []) ?? [];
            const progress = calcProgress(allTasks);
            return (
              <motion.div
                key={project?.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={14} className="text-accent" />
                      <span className="text-xs font-semibold text-accent">{project?.company?.name}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{project?.name}</h3>
                    {project?.theme && <p className="text-xs text-slate-500 mt-0.5">{project.theme}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(project?.startDate)} - {formatDate(project?.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:w-48">
                    <div className="flex-1">
                      <ProgressBar value={progress} height={6} showLabel={false} />
                      <p className="text-xs text-slate-500 mt-1 text-center">{progress}%</p>
                    </div>
                    <StatusBadge status={project?.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/projetos/${project?.id}`} className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition">
                      Abrir <ArrowRight size={14} />
                    </Link>
                    <button onClick={() => handleDelete(project?.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          }) ?? []}
        </div>
      )}
    </div>
  );
}
