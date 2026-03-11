import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const companies = [
  { name: 'HIGRA Industrial', projectsPerYear: 12, frequency: '1 por mês' },
  { name: 'HIGRA Systems', projectsPerYear: 12, frequency: '1 por mês' },
  { name: 'HIGRA Customer Service', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'HIGRA Service Sul', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'HIGRA Motors', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'HIGRA Mining', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
  { name: 'Voltson Brasil', projectsPerYear: 6, frequency: '1 a cada 2 meses' },
];

const resources = [
  // Ferramentas de IA
  { name: 'ChatGPT Enterprise', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'ChatGPT', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'Perplexity', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'Midjourney', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'Runway', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'AdCreative.ai', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'SurferSEO', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'SEMrush', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'Hotjar', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'Looker Studio', category: 'Ferramenta IA', color: '#9b59b6' },
  { name: 'Canva', category: 'Ferramenta IA', color: '#9b59b6' },
  // Ferramentas de Terceiros / Plataformas
  { name: 'WordPress', category: 'Plataforma', color: '#3498db' },
  { name: 'Desenvolvedor WP se necessário', category: 'Recurso Humano', color: '#e67e22' },
  { name: 'Revisão técnica interna', category: 'Recurso Humano', color: '#e67e22' },
  { name: 'Revisão técnica interna (Engenharia)', category: 'Recurso Humano', color: '#e67e22' },
  { name: 'Design interno', category: 'Recurso Humano', color: '#e67e22' },
  { name: 'Videomaker interno', category: 'Recurso Humano', color: '#e67e22' },
  { name: 'Terceiro especializado', category: 'Recurso Humano', color: '#e67e22' },
  { name: 'Especialista Google se CPC alto', category: 'Recurso Humano', color: '#e67e22' },
  // Plataformas de Ads e Marketing
  { name: 'Google Ads', category: 'Plataforma', color: '#3498db' },
  { name: 'Meta Ads', category: 'Plataforma', color: '#3498db' },
  { name: 'YouTube Ads', category: 'Plataforma', color: '#3498db' },
  { name: 'SprintHub', category: 'Plataforma', color: '#3498db' },
  { name: 'Google Analytics', category: 'Plataforma', color: '#3498db' },
  // CRM e Prospecção
  { name: 'Apollo', category: 'CRM/Prospecção', color: '#1abc9c' },
  { name: 'Sales Navigator', category: 'CRM/Prospecção', color: '#1abc9c' },
  { name: 'LinkedIn', category: 'CRM/Prospecção', color: '#1abc9c' },
  { name: 'CRM', category: 'CRM/Prospecção', color: '#1abc9c' },
];

async function main() {
  console.log('Seeding companies...');
  for (const company of companies) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: company,
      create: company,
    });
  }
  console.log('Seeded 7 companies successfully.');

  console.log('Seeding resources...');
  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { name: resource.name },
      update: resource,
      create: resource,
    });
  }
  console.log(`Seeded ${resources.length} resources successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
