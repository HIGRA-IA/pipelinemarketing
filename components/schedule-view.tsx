'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, FolderKanban, CheckCircle2, Circle, Clock, AlertTriangle, Filter, Eye, List, LayoutGrid } from 'lucide-react';
import { TASK_STATUS_OPTIONS } from '@/lib/template-data';

interface Task {
  id: string;
  description: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  stageName: string;
  stageNumber: number;
  sprint: {
    id: string;
    number: number;
    name: string;
    project: {
      id: string;
      name: string;
      status: string;
      company: {
        name: string;
      };
    };
  };
}

interface Project {
  id: string;
  name: string;
  company: { name: string };
}

export default function ScheduleView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'roadmap'>('list');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          fetch('/api/tasks/schedule?includeAll=true'),
          fetch('/api/projects'),
        ]);
        const tasksData = await tasksRes.json();
        const projectsData = await projectsRes.json();
        setTasks(tasksData);
        setProjects(projectsData);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    if (selectedProject === 'all') return tasks;
    return tasks.filter(t => t.sprint?.project?.id === selectedProject);
  }, [tasks, selectedProject]);

  // Group tasks by project, then by sprint
  const groupedData = useMemo(() => {
    const grouped: Record<string, {
      project: { id: string; name: string; company: string };
      sprints: Record<number, {
        sprintNumber: number;
        sprintName: string;
        tasks: Task[];
      }>;
    }> = {};

    for (const task of filteredTasks) {
      const projectId = task.sprint?.project?.id;
      const projectName = task.sprint?.project?.name ?? 'Projeto';
      const companyName = task.sprint?.project?.company?.name ?? '';
      const sprintNumber = task.sprint?.number ?? 0;
      const sprintName = task.sprint?.name ?? '';

      if (!grouped[projectId]) {
        grouped[projectId] = {
          project: { id: projectId, name: projectName, company: companyName },
          sprints: {},
        };
      }

      if (!grouped[projectId].sprints[sprintNumber]) {
        grouped[projectId].sprints[sprintNumber] = {
          sprintNumber,
          sprintName,
          tasks: [],
        };
      }

      grouped[projectId].sprints[sprintNumber].tasks.push(task);
    }

    // Sort tasks within each sprint by dueDate
    for (const projectId of Object.keys(grouped)) {
      for (const sprintNum of Object.keys(grouped[projectId].sprints)) {
        grouped[projectId].sprints[Number(sprintNum)].tasks.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      }
    }

    return grouped;
  }, [filteredTasks]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isOverdue = (dateStr: string | null, status: string) => {
    if (!dateStr) return false;
    if (status === 'concluido' || status === 'nao_aplicavel') return false;
    return new Date(dateStr) < new Date();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle2 size={14} className="text-green-500" />;
      case 'em_andamento':
        return <Clock size={14} className="text-orange-500" />;
      case 'nao_aplicavel':
        return <Circle size={14} className="text-slate-400" />;
      default:
        return <Circle size={14} className="text-slate-300" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const opt = TASK_STATUS_OPTIONS.find(o => o.value === status);
    return opt?.label ?? status;
  };

  const sprintColors = ['#60B5FF', '#FF9149', '#80D8C3', '#A19AD3'];

  const totalTasks = filteredTasks.length;
  const overdueTasks = filteredTasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  const completedTasks = filteredTasks.filter(t => t.status === 'concluido' || t.status === 'nao_aplicavel').length;

  // Roadmap data calculations
  const roadmapData = useMemo(() => {
    const tasksWithDates = filteredTasks.filter(t => t.startDate || t.dueDate);
    if (tasksWithDates.length === 0) return null;

    // Find min/max dates for the timeline
    let minDate = new Date();
    let maxDate = new Date();
    
    tasksWithDates.forEach(t => {
      const start = t.startDate ? new Date(t.startDate) : null;
      const end = t.dueDate ? new Date(t.dueDate) : null;
      
      if (start && start < minDate) minDate = start;
      if (end && end > maxDate) maxDate = end;
      if (start && start > maxDate) maxDate = start;
      if (end && end < minDate) minDate = end;
    });

    // Add some padding
    minDate = new Date(minDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    maxDate = new Date(maxDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000));

    return { minDate, maxDate, totalDays, tasksWithDates };
  }, [filteredTasks]);

  const getTaskPosition = (task: Task) => {
    if (!roadmapData) return { left: 0, width: 0 };
    
    const { minDate, totalDays } = roadmapData;
    const start = task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(task.dueDate) : minDate);
    const end = task.dueDate ? new Date(task.dueDate) : start;
    
    const startOffset = Math.max(0, (start.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000));
    const endOffset = Math.max(startOffset + 1, (end.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000));
    
    const left = (startOffset / totalDays) * 100;
    const width = Math.max(2, ((endOffset - startOffset) / totalDays) * 100);
    
    return { left, width };
  };

  const generateTimelineMarkers = () => {
    if (!roadmapData) return [];
    
    const { minDate, maxDate } = roadmapData;
    const markers: { date: Date; label: string; position: number }[] = [];
    
    const current = new Date(minDate);
    current.setDate(1); // Start from first of month
    
    while (current <= maxDate) {
      const position = ((current.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
      if (position >= 0 && position <= 100) {
        markers.push({
          date: new Date(current),
          label: current.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          position,
        });
      }
      current.setMonth(current.getMonth() + 1);
    }
    
    return markers;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter and Stats */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-slate-500" />
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white min-w-[200px]"
            >
              <option value="all">Todos os Projetos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.company?.name} - {p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-slate-400" />
              <span className="text-slate-600">Visualização apenas</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500">Total: <strong className="text-slate-700">{totalTasks}</strong></span>
              <span className="text-green-600">Concluídas: <strong>{completedTasks}</strong></span>
              {overdueTasks > 0 && (
                <span className="text-orange-600 flex items-center gap-1">
                  <AlertTriangle size={14} /> Em atraso: <strong>{overdueTasks}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            viewMode === 'list' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <List size={16} /> Lista
        </button>
        <button
          onClick={() => setViewMode('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
            viewMode === 'roadmap' 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-50 shadow-sm'
          }`}
        >
          <LayoutGrid size={16} /> Roadmap
        </button>
      </div>

      {/* Schedule Content */}
      {Object.keys(groupedData).length === 0 ? (
        <div className="bg-white rounded-xl p-10 shadow-sm text-center">
          <CalendarClock size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Nenhuma tarefa com datas definidas encontrada.</p>
          <p className="text-xs text-slate-400 mt-1">Defina início e deadline nas tarefas dos projetos para visualizá-las aqui.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-6">
          {Object.values(groupedData).map(({ project, sprints }) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Project Header */}
              <div className="bg-primary px-5 py-4 flex items-center gap-3">
                <FolderKanban size={20} className="text-white" />
                <div>
                  <h3 className="text-white font-semibold">{project.name}</h3>
                  <p className="text-white/70 text-xs">{project.company}</p>
                </div>
              </div>

              {/* Sprints */}
              <div className="divide-y divide-slate-100">
                {Object.values(sprints)
                  .sort((a, b) => a.sprintNumber - b.sprintNumber)
                  .map(({ sprintNumber, sprintName, tasks: sprintTasks }) => (
                    <div key={sprintNumber} className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: sprintColors[sprintNumber - 1] || '#A19AD3' }}
                        >
                          {sprintNumber}
                        </div>
                        <span className="text-sm font-medium text-slate-700">Sprint {sprintNumber}: {sprintName}</span>
                        <span className="text-xs text-slate-400">({sprintTasks.length} tarefas)</span>
                      </div>

                      {/* Tasks Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                              <th className="pb-2 font-medium w-10"></th>
                              <th className="pb-2 font-medium">Tarefa</th>
                              <th className="pb-2 font-medium w-36">Etapa</th>
                              <th className="pb-2 font-medium w-24">Início</th>
                              <th className="pb-2 font-medium w-24">Deadline</th>
                              <th className="pb-2 font-medium w-28">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sprintTasks.map((task) => {
                              const overdue = isOverdue(task.dueDate, task.status);
                              const isDone = task.status === 'concluido' || task.status === 'nao_aplicavel';
                              return (
                                <tr
                                  key={task.id}
                                  className={`border-b border-slate-50 last:border-0 ${
                                    overdue ? 'bg-orange-50' : ''
                                  }`}
                                >
                                  <td className="py-2.5 pr-2">
                                    {getStatusIcon(task.status)}
                                  </td>
                                  <td className={`py-2.5 pr-4 ${isDone ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                    {task.description}
                                  </td>
                                  <td className="py-2.5 pr-4 text-slate-500 text-xs">
                                    {task.stageName}
                                  </td>
                                  <td className="py-2.5 pr-4 text-xs text-slate-600">
                                    {formatDate(task.startDate)}
                                  </td>
                                  <td className={`py-2.5 pr-4 text-xs font-medium ${
                                    overdue ? 'text-orange-600' : 'text-slate-600'
                                  }`}>
                                    {overdue && <AlertTriangle size={12} className="inline mr-1" />}
                                    {formatDate(task.dueDate)}
                                  </td>
                                  <td className="py-2.5">
                                    <span
                                      className="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-white"
                                      style={{
                                        backgroundColor:
                                          TASK_STATUS_OPTIONS.find(o => o.value === task.status)?.color || '#A19AD3',
                                      }}
                                    >
                                      {getStatusLabel(task.status)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Roadmap View */
        <div className="space-y-6">
          {roadmapData && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Timeline Header */}
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="relative h-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-slate-200" />
                  </div>
                  {generateTimelineMarkers().map((marker, idx) => (
                    <div
                      key={idx}
                      className="absolute top-0 flex flex-col items-center"
                      style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="w-px h-3 bg-slate-300" />
                      <span className="text-[10px] text-slate-500 mt-1 whitespace-nowrap">{marker.label}</span>
                    </div>
                  ))}
                  {/* Today marker */}
                  {(() => {
                    const today = new Date();
                    const position = ((today.getTime() - roadmapData.minDate.getTime()) / (roadmapData.maxDate.getTime() - roadmapData.minDate.getTime())) * 100;
                    if (position >= 0 && position <= 100) {
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{ left: `${position}%` }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-red-600 font-medium whitespace-nowrap">
                            Hoje
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Projects Roadmap */}
              <div className="divide-y divide-slate-100">
                {Object.values(groupedData).map(({ project, sprints }) => (
                  <div key={project.id}>
                    {/* Project Header */}
                    <div className="bg-slate-50 px-4 py-2 flex items-center gap-2 border-b border-slate-100">
                      <FolderKanban size={14} className="text-primary" />
                      <span className="text-sm font-medium text-slate-700">{project.name}</span>
                      <span className="text-xs text-slate-400">({project.company})</span>
                    </div>

                    {/* Sprints */}
                    {Object.values(sprints)
                      .sort((a, b) => a.sprintNumber - b.sprintNumber)
                      .map(({ sprintNumber, sprintName, tasks: sprintTasks }) => (
                        <div key={sprintNumber} className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: sprintColors[sprintNumber - 1] || '#A19AD3' }}
                            >
                              {sprintNumber}
                            </div>
                            <span className="text-xs font-medium text-slate-600">Sprint {sprintNumber}</span>
                          </div>

                          {/* Task Bars */}
                          <div className="space-y-1.5 ml-7">
                            {sprintTasks.map((task) => {
                              const { left, width } = getTaskPosition(task);
                              const overdue = isOverdue(task.dueDate, task.status);
                              const isDone = task.status === 'concluido' || task.status === 'nao_aplicavel';
                              const statusColor = TASK_STATUS_OPTIONS.find(o => o.value === task.status)?.color || '#A19AD3';
                              
                              return (
                                <div key={task.id} className="relative h-7 group">
                                  <div
                                    className={`absolute h-6 rounded-md flex items-center px-2 text-[10px] font-medium text-white overflow-hidden transition-all ${
                                      overdue ? 'ring-2 ring-orange-400' : ''
                                    } ${isDone ? 'opacity-60' : ''}`}
                                    style={{
                                      left: `${left}%`,
                                      width: `${width}%`,
                                      minWidth: '80px',
                                      backgroundColor: overdue && !isDone ? '#FF9149' : statusColor,
                                    }}
                                    title={`${task.description}\nInício: ${formatDate(task.startDate)}\nDeadline: ${formatDate(task.dueDate)}`}
                                  >
                                    <span className="truncate">{task.description}</span>
                                  </div>
                                  {/* Tooltip on hover */}
                                  <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-20 bg-slate-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                    <div className="font-medium">{task.description}</div>
                                    <div className="text-slate-300">
                                      {task.startDate && `Início: ${formatDate(task.startDate)}`}
                                      {task.startDate && task.dueDate && ' → '}
                                      {task.dueDate && `Deadline: ${formatDate(task.dueDate)}`}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="border-t border-slate-200 px-4 py-3 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-slate-600">Hoje</span>
                </div>
                {TASK_STATUS_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: opt.color }} />
                    <span className="text-slate-600">{opt.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#FF9149] ring-2 ring-orange-400" />
                  <span className="text-slate-600">Em atraso</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
