import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { callAnthropic, callDallE, injectContext } from '@/lib/ai-service';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const messages = await prisma.agentMessage.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 });

  // Load conversation + agent + project
  const conv = await prisma.agentConversation.findUnique({
    where: { id: params.id },
    include: {
      agent: true,
      project: { include: { company: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  // Save user message
  await prisma.agentMessage.create({
    data: { conversationId: params.id, role: 'user', content },
  });

  // Build context
  const project = conv.project;
  const ctx = {
    nome: project.name,
    tema: project.theme,
    produto: project.priorityProduct,
    objetivo: project.objective,
    empresa: project.company?.name ?? '',
    orcamento: project.budgetTraffic,
  };

  const agent = conv.agent;
  const systemPrompt = injectContext(agent.systemPrompt, ctx);

  // Build message history for context
  const history = conv.messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  history.push({ role: 'user', content });

  try {
    let assistantMsg;

    if (agent.modelProvider === 'openai' && agent.type === 'image_generator') {
      const imageUrl = await callDallE(content);
      assistantMsg = await prisma.agentMessage.create({
        data: { conversationId: params.id, role: 'assistant', content, imageUrl },
      });
    } else {
      const text = await callAnthropic({
        systemPrompt,
        messages: history,
        model: agent.modelName,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
      });
      assistantMsg = await prisma.agentMessage.create({
        data: { conversationId: params.id, role: 'assistant', content: text },
      });
    }

    // Update conversation title if it's the first message
    if (conv.messages.length === 0) {
      const title = content.slice(0, 60) + (content.length > 60 ? '…' : '');
      await prisma.agentConversation.update({ where: { id: params.id }, data: { title } });
    } else {
      await prisma.agentConversation.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
    }

    return NextResponse.json(assistantMsg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
