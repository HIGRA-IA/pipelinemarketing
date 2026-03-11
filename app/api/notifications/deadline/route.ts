export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST() {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const activeProjects = await prisma.project.findMany({
      where: { status: { in: ['planejamento', 'em_andamento'] } },
      include: {
        company: true,
        sprints: {
          include: { tasks: { where: { status: { not: 'concluido' } } } },
          where: { endDate: { lte: threeDaysLater, gte: now } },
        },
      },
    });

    const alerts: string[] = [];
    for (const p of activeProjects ?? []) {
      for (const s of p?.sprints ?? []) {
        const pendingTasks = s?.tasks?.length ?? 0;
        if (pendingTasks > 0) {
          alerts.push(`<b>${p?.company?.name} - ${p?.name}</b>: Sprint ${s?.number} (${s?.name}) encerra em breve com ${pendingTasks} tarefa(s) pendente(s)`);
        }
      }
    }

    if (alerts.length === 0) {
      return NextResponse.json({ message: 'Nenhum alerta de prazo pendente' });
    }

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f;border-bottom:2px solid #00c853;padding-bottom:10px">
          \u26a0\ufe0f Alerta de Prazos - HIGRA Marketing
        </h2>
        <div style="background:#f9fafb;padding:20px;border-radius:8px;margin:20px 0">
          ${alerts?.map?.(a => `<p style="margin:8px 0;padding:10px;background:white;border-radius:4px;border-left:4px solid #FF9149">${a}</p>`)?.join?.('') ?? ''}
        </div>
        <p style="color:#666;font-size:12px">Enviado automaticamente pelo HIGRA Marketing Manager</p>
      </div>
    `;

    const appUrl = process.env.NEXTAUTH_URL ?? '';
    let appName = 'HIGRA Marketing';
    try { appName = new URL(appUrl).hostname?.split?.('.')?.[0] ?? 'HIGRA Marketing'; } catch {}

    const res = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        app_id: process.env.WEB_APP_ID,
        notification_id: process.env.NOTIF_ID_ALERTA_DE_PRAZO_DE_TAREFA,
        subject: `[HIGRA] Alerta de Prazos - ${alerts.length} sprint(s) próxima(s) do vencimento`,
        body: htmlBody,
        is_html: true,
        recipient_email: 'mkthigra2@gmail.com',
        sender_alias: appName,
      }),
    });
    const result = await res.json();
    return NextResponse.json({ success: true, alerts: alerts.length, result });
  } catch (error) {
    console.error('Error sending deadline notification:', error);
    return NextResponse.json({ error: 'Erro ao enviar notificação' }, { status: 500 });
  }
}
