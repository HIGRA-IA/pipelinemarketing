'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, RotateCcw, SendHorizonal, Loader2 } from 'lucide-react';

export default function AgentEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [original, setOriginal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Test area
  const [testMsg, setTestMsg] = useState('');
  const [testResponse, setTestResponse] = useState<{ content: string; imageUrl?: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then(r => r.json())
      .then(d => { setAgent(d); setOriginal(d); });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(agent),
    });
    const updated = await res.json();
    setAgent(updated);
    setOriginal(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRestore = () => setAgent({ ...original });

  const handleTest = async () => {
    if (!testMsg.trim()) return;
    setTesting(true);
    setTestError('');
    setTestResponse(null);
    const res = await fetch(`/api/agents/${id}/test`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: testMsg }),
    });
    const data = await res.json();
    if (data.error) setTestError(data.error);
    else setTestResponse(data);
    setTesting(false);
  };

  if (!agent) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const set = (key: string, val: any) => setAgent((prev: any) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/agentes" className="p-2 hover:bg-slate-100 rounded-lg transition">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <span>{agent.icon}</span> {agent.name}
          </h1>
          <p className="text-xs text-slate-400">Configuração do agente</p>
        </div>
      </div>

      {/* Section 1 — Informações Gerais */}
      <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-700">Informações Gerais</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Nome</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={agent.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Ícone (emoji)</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={agent.icon ?? ''} onChange={e => set('icon', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Descrição</label>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={agent.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500">Status</label>
          <button
            onClick={() => set('isActive', !agent.isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${agent.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${agent.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className="text-xs text-slate-600">{agent.isActive ? 'Ativo' : 'Inativo'}</span>
        </div>
      </section>

      {/* Section 2 — Modelo */}
      <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-700">Configuração do Modelo</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Provider</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={agent.modelProvider} onChange={e => set('modelProvider', e.target.value)}>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (DALL-E)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Modelo</label>
            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={agent.modelName} onChange={e => set('modelName', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Temperatura: {agent.temperature}</label>
            <input type="range" min={0} max={1} step={0.1} className="w-full" value={agent.temperature} onChange={e => set('temperature', parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Max Tokens</label>
            <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={agent.maxTokens} onChange={e => set('maxTokens', parseInt(e.target.value))} />
          </div>
        </div>
      </section>

      {/* Section 3 — System Prompt */}
      <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-700">Prompt do Sistema</h2>
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm font-mono resize-y"
          style={{ minHeight: '400px' }}
          value={agent.systemPrompt}
          onChange={e => set('systemPrompt', e.target.value)}
        />
        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
          <strong>Variáveis disponíveis:</strong> <code>{'{{projeto.nome}}'}</code>, <code>{'{{projeto.tema}}'}</code>, <code>{'{{projeto.produto}}'}</code>, <code>{'{{projeto.objetivo}}'}</code>, <code>{'{{projeto.empresa}}'}</code>, <code>{'{{projeto.orcamento}}'}</code>, <code>{'{{projeto.icp}}'}</code>
          <br />Use-as para injetar contexto do projeto automaticamente quando o agente for usado dentro de uma campanha.
        </div>
      </section>

      {/* Section 4 — Teste */}
      <section className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-700">Área de Teste</h2>
        <p className="text-xs text-slate-400">Teste o agente com uma mensagem rápida. As respostas não são salvas.</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Digite uma mensagem para testar..."
            value={testMsg}
            onChange={e => setTestMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTest()}
          />
          <button
            onClick={handleTest}
            disabled={testing || !testMsg.trim()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition disabled:opacity-50"
          >
            {testing ? <Loader2 size={15} className="animate-spin" /> : <SendHorizonal size={15} />}
            Testar
          </button>
        </div>
        {testError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{testError}</p>}
        {testResponse && (
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
            {testResponse.imageUrl ? (
              <div>
                <img src={testResponse.imageUrl} alt="Gerado por IA" className="rounded-lg max-w-full" />
              </div>
            ) : testResponse.content}
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
        <button
          onClick={handleRestore}
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
        >
          <RotateCcw size={15} /> Restaurar Padrão
        </button>
      </div>
    </div>
  );
}
