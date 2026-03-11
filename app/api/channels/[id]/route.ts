export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const entry = await prisma.channelData.update({
      where: { id },
      data: {
        channel: body?.channel ?? undefined,
        subChannel: body?.subChannel ?? undefined,
        year: body?.year !== undefined ? Number(body.year) : undefined,
        month: body?.month !== undefined ? Number(body.month) : undefined,
        weekNumber: body?.weekNumber !== undefined ? Number(body.weekNumber) : undefined,
        impressions: body?.impressions !== undefined ? Number(body.impressions) : undefined,
        clicks: body?.clicks !== undefined ? Number(body.clicks) : undefined,
        conversions: body?.conversions !== undefined ? Number(body.conversions) : undefined,
        cost: body?.cost !== undefined ? Number(body.cost) : undefined,
        leads: body?.leads !== undefined ? Number(body.leads) : undefined,
        mqls: body?.mqls !== undefined ? Number(body.mqls) : undefined,
        sqls: body?.sqls !== undefined ? Number(body.sqls) : undefined,
        notes: body?.notes ?? undefined,
      },
    });
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error updating channel data:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados do canal' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.channelData.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting channel data:', error);
    return NextResponse.json({ error: 'Erro ao excluir dados do canal' }, { status: 500 });
  }
}
