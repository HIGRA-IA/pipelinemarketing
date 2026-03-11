export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST() {
  try {
    const activeProjects = await prisma.project.findMany({
      where: { status: { in: ['planejamento', 'em_andamento'] } },
      include: {
        company: true,
        sprints: { include: { tasks: true }, orderBy: { number: 'asc' } },
        channelData: { orderBy: { date: 'desc' }, take: 10 },
        kpiEntries: { orderBy: { date: 'desc' }, take: 1 },
      },
    });

    if ((activeProjects?.length ?? 0) === 0) {
      return NextResponse.json({ message: 'Nenhum projeto ativo para revisão' });
    }

    const projectSections = (activeProjects ?? [])?.map?.((p: any) => {
      const allTasks = (p?.sprints ?? [])?.flatMap?.((s: any) => s?.tasks ?? []) ?? [];
      const done = allTasks?.filter?.((t: any) => t?.status === 'concluido')?.length ?? 0;
      const total = allTasks?.length ?? 1;
      const progress = Math.round((done / (total || 1)) * 100);
      const latestKpi = p?.kpiEntries?.[0];

      return `
        <div style="background:white;padding:15px;border-radius:8px;margin:10px 0;border-left:4px solid #1e3a5f">
          <h3 style="margin:0 0 8px;color:#1e3a5f">${p?.company?.name} - ${p?.name}</h3>
          <p style="margin:4px 0">\ud83d\udcca Progresso: <b>${progress}%</b> (${done}/${total} tarefas)</p>
          ${latestKpi ? `<p style="margin:4px 0">\ud83d\udcb0 CPL: R$ ${latestKpi?.cpl?.toFixed?.(2) ?? 'N/A'} | CTR: ${latestKpi?.ctr?.toFixed?.(1) ?? 'N/A'}%</p>` : '<p style="margin:4px 0">\u2139\ufe0f Sem dados de KPI registrados ainda</p>'}
        </div>
      `;
    })?.join?.('') ?? '';

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1e3a5f;border-bottom:2px solid #00c853;padding-bottom:10px">
          \ud83d\udccb Revisão Semanal - HIGRA Marketing
        </h2>
        <p style="color:#555">Confira o status dos seus projetos ativos:</p>
        ${projectSections}
        <div style="background:#f0f9ff;padding:15px;border-radius:8px;margin:15px 0">
          <p style="margin:0;color:#1e3a5f"><b>\ud83d\udd14 Lembrete:</b> Revise as plataformas de tráfego pago, e-mail marketing e prospecção ativa desta semana.</p>
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
        notification_id: process.env.NOTIF_ID_REVISO_SEMANAL_DE_PLATAFORMAS,
        subject: `[HIGRA] Revisão Semanal - ${activeProjects?.length ?? 0} projeto(s) ativo(s)`,
        body: htmlBody,
        is_html: true,
        recipient_email: 'mkthigra2@gmail.com',
        sender_alias: appName,
      }),
    });
    const result = await res.json();
    return NextResponse.json({ success: true, projects: activeProjects?.length ?? 0, result });
  } catch (error) {
    console.error('Error sending weekly review:', error);
    return NextResponse.json({ error: 'Erro ao enviar revisão semanal' }, { status: 500 });
  }
}
