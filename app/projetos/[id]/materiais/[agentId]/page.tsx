'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, SendHorizonal, Loader2, History } from 'lucide-react';

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/^#{1,3} (.+)$/gm, '<p class="font-semibold text-slate-800 mt-2">$1</p>')
    .replace(/\n/g, '<br />');
}

export default function ChatPage() {
  const { id: projectId, agentId } = useParams<{ id: string; agentId: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/agents/${agentId}`).then(r => r.json()).then(setAgent);
    fetch(`/api/projects/${projectId}`).then(r => r.json()).then(setProject);
    loadConversations();
  }, [agentId, projectId]);

  const loadConversations = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/conversations?agentId=${agentId}`);
    const convs = await res.json();
    const list = Array.isArray(convs) ? convs : [];
    setConversations(list);
    if (list.length > 0 && !activeConvId) {
      openConversation(list[0].id);
    }
  }, [projectId, agentId, activeConvId]);

  const openConversation = async (convId: string) => {
    setActiveConvId(convId);
    const res = await fetch(`/api/conversations/${convId}/messages`);
    const msgs = await res.json();
    setMessages(Array.isArray(msgs) ? msgs : []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const newConversation = async () => {
    const res = await fetch(`/api/projects/${projectId}/conversations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const conv = await res.json();
    setConversations(prev => [conv, ...prev]);
    setActiveConvId(conv.id);
    setMessages([]);
  };

  const send = async () => {
    if (!input.trim() || sending) return;

    let convId = activeConvId;
    if (!convId) {
      const res = await fetch(`/api/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const conv = await res.json();
      convId = conv.id;
      setActiveConvId(conv.id);
      setConversations(prev => [conv, ...prev]);
    }

    const userMsg = { id: Date.now().toString(), role: 'user', content: input, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const res = await fetch(`/api/conversations/${convId}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: input }),
    });
    const assistantMsg = await res.json();
    if (!assistantMsg.error) {
      setMessages(prev => [...prev, assistantMsg]);
      // Update conversation title in list
      await loadConversations();
    } else {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: `Erro: ${assistantMsg.error}`, createdAt: new Date().toISOString() }]);
    }
    setSending(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href={`/projetos/${projectId}`} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft size={18} className="text-slate-500" />
        </Link>
        <span className="text-2xl">{agent?.icon ?? '🤖'}</span>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{agent?.name}</p>
          <p className="text-xs text-slate-400">{project?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {conversations.length > 1 && (
            <select
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 max-w-[200px] truncate"
              value={activeConvId ?? ''}
              onChange={e => openConversation(e.target.value)}
            >
              {conversations.map(c => (
                <option key={c.id} value={c.id}>{c.title || 'Sem título'}</option>
              ))}
            </select>
          )}
          <button
            onClick={newConversation}
            className="flex items-center gap-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
          >
            <Plus size={13} /> Nova
          </button>
          <Link
            href={`/projetos/${projectId}/materiais/${agentId}/historico`}
            className="flex items-center gap-1.5 text-xs border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
          >
            <History size={13} /> Histórico
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-3">
            <span className="text-5xl">{agent?.icon ?? '🤖'}</span>
            <div>
              <p className="font-medium text-slate-600">{agent?.name}</p>
              <p className="text-sm">{agent?.description}</p>
              <p className="text-xs mt-2 text-slate-300">Digite uma mensagem para começar</p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <span className="text-xl mr-2 mt-1 flex-shrink-0">{agent?.icon ?? '🤖'}</span>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-white shadow-sm text-slate-800 rounded-bl-sm'}`}>
              {msg.imageUrl ? (
                <div>
                  <img src={msg.imageUrl} alt="Imagem gerada" className="rounded-lg max-w-full mb-2" />
                  <p className="text-xs opacity-60">Imagem gerada via DALL-E 3</p>
                </div>
              ) : (
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content }}
                />
              )}
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-slate-300'}`}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <span className="text-xl mr-2 mt-1">{agent?.icon ?? '🤖'}</span>
            <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">digitando...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-primary"
            rows={1}
            style={{ maxHeight: '120px' }}
            placeholder={`Mensagem para ${agent?.name ?? 'agente'}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); } }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition disabled:opacity-40 flex-shrink-0"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
        <p className="text-[10px] text-slate-300 mt-1.5 text-right">Ctrl + Enter para enviar</p>
      </div>
    </div>
  );
}
