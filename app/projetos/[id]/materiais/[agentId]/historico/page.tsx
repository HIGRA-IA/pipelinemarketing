'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Trash2 } from 'lucide-react';

export default function HistoricoPage() {
  const { id: projectId, agentId } = useParams<{ id: string; agentId: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/agents/${agentId}`).then(r => r.json()).then(setAgent);
    load();
  }, [agentId, projectId]);

  const load = async () => {
    const res = await fetch(`/api/projects/${projectId}/conversations?agentId=${agentId}`);
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
  };

  const deleteConv = async (convId: string) => {
    if (!confirm('Excluir esta conversa? Esta ação não pode ser desfeita.')) return;
    setDeletingId(convId);
    await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
    await load();
    setDeletingId(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/projetos/${projectId}/materiais/${agentId}`} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <span>{agent?.icon}</span> Histórico — {agent?.name}
          </h1>
          <p className="text-xs text-slate-400">{conversations.length} conversa{conversations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhuma conversa encontrada.</p>
          <Link href={`/projetos/${projectId}/materiais/${agentId}`} className="text-primary hover:underline text-sm mt-2 inline-block">
            Iniciar conversa
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => {
            const lastMsg = conv.messages?.[0];
            return (
              <div key={conv.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{conv.title || 'Sem título'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(conv.createdAt)}</p>
                  {lastMsg && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {lastMsg.role === 'user' ? 'Você: ' : `${agent?.name}: `}
                      {lastMsg.content?.slice(0, 120)}{lastMsg.content?.length > 120 ? '…' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/projetos/${projectId}/materiais/${agentId}?conv=${conv.id}`}
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition"
                  >
                    Abrir
                  </Link>
                  <button
                    onClick={() => deleteConv(conv.id)}
                    disabled={deletingId === conv.id}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
