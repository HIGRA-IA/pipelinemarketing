import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const agentId = req.nextUrl.searchParams.get('agentId');
  const where: any = { projectId: params.id };
  if (agentId) where.agentId = agentId;

  const conversations = await prisma.agentConversation.findMany({
    where,
    include: { agent: true, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(conversations);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { agentId, title } = await req.json();
  const conv = await prisma.agentConversation.create({
    data: { projectId: params.id, agentId, title: title ?? 'Nova Conversa' },
    include: { agent: true, messages: true },
  });
  return NextResponse.json(conv);
}
