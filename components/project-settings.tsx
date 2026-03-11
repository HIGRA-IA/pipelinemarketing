'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Trash2, AlertTriangle, RefreshCw, Plus, X, Wrench, Edit2 } from 'lucide-react';
import { STATUS_OPTIONS } from '@/lib/template-data';

interface Resource {
  id: string;
  name: string;
  category: string;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Ferramenta IA': '#9b59b6',
  'Plataforma': '#3498db',
  'Recurso Humano': '#e67e22',
  'CRM/Prospecção': '#1abc9c',
};

export default function ProjectSettings({ project, onUpdate }: { project: any; onUpdate: () => void }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: project?.name ?? '',
    theme: project?.theme ?? '',
    objective: project?.objective ?? '',
    priorityProduct: project?.priorityProduct ?? '',
    status: project?.status ?? 'planejamento',
    budgetTraffic: project?.budgetTraffic ?? 3000,
    targetCpl: project?.targetCpl ?? 600,
  });

  // Resource management states
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceCategory, setNewResourceCategory] = useState('Ferramenta IA');
  const [customCategory, setCustomCategory] = useState('');
  const [addingResource, setAddingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', category: '' });
  const [categories, setCategories] = useState<string[]>(['Ferramenta IA', 'Plataforma', 'Recurso Humano', 'CRM/Prospecção']);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        setResources(data);
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((r: Resource) => r.category))] as string[];
        if (uniqueCategories.length > 0) {
          setCategories(prevCats => [...new Set([...prevCats, ...uniqueCategories])]);
        }
      } catch (e) { console.error(e); }
      setLoadingResources(false);
    };
    fetchResources();
  }, []);

  const handleAddResource = async () => {
    const categoryToUse = newResourceCategory === '__custom__' ? customCategory : newResourceCategory;
    if (!newResourceName.trim() || !categoryToUse.trim()) return;
    
    setAddingResource(true);
    try {
      const color = CATEGORY_COLORS[categoryToUse] || '#A19AD3';
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newResourceName.trim(), category: categoryToUse, color }),
      });
      if (res.ok) {
        const newResource = await res.json();
        setResources(prev => [...prev, newResource]);
        setNewResourceName('');
        setCustomCategory('');
        setNewResourceCategory('Ferramenta IA');
        // Add new category if custom
        if (newResourceCategory === '__custom__' && customCategory.trim()) {
          setCategories(prev => [...new Set([...prev, customCategory.trim()])]);
        }
      }
    } catch (e) { console.error(e); }
    setAddingResource(false);
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este recurso?')) return;
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleEditResource = async (id: string) => {
    if (!editForm.name.trim()) return;
    try {
      const color = CATEGORY_COLORS[editForm.category] || '#A19AD3';
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, color }),
      });
      if (res.ok) {
        const updated = await res.json();
        setResources(prev => prev.map(r => r.id === id ? updated : r));
        setEditingResource(null);
      }
    } catch (e) { console.error(e); }
  };

  const resourcesByCategory = resources.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, Resource[]>);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/projects/${project?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      onUpdate?.();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza? Esta ação excluirá o projeto e todos os dados associados.')) return;
    try {
      await fetch(`/api/projects/${project?.id}`, { method: 'DELETE' });
      router.push('/projetos');
    } catch (e) { console.error(e); }
  };

  const handleSyncTasks = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/projects/sync-tasks', { method: 'POST' });
      const data = await res.json();
      if (data?.success) {
        setSyncMessage(data.message);
        onUpdate?.();
      } else {
        setSyncMessage('Erro ao sincronizar tarefas.');
      }
    } catch (e) {
      console.error(e);
      setSyncMessage('Erro ao sincronizar tarefas.');
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-4">
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSave}
        className="bg-white rounded-xl p-5 shadow-sm space-y-4"
      >
        <h3 className="text-base font-semibold text-slate-800">Configurações do Projeto</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nome</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Tema</label>
            <input type="text" value={form.theme} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Objetivo</label>
            <input type="text" value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Produto Prioritário</label>
            <input type="text" value={form.priorityProduct} onChange={e => setForm(p => ({ ...p, priorityProduct: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
              {STATUS_OPTIONS?.map?.(s => <option key={s?.value} value={s?.value}>{s?.label}</option>) ?? []}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Orçamento Tráfego (R$)</label>
            <input type="number" value={form.budgetTraffic} onChange={e => setForm(p => ({ ...p, budgetTraffic: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Meta CPL (R$)</label>
            <input type="number" value={form.targetCpl} onChange={e => setForm(p => ({ ...p, targetCpl: Number(e.target.value) }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition disabled:opacity-50">
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </motion.form>

      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-blue-700">Sincronizar Tarefas</h3>
        </div>
        <p className="text-xs text-blue-600 mb-3">
          Adiciona novas tarefas do template (Conteúdos Ricos 1, 2 e 3) aos projetos existentes que ainda não as possuem.
        </p>
        <button 
          onClick={handleSyncTasks} 
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> 
          {syncing ? 'Sincronizando...' : 'Sincronizar Tarefas'}
        </button>
        {syncMessage && (
          <p className="mt-2 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">{syncMessage}</p>
        )}
      </div>

      {/* Resource Management Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="text-slate-600" />
            <h3 className="text-base font-semibold text-slate-800">Gerenciar Recursos</h3>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Adicione, edite ou remova recursos/ferramentas que podem ser associados às tarefas dos sprints.
        </p>

        {/* Add New Resource */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Adicionar Novo Recurso</h4>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nome do Recurso</label>
              <input
                type="text"
                value={newResourceName}
                onChange={e => setNewResourceName(e.target.value)}
                placeholder="Ex: Notion, Figma..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoria</label>
              <select
                value={newResourceCategory}
                onChange={e => setNewResourceCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__custom__">+ Nova Categoria</option>
              </select>
            </div>
            {newResourceCategory === '__custom__' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nova Categoria</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="Nome da categoria"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={handleAddResource}
                disabled={addingResource || !newResourceName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-dark transition disabled:opacity-50"
              >
                <Plus size={14} /> {addingResource ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>

        {/* Resources List */}
        {loadingResources ? (
          <p className="text-sm text-slate-500">Carregando recursos...</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(resourcesByCategory).map(([category, categoryResources]) => (
              <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
                <div
                  className="px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[category] || '#A19AD3' }}
                >
                  {category} ({categoryResources.length})
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {categoryResources.map((resource: Resource) => (
                      <div key={resource.id} className="group relative">
                        {editingResource === resource.id ? (
                          <div className="flex gap-2 items-center bg-slate-100 rounded-lg p-2">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="text-xs px-2 py-1 border border-slate-200 rounded w-32"
                            />
                            <select
                              value={editForm.category}
                              onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                              className="text-xs px-2 py-1 border border-slate-200 rounded bg-white"
                            >
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleEditResource(resource.id)}
                              className="text-xs px-2 py-1 bg-accent text-white rounded"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingResource(null)}
                              className="text-xs text-slate-500"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                            style={{ backgroundColor: resource.color }}
                          >
                            {resource.name}
                            <button
                              onClick={() => { setEditingResource(resource.id); setEditForm({ name: resource.name, category: resource.category }); }}
                              className="ml-1 p-0.5 hover:bg-white/20 rounded transition opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 size={10} />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="p-0.5 hover:bg-white/20 rounded transition opacity-0 group-hover:opacity-100"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(resourcesByCategory).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhum recurso cadastrado. Adicione um recurso acima.
              </p>
            )}
          </div>
        )}
      </motion.div>

      <div className="bg-red-50 rounded-xl p-5 border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">Zona de Perigo</h3>
        </div>
        <p className="text-xs text-red-600 mb-3">Excluir o projeto remove permanentemente todos os dados, sprints, tarefas e métricas.</p>
        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
          <Trash2 size={14} /> Excluir Projeto
        </button>
      </div>
    </div>
  );
}
