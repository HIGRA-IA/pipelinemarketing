'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings2, Bot } from 'lucide-react';

export default function AgentesPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Agentes IA</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure e treine os agentes de inteligência artificial que auxiliam na produção de materiais das campanhas.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{agent.icon ?? '🤖'}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-lg">{agent.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${agent.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {agent.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {agent.modelProvider === 'openai' ? 'OpenAI' : 'Anthropic'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-500 flex-1">{agent.description}</p>
              <Link
                href={`/agentes/${agent.id}`}
                className="flex items-center justify-center gap-2 border border-primary text-primary text-sm py-2.5 rounded-lg hover:bg-primary hover:text-white transition font-medium"
              >
                <Settings2 size={15} /> Configurar
              </Link>
            </div>
          ))}

          {agents.length === 0 && (
            <div className="col-span-3 text-center py-20 text-slate-400">
              <Bot size={40} className="mx-auto mb-3 opacity-40" />
              <p>Nenhum agente encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
