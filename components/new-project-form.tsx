'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Tag, Target, Package, Calendar, DollarSign, TrendingDown, Save, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewProjectForm() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyId: '',
    name: '',
    theme: '',
    objective: 'Gerar SQL',
    priorityProduct: '',
    startDate: '',
    budgetTraffic: 3000,
    targetCpl: 600,
  });

  useEffect(() => {
    fetch('/api/companies')
      .then(r => r.json())
      .then(d => setCompanies(d ?? []))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Erro ao criar projeto');
        return;
      }
      router.push(`/projetos/${data?.id}`);
    } catch (err) {
      setError('Erro ao criar projeto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'companyId', label: 'Empresa', icon: Building2, type: 'select', required: true, options: companies?.map?.(c => ({ value: c?.id, label: c?.name })) ?? [] },
    { key: 'name', label: 'Nome do Projeto', icon: Tag, type: 'text', required: true, placeholder: 'Ex: Campanha Hidráulica Industrial Q1' },
    { key: 'theme', label: 'Tema Técnico', icon: Target, type: 'text', placeholder: 'Ex: Sistemas hidráulicos para mineração' },
    { key: 'priorityProduct', label: 'Produto Prioritário', icon: Package, type: 'text', placeholder: 'Ex: Unidade HPU 500' },
    { key: 'objective', label: 'Objetivo Principal', icon: Target, type: 'text', placeholder: 'Gerar SQL' },
    { key: 'startDate', label: 'Data de Início', icon: Calendar, type: 'date', required: true },
    { key: 'budgetTraffic', label: 'Orçamento Tráfego (R$)', icon: DollarSign, type: 'number', placeholder: '3000' },
    { key: 'targetCpl', label: 'Meta CPL (R$)', icon: TrendingDown, type: 'number', placeholder: '600' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {fields?.map?.((field) => {
            const Icon = field?.icon;
            return (
              <div key={field?.key} className={field?.key === 'name' || field?.key === 'theme' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field?.label} {field?.required && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {Icon && <Icon size={16} />}
                  </div>
                  {field?.type === 'select' ? (
                    <select
                      value={(form as any)?.[field?.key] ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [field?.key ?? '']: e.target.value }))}
                      required={field?.required}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      {field?.options?.map?.((opt: any) => (
                        <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
                      )) ?? []}
                    </select>
                  ) : (
                    <input
                      type={field?.type ?? 'text'}
                      value={(form as any)?.[field?.key] ?? ''}
                      onChange={e => setForm(prev => ({ ...prev, [field?.key ?? '']: field?.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      required={field?.required}
                      placeholder={field?.placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  )}
                </div>
              </div>
            );
          }) ?? []}
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">\u2139\ufe0f Estrutura automática</p>
          <p>Ao criar o projeto, serão gerados automaticamente 4 sprints de 15 dias com todas as etapas e tarefas conforme o template estratégico.</p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
            <ArrowLeft size={16} /> Voltar
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors shadow-sm disabled:opacity-50">
            <Save size={16} /> {loading ? 'Criando...' : 'Criar Projeto'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
