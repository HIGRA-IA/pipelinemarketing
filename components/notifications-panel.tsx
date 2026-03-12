'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Send, CheckCircle, AlertTriangle, Mail, Calendar } from 'lucide-react';

export default function NotificationsPanel() {
  const [sendingDeadline, setSendingDeadline] = useState(false);
  const [sendingWeekly, setSendingWeekly] = useState(false);
  const [deadlineResult, setDeadlineResult] = useState<any>(null);
  const [weeklyResult, setWeeklyResult] = useState<any>(null);

  const sendDeadlineAlert = async () => {
    setSendingDeadline(true);
    setDeadlineResult(null);
    try {
      const res = await fetch('/api/notifications/deadline', { method: 'POST' });
      const data = await res.json();
      setDeadlineResult(data);
    } catch (e) {
      console.error(e);
      setDeadlineResult({ error: 'Erro ao enviar' });
    }
    setSendingDeadline(false);
  };

  const sendWeeklyReview = async () => {
    setSendingWeekly(true);
    setWeeklyResult(null);
    try {
      const res = await fetch('/api/notifications/weekly-review', { method: 'POST' });
      const data = await res.json();
      setWeeklyResult(data);
    } catch (e) {
      console.error(e);
      setWeeklyResult({ error: 'Erro ao enviar' });
    }
    setSendingWeekly(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Deadline Alert */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-orange-100">
            <AlertTriangle size={24} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Alerta de Prazos</h3>
            <p className="text-xs text-slate-500">Verifica sprints que vencem nos próximos 3 dias</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail size={12} /> Destinatário: <span className="font-medium">mkthigra2@gmail.com</span>
            </div>
          </div>
          <button
            onClick={sendDeadlineAlert}
            disabled={sendingDeadline}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition disabled:opacity-50"
          >
            {sendingDeadline ? (
              <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Enviando...</>
            ) : (
              <><Send size={16} /> Enviar Alerta de Prazos</>
            )}
          </button>
          {deadlineResult && (
            <div className={`rounded-lg p-3 text-sm ${
              deadlineResult?.error ? 'bg-red-50 text-red-700' :
              deadlineResult?.message ? 'bg-blue-50 text-blue-700' :
              'bg-green-50 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                {deadlineResult?.error ? <AlertTriangle size={14} /> : deadlineResult?.message ? <Bell size={14} /> : <CheckCircle size={14} />}
                {deadlineResult?.error ?? deadlineResult?.message ?? `Alerta enviado! ${deadlineResult?.alerts ?? 0} sprint(s) próxima(s) do vencimento.`}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Weekly Review */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-blue-100">
            <Calendar size={24} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Revisão Semanal</h3>
            <p className="text-xs text-slate-500">Resumo de progresso e lembrete de revisão de plataformas</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail size={12} /> Destinatário: <span className="font-medium">mkthigra2@gmail.com</span>
            </div>
          </div>
          <button
            onClick={sendWeeklyReview}
            disabled={sendingWeekly}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition disabled:opacity-50"
          >
            {sendingWeekly ? (
              <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Enviando...</>
            ) : (
              <><Send size={16} /> Enviar Revisão Semanal</>
            )}
          </button>
          {weeklyResult && (
            <div className={`rounded-lg p-3 text-sm ${
              weeklyResult?.error ? 'bg-red-50 text-red-700' :
              weeklyResult?.message ? 'bg-blue-50 text-blue-700' :
              'bg-green-50 text-green-700'
            }`}>
              <div className="flex items-center gap-2">
                {weeklyResult?.error ? <AlertTriangle size={14} /> : weeklyResult?.message ? <Bell size={14} /> : <CheckCircle size={14} />}
                {weeklyResult?.error ?? weeklyResult?.message ?? `Revisão enviada! ${weeklyResult?.projects ?? 0} projeto(s) ativo(s) incluídos.`}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
          <Bell size={16} className="text-primary" /> Sobre as Notificações
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <h4 className="font-medium text-slate-700 mb-1">⚠️ Alerta de Prazos</h4>
            <p>Verifica automaticamente quais sprints estão próximos do vencimento (3 dias) e envia um e-mail com a lista de tarefas pendentes.</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-1">📅 Revisão Semanal</h4>
            <p>Envia um resumo do progresso de todos os projetos ativos e um lembrete para revisar as plataformas de tráfego pago, e-mail marketing e prospecção.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
