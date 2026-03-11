export const COMPANIES = [
  { name: 'HIGRA Industrial', projectsPerYear: 12, frequency: '1 por mês' },
  { name: 'HIGRA Systems', projectsPerYear: 12, frequency: '1 por mês' },
  { name: 'HIGRA Customer Service', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'HIGRA Service Sul', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'HIGRA Motors', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'HIGRA Mining', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'Voltson Brasil', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
];

export const SPRINT_TEMPLATES = [
  {
    number: 1,
    name: 'Planejamento + Execução',
    objective: 'Colocar campanha no ar com estrutura completa e rastreável',
    stages: [
      {
        number: 1,
        name: 'Definição Estratégica',
        tasks: [
          { description: 'ICP técnico definido', toolsAi: 'ChatGPT Enterprise, Perplexity', toolsThirdParty: 'Não necessário' },
          { description: 'Dor principal mapeada', toolsAi: 'ChatGPT Enterprise, Perplexity', toolsThirdParty: 'Não necessário' },
          { description: 'Proposta de valor técnica', toolsAi: 'ChatGPT Enterprise, SEMrush', toolsThirdParty: 'Não necessário' },
          { description: 'Oferta central definida (Diagnóstico, Simulação, Reunião Técnica)', toolsAi: 'ChatGPT Enterprise', toolsThirdParty: 'Não necessário' },
        ],
      },
      {
        number: 2,
        name: 'Ativos - Landing Page',
        tasks: [
          { description: 'Landing Page em WordPress com copy técnica', toolsAi: 'ChatGPT (copy), SurferSEO (SEO técnico)', toolsThirdParty: 'Desenvolvedor WP se necessário' },
          { description: 'CTA direto para reunião configurado', toolsAi: 'ChatGPT', toolsThirdParty: 'WordPress' },
        ],
      },
      {
        number: 3,
        name: 'Ativos - Conteúdo Hero/Hub/Help',
        tasks: [
          { description: 'Artigo Hero (1) produzido', toolsAi: 'ChatGPT, SurferSEO', toolsThirdParty: 'Revisão técnica interna (Engenharia)' },
          { description: 'Artigos Hub (2) produzidos', toolsAi: 'ChatGPT, SurferSEO', toolsThirdParty: 'Revisão técnica interna' },
          { description: 'Artigos Help (2) produzidos', toolsAi: 'ChatGPT, SurferSEO', toolsThirdParty: 'Revisão técnica interna' },
        ],
      },
      {
        number: 4,
        name: 'Ativos - Conteúdo Rico',
        tasks: [
          { description: 'Conteúdo Rico 1 (eBook, Whitepaper, Guia)', toolsAi: 'ChatGPT, Canva', toolsThirdParty: 'Design interno' },
          { description: 'Conteúdo Rico 2 (Checklist, Template, Infográfico)', toolsAi: 'ChatGPT, Canva', toolsThirdParty: 'Design interno' },
          { description: 'Conteúdo Rico 3 (Webinar, Vídeo-aula, Estudo de Caso)', toolsAi: 'ChatGPT, Runway', toolsThirdParty: 'Videomaker interno' },
        ],
      },
      {
        number: 5,
        name: 'Ativos - Criativos',
        tasks: [
          { description: 'Banners criados (Design interno)', toolsAi: 'Midjourney (apoio visual)', toolsThirdParty: 'Design interno' },
          { description: 'Vídeo técnico produzido', toolsAi: 'Runway (edição rápida)', toolsThirdParty: 'Videomaker interno' },
          { description: 'Motion avançado contratado', toolsAi: 'Runway', toolsThirdParty: 'Terceiro especializado' },
        ],
      },
      {
        number: 6,
        name: 'Tráfego Pago',
        tasks: [
          { description: 'Campanha Google Search configurada (R$ 1.200)', toolsAi: 'ChatGPT (estrutura anúncios), AdCreative.ai', toolsThirdParty: 'Especialista Google se CPC alto' },
          { description: 'Campanha Meta Ads configurada (R$ 800)', toolsAi: 'ChatGPT, AdCreative.ai (variações)', toolsThirdParty: '' },
          { description: 'Campanha YouTube Ads configurada (R$ 500)', toolsAi: 'ChatGPT', toolsThirdParty: '' },
        ],
      },
      {
        number: 7,
        name: 'E-mail Marketing (SprintHub)',
        tasks: [
          { description: 'Fluxo de nutrição técnica criado', toolsAi: 'ChatGPT (sequência técnica)', toolsThirdParty: 'SprintHub' },
          { description: 'Fluxo de prova social criado', toolsAi: 'ChatGPT', toolsThirdParty: 'SprintHub' },
          { description: 'Fluxo de conversão para reunião criado', toolsAi: 'ChatGPT', toolsThirdParty: 'SprintHub' },
        ],
      },
      {
        number: 8,
        name: 'Prospecção Ativa (SDR)',
        tasks: [
          { description: '20 conexões/dia no LinkedIn iniciadas', toolsAi: 'ChatGPT (roteiro abordagem)', toolsThirdParty: 'Apollo, Sales Navigator' },
          { description: '3 posts semanais técnicos publicados', toolsAi: 'ChatGPT', toolsThirdParty: 'LinkedIn' },
          { description: 'Cadência outbound configurada', toolsAi: 'ChatGPT', toolsThirdParty: 'Apollo' },
        ],
      },
    ],
  },
  {
    number: 2,
    name: 'Análise Inicial',
    objective: 'Eliminar desperdício rápido',
    stages: [
      {
        number: 1,
        name: 'Análise de Métricas',
        tasks: [
          { description: 'Analisar CPL por canal', toolsAi: 'Looker Studio', toolsThirdParty: 'Google Ads, Meta Ads' },
          { description: 'Analisar CTR dos anúncios', toolsAi: 'Looker Studio', toolsThirdParty: '' },
          { description: 'Analisar conversão da Landing Page', toolsAi: 'Hotjar (heatmap)', toolsThirdParty: 'Google Analytics' },
          { description: 'Avaliar qualidade dos MQLs', toolsAi: '', toolsThirdParty: 'CRM' },
          { description: 'Avaliar taxa de conversão MQL → SQL', toolsAi: '', toolsThirdParty: 'CRM' },
        ],
      },
      {
        number: 2,
        name: 'Ajustes Rápidos',
        tasks: [
          { description: 'Ajustar palavras-chave (negativar/adicionar)', toolsAi: 'SEMrush', toolsThirdParty: 'Google Ads' },
          { description: 'Refinar segmentação de público', toolsAi: 'ChatGPT', toolsThirdParty: 'Meta Ads' },
          { description: 'Ajustar promessa/copy se necessário', toolsAi: 'ChatGPT, SurferSEO', toolsThirdParty: '' },
        ],
      },
    ],
  },
  {
    number: 3,
    name: 'Otimização Estratégica',
    objective: 'Melhorar eficiência',
    stages: [
      {
        number: 1,
        name: 'Otimização de Ativos',
        tasks: [
          { description: 'Criar novo criativo com base nos dados', toolsAi: 'Midjourney, AdCreative.ai', toolsThirdParty: 'Design interno' },
          { description: 'Ajustar oferta conforme feedback', toolsAi: 'ChatGPT', toolsThirdParty: '' },
          { description: 'Melhorar copy da LP e anúncios', toolsAi: 'ChatGPT, SurferSEO', toolsThirdParty: '' },
        ],
      },
      {
        number: 2,
        name: 'Otimização de Canais',
        tasks: [
          { description: 'Ajustar abordagem SDR com insights', toolsAi: 'ChatGPT', toolsThirdParty: 'Apollo, Sales Navigator' },
          { description: 'Revisar fluxos de e-mail com dados', toolsAi: 'ChatGPT', toolsThirdParty: 'SprintHub' },
          { description: 'Analisar heatmap e ajustar LP', toolsAi: 'Hotjar', toolsThirdParty: 'Google Analytics' },
          { description: 'Atualizar dashboards com dados atuais', toolsAi: 'Looker Studio', toolsThirdParty: '' },
        ],
      },
    ],
  },
  {
    number: 4,
    name: 'Escala ou Remodelação',
    objective: 'Decisão estratégica baseada em performance',
    stages: [
      {
        number: 1,
        name: 'Avaliação Final',
        tasks: [
          { description: 'Consolidar todos os KPIs do projeto', toolsAi: 'Looker Studio', toolsThirdParty: '' },
          { description: 'Avaliar CPL vs meta (< R$ 600)', toolsAi: '', toolsThirdParty: '' },
          { description: 'Avaliar conversão MQL → SQL final', toolsAi: '', toolsThirdParty: 'CRM' },
          { description: 'Calcular ROI projetado', toolsAi: '', toolsThirdParty: '' },
        ],
      },
      {
        number: 2,
        name: 'Decisão: Escalar',
        tasks: [
          { description: 'Se CPL < 600 e conversão adequada: Escalar orçamento', toolsAi: '', toolsThirdParty: '' },
          { description: 'Transformar em campanha contínua', toolsAi: '', toolsThirdParty: '' },
        ],
      },
      {
        number: 3,
        name: 'Decisão: Remodelar',
        tasks: [
          { description: 'Se performance abaixo: Mudar ângulo da campanha', toolsAi: 'ChatGPT', toolsThirdParty: '' },
          { description: 'Definir novo ICP se necessário', toolsAi: 'ChatGPT, Perplexity', toolsThirdParty: '' },
          { description: 'Reestruturar promessa e oferta', toolsAi: 'ChatGPT', toolsThirdParty: '' },
        ],
      },
      {
        number: 4,
        name: 'Retrospectiva',
        tasks: [
          { description: 'Sprint Review final do projeto', toolsAi: '', toolsThirdParty: '' },
          { description: 'Documentar aprendizados e insights', toolsAi: 'ChatGPT', toolsThirdParty: '' },
          { description: 'Preparar briefing do próximo projeto', toolsAi: 'ChatGPT', toolsThirdParty: '' },
        ],
      },
    ],
  },
];

export const MARKETING_CHANNELS = [
  { key: 'google_ads', name: 'Google Ads', category: 'Tráfego Pago' },
  { key: 'meta_ads', name: 'Meta Ads', category: 'Tráfego Pago' },
  { key: 'youtube_ads', name: 'YouTube Ads', category: 'Tráfego Pago' },
  { key: 'seo', name: 'SEO', category: 'Tráfego Orgânico' },
  { key: 'landing_page', name: 'Landing Page', category: 'Tráfego Orgânico' },
  { key: 'blog', name: 'Blog', category: 'Tráfego Orgânico' },
  { key: 'linkedin', name: 'LinkedIn', category: 'Tráfego Orgânico' },
  { key: 'instagram', name: 'Instagram', category: 'Tráfego Orgânico' },
  { key: 'youtube_organic', name: 'YouTube Orgânico', category: 'Tráfego Orgânico' },
  { key: 'email_marketing', name: 'E-mail Marketing (SprintHub)', category: 'E-mail Marketing' },
  { key: 'sdr', name: 'SDR (Prospecção)', category: 'Prospecção Ativa' },
  { key: 'linkedin_sales', name: 'LinkedIn Sales', category: 'Prospecção Ativa' },
];

export const STATUS_OPTIONS = [
  { value: 'planejamento', label: 'Planejamento', color: '#60B5FF' },
  { value: 'em_andamento', label: 'Em Andamento', color: '#FF9149' },
  { value: 'concluido', label: 'Concluído', color: '#80D8C3' },
  { value: 'pausado', label: 'Pausado', color: '#A19AD3' },
  { value: 'cancelado', label: 'Cancelado', color: '#FF6363' },
];

export const TASK_STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: '#A19AD3' },
  { value: 'em_andamento', label: 'Em Andamento', color: '#FF9149' },
  { value: 'concluido', label: 'Concluído', color: '#80D8C3' },
  { value: 'nao_aplicavel', label: 'Não Aplicável', color: '#FF6363' },
];
