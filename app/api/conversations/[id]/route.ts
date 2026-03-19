import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const conv = await prisma.agentConversation.findUnique({
    where: { id: params.id },
    include: { agent: true, messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(conv);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.agentConversation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
