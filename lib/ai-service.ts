interface ProjectContext {
  nome?: string;
  tema?: string;
  produto?: string;
  objetivo?: string;
  empresa?: string;
  orcamento?: number | string;
  icp?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function injectContext(prompt: string, ctx: ProjectContext): string {
  return prompt
    .replace(/\{\{projeto\.nome\}\}/g, ctx.nome ?? '')
    .replace(/\{\{projeto\.tema\}\}/g, ctx.tema ?? '')
    .replace(/\{\{projeto\.produto\}\}/g, ctx.produto ?? '')
    .replace(/\{\{projeto\.objetivo\}\}/g, ctx.objetivo ?? '')
    .replace(/\{\{projeto\.empresa\}\}/g, ctx.empresa ?? '')
    .replace(/\{\{projeto\.orcamento\}\}/g, String(ctx.orcamento ?? ''))
    .replace(/\{\{projeto\.icp\}\}/g, ctx.icp ?? '');
}

export async function callAnthropic(params: {
  systemPrompt: string;
  messages: ChatMessage[];
  model: string;
  temperature: number;
  maxTokens: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      system: params.systemPrompt,
      messages: params.messages,
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}

export async function callDallE(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data?.[0]?.url ?? '';
}
