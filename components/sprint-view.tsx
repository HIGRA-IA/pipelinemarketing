'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock, Wrench, Bot, MessageSquare, Calendar, Plus, X, PlayCircle, Search } from 'lucide-react';
import ProgressBar from './progress-bar';
import { calcProgress } from '@/lib/utils';
import { TASK_STATUS_OPTIONS } from '@/lib/template-data';

interface Resource {
  id: string;
  name: string;
  category: string;
  color: string;
}

interface SprintViewProps {
  sprints: any[];
  onUpdate: () => void;
}

export default function SprintView({ sprints = [], onUpdate }: SprintViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [deadlineEditing, setDeadlineEditing] = useState<string | null>(null);
  const [deadlineValue, setDeadlineValue] = useState('');
  const [startDateEditing, setStartDateEditing] = useState<string | null>(null);
  const [startDateValue, setStartDateValue] = useState('');
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [taskResources, setTaskResources] = useState<Record<string, Resource[]>>({});
  const [resourceEditing, setResourceEditing] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all available resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        setAllResources(data);
      } catch (e) { console.error(e); }
    };
    fetchResources();
  }, []);

  // Fetch task resources when sprints change
  useEffect(() => {
    const fetchTaskResources = async () => {
      const allTasks = sprints.flatMap(s => s?.tasks ?? []);
      const resourceMap: Record<string, Resource[]> = {};
      for (const task of allTasks) {
        if (task?.id) {
          try {
            const res = await fetch(`/api/tasks/${task.id}/resources`);
            const data = await res.json();
            resourceMap[task.id] = data;
          } catch (e) { console.error(e); }
        }
      }
      setTaskResources(resourceMap);
    };
    if (sprints.length > 0) fetchTaskResources();
  }, [sprints]);

  const addResourceToTask = async (taskId: string, resourceId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId }),
      });
      if (res.ok) {
        const resource = await res.json();
        setTaskResources(prev => ({
          ...prev,
          [taskId]: [...(prev[taskId] ?? []), resource],
        }));
      }
    } catch (e) { console.error(e); }
    setResourceEditing(null);
    setSelectedResource('');
  };

  const removeResourceFromTask = async (taskId: string, resourceId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/resources?resourceId=${resourceId}`, { method: 'DELETE' });
      setTaskResources(prev => ({
        ...prev,
        [taskId]: (prev[taskId] ?? []).filter(r => r.id !== resourceId),
      }));
    } catch (e) { console.error(e); }
  };

  // Group resources by category
  const resourcesByCategory = allResources.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, Resource[]>);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...(prev ?? {}), [id]: !(prev?.[id]) }));
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    setUpdatingTask(taskId);
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      onUpdate?.();
    } catch (e) { console.error(e); }
    setUpdatingTask(null);
  };

  const saveNote = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText }),
      });
      setNoteEditing(null);
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

  const saveDeadline = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: deadlineValue || null }),
      });
      setDeadlineEditing(null);
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

  const saveStartDate = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: startDateValue || null }),
      });
      setStartDateEditing(null);
      onUpdate?.();
    } catch (e) { console.error(e); }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const sprintColors = ['#60B5FF', '#FF9149', '#80D8C3', '#A19AD3'];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tarefa..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="all">Todos os status</option>
          {TASK_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {(sprints ?? [])?.map?.((sprint, idx) => {
        const tasks = sprint?.tasks ?? [];
        const progress = calcProgress(tasks);
        const isOpen = expanded?.[sprint?.id] ?? (idx === 0);
        const color = sprintColors?.[idx] ?? '#60B5FF';

        // Group tasks by stage
        const stages: Record<string, any[]> = {};
        for (const task of tasks) {
          const key = `${task?.stageNumber ?? 0}-${task?.stageName ?? 'Geral'}`;
          if (!stages[key]) stages[key] = [];
          stages[key].push(task);
        }

        return (
          <motion.div
            key={sprint?.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(sprint?.id)}
              className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: color }}>
                {sprint?.number}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-slate-800">Sprint {sprint?.number}: {sprint?.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{sprint?.objective}</p>
              </div>
              <div className="hidden md:block w-32">
                <ProgressBar value={progress} color={color} height={6} showLabel={false} />
                <p className="text-xs text-slate-400 text-center mt-1">{progress}%</p>
              </div>
              <div className="text-xs text-slate-400">
                {tasks?.filter?.((t: any) => t?.status === 'concluido' || t?.status === 'nao_aplicavel')?.length ?? 0}/{tasks?.length ?? 0}
              </div>
              {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-4">
                    {Object.entries(stages ?? {})?.map?.(([key, stageTasks]) => {
                      const stageName = key?.split?.('-')?.slice?.(1)?.join?.('-') ?? 'Etapa';

                      const filteredTasks = stageTasks.filter(task => {
                        const matchesSearch = !searchQuery || task.description?.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
                        return matchesSearch && matchesStatus;
                      });

                      return (
                        <div key={key} className="border-l-2 pl-4 ml-4" style={{ borderColor: color }}>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            {stageName}
                          </h4>
                          <div className="space-y-2">
                            {filteredTasks.length === 0 && (searchQuery || filterStatus !== 'all') && (
                              <p className="text-sm text-slate-400 py-4 text-center">Nenhuma tarefa encontrada para os filtros aplicados.</p>
                            )}
                            {(filteredTasks ?? [])?.map?.((task: any) => {
                              const isDone = task?.status === 'concluido';
                              const isInProgress = task?.status === 'em_andamento';
                              const isNaoAplicavel = task?.status === 'nao_aplicavel';

                              // Determine background color based on status
                              let bgClass = 'bg-slate-50';
                              if (isDone) bgClass = 'bg-green-50';
                              else if (isInProgress) bgClass = 'bg-orange-50';
                              else if (isNaoAplicavel) bgClass = '';

                              return (
                                <div
                                  key={task?.id}
                                  className={`rounded-lg p-3 transition-all hover:shadow-sm ${bgClass}`}
                                  style={isNaoAplicavel ? { backgroundColor: '#53565A' } : {}}
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => updateTaskStatus(
                                        task?.id,
                                        isDone ? 'pendente' : isInProgress ? 'concluido' : 'em_andamento'
                                      )}
                                      disabled={updatingTask === task?.id || isNaoAplicavel}
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {isDone ? (
                                        <CheckCircle2 size={18} className="text-green-500" />
                                      ) : isInProgress ? (
                                        <Clock size={18} className="text-orange-500" />
                                      ) : isNaoAplicavel ? (
                                        <Circle size={18} className="text-slate-400" />
                                      ) : (
                                        <Circle size={18} className="text-slate-300" />
                                      )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm ${
                                        isDone
                                          ? 'line-through text-slate-400'
                                          : isNaoAplicavel
                                            ? 'line-through italic text-slate-300'
                                            : 'text-slate-700'
                                      }`}>
                                        {task?.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {/* Selected Resources */}
                                        {(taskResources[task?.id] ?? []).map((resource: Resource) => (
                                          <span
                                            key={resource.id}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-white"
                                            style={{ backgroundColor: resource.color }}
                                          >
                                            {resource.category === 'Ferramenta IA' ? <Bot size={10} /> : <Wrench size={10} />}
                                            {resource.name}
                                            <button
                                              onClick={(e) => { e.stopPropagation(); removeResourceFromTask(task.id, resource.id); }}
                                              className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
                                            >
                                              <X size={8} />
                                            </button>
                                          </span>
                                        ))}
                                        {/* Add Resource Button */}
                                        {resourceEditing !== task?.id && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setResourceEditing(task?.id); setSelectedResource(''); }}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded text-[10px] font-medium transition"
                                          >
                                            <Plus size={10} /> Recurso
                                          </button>
                                        )}
                                        {task?.dueDate && (
                                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                                            new Date(task.dueDate) < new Date() && !isDone && !isNaoAplicavel
                                              ? 'bg-red-100 text-red-700'
                                              : 'bg-slate-100 text-slate-600'
                                          }`}>
                                            <Calendar size={10} /> {formatDate(task.dueDate)}
                                          </span>
                                        )}
                                      </div>
                                      {/* Resource Selector */}
                                      {resourceEditing === task?.id && (
                                        <div className="mt-2 flex gap-2 items-center">
                                          <select
                                            value={selectedResource}
                                            onChange={e => setSelectedResource(e.target.value)}
                                            className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded bg-white"
                                          >
                                            <option value="">Selecione um recurso...</option>
                                            {Object.entries(resourcesByCategory).map(([category, resources]) => (
                                              <optgroup key={category} label={category}>
                                                {resources
                                                  .filter((r: Resource) => !(taskResources[task?.id] ?? []).some((tr: Resource) => tr.id === r.id))
                                                  .map((r: Resource) => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                  ))}
                                              </optgroup>
                                            ))}
                                          </select>
                                          <button
                                            onClick={() => selectedResource && addResourceToTask(task?.id, selectedResource)}
                                            disabled={!selectedResource}
                                            className="text-xs px-2 py-1 bg-primary text-white rounded disabled:opacity-50"
                                          >
                                            Adicionar
                                          </button>
                                          <button
                                            onClick={() => setResourceEditing(null)}
                                            className="text-xs px-2 py-1 text-slate-500"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      )}
                                      {/* Start Date and Deadline editors */}
                                      <div className="mt-2 flex flex-wrap gap-3">
                                        {/* Start Date */}
                                        {startDateEditing === task?.id ? (
                                          <div className="flex gap-2 items-center">
                                            <span className="text-[10px] text-slate-500">Início:</span>
                                            <input
                                              type="date"
                                              value={startDateValue}
                                              onChange={e => setStartDateValue(e.target.value)}
                                              className="text-xs px-2 py-1 border border-slate-200 rounded w-32"
                                              autoFocus
                                            />
                                            <button onClick={() => saveStartDate(task?.id)} className="text-xs px-2 py-1 bg-primary text-white rounded">Salvar</button>
                                            <button onClick={() => setStartDateEditing(null)} className="text-xs px-2 py-1 text-slate-500">Cancelar</button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setStartDateEditing(task?.id);
                                              setStartDateValue(task?.startDate ? task.startDate.split('T')[0] : '');
                                            }}
                                            className={`text-[10px] flex items-center gap-1 ${
                                              isNaoAplicavel ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-primary'
                                            }`}
                                          >
                                            <PlayCircle size={10} />
                                            {task?.startDate ? `Início: ${formatDate(task.startDate)}` : 'Definir início'}
                                          </button>
                                        )}

                                        {/* Deadline */}
                                        {deadlineEditing === task?.id ? (
                                          <div className="flex gap-2 items-center">
                                            <span className="text-[10px] text-slate-500">Deadline:</span>
                                            <input
                                              type="date"
                                              value={deadlineValue}
                                              onChange={e => setDeadlineValue(e.target.value)}
                                              className="text-xs px-2 py-1 border border-slate-200 rounded w-32"
                                              autoFocus
                                            />
                                            <button onClick={() => saveDeadline(task?.id)} className="text-xs px-2 py-1 bg-primary text-white rounded">Salvar</button>
                                            <button onClick={() => setDeadlineEditing(null)} className="text-xs px-2 py-1 text-slate-500">Cancelar</button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setDeadlineEditing(task?.id);
                                              setDeadlineValue(task?.dueDate ? task.dueDate.split('T')[0] : '');
                                            }}
                                            className={`text-[10px] flex items-center gap-1 ${
                                              isNaoAplicavel ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-primary'
                                            }`}
                                          >
                                            <Calendar size={10} />
                                            {task?.dueDate ? `Deadline: ${formatDate(task.dueDate)}` : 'Definir deadline'}
                                          </button>
                                        )}
                                      </div>
                                      {/* Notes */}
                                      {noteEditing === task?.id ? (
                                        <div className="mt-2 flex gap-2">
                                          <input
                                            type="text"
                                            value={noteText}
                                            onChange={e => setNoteText(e.target.value)}
                                            placeholder="Adicionar nota..."
                                            className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded"
                                            autoFocus
                                          />
                                          <button onClick={() => saveNote(task?.id)} className="text-xs px-2 py-1 bg-primary text-white rounded">Salvar</button>
                                          <button onClick={() => setNoteEditing(null)} className="text-xs px-2 py-1 text-slate-500">Cancelar</button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => { setNoteEditing(task?.id); setNoteText(task?.notes ?? ''); }}
                                          className={`mt-1 text-[10px] flex items-center gap-1 ${
                                            isNaoAplicavel ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-primary'
                                          }`}
                                        >
                                          <MessageSquare size={10} />
                                          {task?.notes ? task.notes : 'Adicionar nota'}
                                        </button>
                                      )}
                                    </div>
                                    <select
                                      value={task?.status ?? 'pendente'}
                                      onChange={e => updateTaskStatus(task?.id, e.target.value)}
                                      disabled={updatingTask === task?.id}
                                      className={`text-xs border border-slate-200 rounded px-2 py-1 flex-shrink-0 ${
                                        isNaoAplicavel ? 'bg-slate-600 text-white border-slate-500' : 'bg-white'
                                      }`}
                                    >
                                      {TASK_STATUS_OPTIONS?.map?.(opt => (
                                        <option key={opt?.value} value={opt?.value}>{opt?.label}</option>
                                      )) ?? []}
                                    </select>
                                  </div>
                                </div>
                              );
                            }) ?? []}
                          </div>
                        </div>
                      );
                    }) ?? []}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      }) ?? []}
    </div>
  );
}
