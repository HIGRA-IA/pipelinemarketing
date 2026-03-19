import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { callAnthropic, callDallE } from '@/lib/ai-service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const agent = await prisma.aiAgent.findUnique({ where: { id: params.id } });
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  try {
    if (agent.modelProvider === 'openai' && agent.type === 'image_generator') {
      const imageUrl = await callDallE(message);
      return NextResponse.json({ role: 'assistant', content: message, imageUrl });
    }

    const text = await callAnthropic({
      systemPrompt: agent.systemPrompt,
      messages: [{ role: 'user', content: message }],
      model: agent.modelName,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
    });
    return NextResponse.json({ role: 'assistant', content: text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
