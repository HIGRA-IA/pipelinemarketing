export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = await prisma.channelData.create({
      data: {
        projectId: body?.projectId,
        channel: body?.channel ?? '',
        subChannel: body?.subChannel ?? '',
        year: Number(body?.year ?? new Date().getFullYear()),
        month: Number(body?.month ?? 1),
        weekNumber: Number(body?.weekNumber ?? 1),
        impressions: Number(body?.impressions ?? 0),
        clicks: Number(body?.clicks ?? 0),
        conversions: Number(body?.conversions ?? 0),
        cost: Number(body?.cost ?? 0),
        leads: Number(body?.leads ?? 0),
        mqls: Number(body?.mqls ?? 0),
        sqls: Number(body?.sqls ?? 0),
        notes: body?.notes ?? '',
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro ao salvar dados do canal' }, { status: 500 });
  }
}
