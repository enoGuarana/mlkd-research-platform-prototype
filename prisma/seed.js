const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const currentMembers = [
  ["Arlindo Oliveira", "Group Leader"],
  ["R. Barbulescu", "PostDoc Researcher"],
  ["David Calhas", "PostDoc Researcher"],
  ["João Silva", "Invited Researcher"],
  ["Alexandre Borges", "Invited Researcher"],
  ["Miguel Freire", "Invited Researcher"],
  ["Gonçalo Oliveira", "Invited Researcher"],
  ["Manuel Goulão", "invited researcher"],
  ["Guilherme Costa", "Invited Researcher"],
  ["Beatriz Vieira", "phd Student"],
  ["André Duarte", "PHD Student"],
  ["João Marques", "PHD Student"],
  ["Inês Duarte", "PHD Student"],
  ["Duarte Boto", "PHD Student"],
  ["Helder Dias", "PHD Student"],
  ["Francisco Guedes", "PHD Student"],
  ["Vitória Cruz", "PHD Student"],
  ["Dominika Dlugosz", "PhD Student"],
  ["Lucas Piper", "Researcher"],
  ["João Amoroso", "Student"],
  ["João Meneses", "Student"],
  ["João Teixeira", "Student"],
  ["João Cardoso", "Student"],
  ["Clara Pereira", "Student"],
  ["Ricardo Almeida", "Student"],
];

const pastMembers = [
  "Mariana Serrão",
  "Miguel Vicente",
  "Gonçalo Oliveira",
  "José Carreira",
  "Tomás Nunes",
  "Vincente Silvestre",
  "Pedro Henriques",
  "Francisco Honório",
  "José Cunha",
  "Miguel Ferreira",
  "Martim Afonso",
  "Ana Alves",
  "Miguel Amaral",
  "João Novo",
  "Lourenço Tourais",
  "Manuel Coimbra",
  "Tiago Oliveira",
  "André Leite",
  "Oleksander S.",
  "José Martinho",
  "José Pereira",
  "António Pereira",
  "João Pedro",
  "Rafael Pedro",
  "Ricardo Diniz",
  "Filipa Marques",
  "Dinis Rodrigues",
  "André Veríssimo",
  "Pedro Gonçalves",
  "André Cavalheiro",
  "Xavier Dias",
  "Miguel Monteiro",
];

const projects = [
  ["PRELUNA", "active", "Arlindo Manuel Limede de Oliveira", "From 2022 to 2024", "FCT"],
  ["INTAKE", "active", "Arlindo Manuel Limede de Oliveira", "From 2020 to 2021", "FCT"],
  ["DeepPathCOVIDx", "active", "Arlindo Manuel Limede de Oliveira", "From 2020 to 2021", "Agência Nacional de Inovação"],
  ["OLISSIPO", "active", "Susana de Almeida Mendes Vinga Martins", "From 2021 to 2023", "Horizon 2020"],
  ["NEURONREDUCE", "active", "Luis Miguel Teixeira D Avila Pinto da Silveira", "From 2018 to 2022", "FCT"],
  ["ILU", "active", "Rui Miguel Carrasqueiro Henriques", "From 2019 to 2022", "FCT"],
  ["PRECISE", "past", "Alexandre Paulo Lourenço Francisco", "From 2016 to 2019", "FCT"],
  ["EXCELERATE", "past", "Mário Jorge Costa Gaspar da Silva", "From 2015 to 2019", "EU"],
  ["BioData", "past", "Arlindo Manuel Limede de Oliveira", "From 2017 to 2021", "P2020"],
];

const events = [
  ["Reading Group Meeting", "Sep 9, 2025", "Deep Feedback Models", "David Calhas"],
  ["Reading Group Meeting", "Jul 1, 2025", "Brain Mapping with Dense Features Grounding Cortical Semantic Selectivity in Natural Images With Vision Transformers", "Francisco Guedes"],
  ["Reading Group Meeting", "Jun 24, 2025", "Visual-RFT: Visual Reinforcement Fine-Tuning", "João Silva"],
  ["Reading Group Meeting", "May 27, 2025", "A Conformal Risk Control Framework for Granular Word Assessment and Uncertainty Calibration of CLIPScore Quality Estimates", "Gonçalo Gomes"],
  ["Reading Group Meeting", "May 13, 2025", "Refining Knowledge Distillation for Effective and Efficient Passage Retrieval", "Luís Borges"],
  ["Reading Group Meeting", "Apr 29, 2025", "Circuit Tracing: Revealing Computational Graphs in Language Models", "João Cardoso"],
  ["Reading Group Meeting", "Feb 4, 2025", "DIS-CO: Discovering Copyrighted Content in VLMs Training Data", "André Duarte"],
  ["Cluster Usage Guide", "March 28, 2023", "Cluster Usage Guide", "João Silva and Manuel Goulão"],
];

const dissertations = [
  ["New Dissertations", "new", "Dissertations open for application."],
  ["Ongoing Dissertations", "ongoing", "Dissertations currently being developed by the group."],
  ["Finished Dissertations", "finished", "Completed MSc work produced by the group."],
];

const openPositions = [
  ["Dissertation topics", "msc", "Explore open dissertation themes connected to MLKD research areas."],
  ["Doctoral research", "phd", "Contact the group to discuss doctoral work in machine learning and its applications."],
  ["Research collaborations", "collaboration", "Industry and academic partners can connect around applied AI, NLP, vision and medical AI."],
];

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function categoryFromRole(role) {
  const normalized = role.toLowerCase();
  if (normalized.includes("group")) return "group_leader";
  if (normalized.includes("postdoc")) return "postdoc";
  if (normalized.includes("invited")) return "invited_researcher";
  if (normalized.includes("phd")) return "phd_student";
  if (normalized.includes("student")) return "student";
  return "researcher";
}

async function seedMembers() {
  for (const [index, [name, role]] of currentMembers.entries()) {
    await prisma.member.upsert({
      where: { id: `seed-current-${index}` },
      update: {},
      create: {
        id: `seed-current-${index}`,
        name,
        role,
        status: "current",
        category: categoryFromRole(role),
        initials: initials(name),
        sortOrder: index,
      },
    });
  }

  for (const [index, name] of pastMembers.entries()) {
    await prisma.member.upsert({
      where: { id: `seed-past-${index}` },
      update: {},
      create: {
        id: `seed-past-${index}`,
        name,
        role: "Alumni",
        status: "past",
        category: "alumni",
        initials: initials(name),
        sortOrder: index,
      },
    });
  }
}

async function main() {
  await seedMembers();

  for (const [index, [title, status, lead, period, funder]] of projects.entries()) {
    await prisma.project.upsert({
      where: { id: `seed-project-${index}` },
      update: {},
      create: { id: `seed-project-${index}`, title, status, lead, period, funder, sortOrder: index },
    });
  }

  for (const [index, [type, date, title, presenter]] of events.entries()) {
    await prisma.event.upsert({
      where: { id: `seed-event-${index}` },
      update: {},
      create: { id: `seed-event-${index}`, type, date, title, presenter, sortOrder: index },
    });
  }

  for (const [index, [title, status, description]] of dissertations.entries()) {
    await prisma.dissertation.upsert({
      where: { id: `seed-dissertation-${index}` },
      update: {},
      create: { id: `seed-dissertation-${index}`, title, status, description, sortOrder: index },
    });
  }

  for (const [index, [title, type, description]] of openPositions.entries()) {
    await prisma.openPosition.upsert({
      where: { id: `seed-position-${index}` },
      update: {},
      create: { id: `seed-position-${index}`, title, type, description, sortOrder: index },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
