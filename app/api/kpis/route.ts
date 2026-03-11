export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = await prisma.kpiEntry.create({
      data: {
        projectId: body?.projectId,
        date: new Date(body?.date ?? Date.now()),
        cpl: body?.cpl != null ? Number(body.cpl) : null,
        costPerProposal: body?.costPerProposal != null ? Number(body.costPerProposal) : null,
        mqlToSqlRate: body?.mqlToSqlRate != null ? Number(body.mqlToSqlRate) : null,
        projectedRoi: body?.projectedRoi != null ? Number(body.projectedRoi) : null,
        ctr: body?.ctr != null ? Number(body.ctr) : null,
        lpConversion: body?.lpConversion != null ? Number(body.lpConversion) : null,
        mqlQuality: body?.mqlQuality != null ? Number(body.mqlQuality) : null,
        totalSpent: body?.totalSpent != null ? Number(body.totalSpent) : null,
        totalLeads: body?.totalLeads != null ? Number(body.totalLeads) : null,
        totalMqls: body?.totalMqls != null ? Number(body.totalMqls) : null,
        totalSqls: body?.totalSqls != null ? Number(body.totalSqls) : null,
        notes: body?.notes ?? '',
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar KPI' }, { status: 500 });
  }
}
