export const publications = [
  {
    title: "Leveraging LLMs to Streamline the Review of Public Funding Applications",
    authors: "Joao D.S. Marques, Andre V. Duarte, Andre Carvalho, Gil Rocha, Bruno Martins, Arlindo L. Oliveira",
    year: "2025",
    venue: "EMNLP Industry Track",
    topic: "responsible",
    topicLabel: "Responsible AI",
    abstract:
      "A real-world deployment of AI-assisted evaluation for government funding initiatives, reducing workload and improving reviewer productivity.",
    accessible:
      "This paper shows how AI can help public agencies review large volumes of applications faster while keeping human oversight in the loop.",
    industry:
      "Useful for organizations that process high-volume applications, reimbursements or compliance-heavy forms.",
    social:
      "MLKD research explores how LLMs can reduce public-sector review bottlenecks while preserving careful evaluation.",
  },
  {
    title: "CountPath: Automating Fragment Counting in Digital Pathology",
    authors: "Ana Beatriz Vieira, Maria Valente, Diana Montezuma, Tome Albuquerque, Liliana Ribeiro, Arlindo L. Oliveira",
    year: "2025",
    venue: "IEEE BHI",
    topic: "medical",
    topicLabel: "Medical AI",
    abstract:
      "An automated approach for fragment counting in digital pathology using YOLOv9 and Vision Transformer models.",
    accessible:
      "The work helps quality-control pathology images by checking whether slide fragments match the clinical report.",
    industry:
      "Relevant for hospitals, pathology labs and digital health companies looking to automate repetitive visual checks.",
    social:
      "CountPath brings computer vision into digital pathology quality control, matching expert-level fragment counting ranges.",
  },
  {
    title: "DIS-CO: Discovering Copyrighted Content in VLMs Training Data",
    authors: "Andre V. Duarte, Xuandong Zhao, Arlindo L. Oliveira, Lei Li",
    year: "2025",
    venue: "ICML",
    topic: "vision",
    topicLabel: "Vision and multimodal",
    abstract:
      "A method to infer whether copyrighted visual content may have been included in vision-language model training data.",
    accessible:
      "The paper asks whether a model can reveal if it has seen protected visual material during training.",
    industry:
      "Important for AI governance, model audits, media rights, compliance and trustworthy multimodal systems.",
    social:
      "DIS-CO investigates whether vision-language models expose clues about copyrighted content in their training data.",
  },
  {
    title: "Are ECGs enough? Deep learning classification of pulmonary embolism using electrocardiograms",
    authors: "Joao D.S. Marques, Arlindo L. Oliveira",
    year: "2025",
    venue: "MICCAI MIRASOL",
    topic: "medical",
    topicLabel: "Medical AI",
    abstract:
      "A study of deep learning methods for pulmonary embolism classification from ECG signals and transfer learning.",
    accessible:
      "The research studies whether affordable ECG data can support faster screening for pulmonary embolism.",
    industry:
      "Relevant for emergency care, remote diagnostics and decision-support systems where advanced imaging is not always available.",
    social:
      "Can ECG-based deep learning help screen for pulmonary embolism when CT imaging is limited?",
  },
  {
    title: "Lumberchunker: Long-form narrative document segmentation",
    authors: "Andre V. Duarte, Joao Marques, M. Graca, Miguel Freire, Lei Li, Arlindo L. Oliveira",
    year: "2024",
    venue: "EMNLP Findings",
    topic: "nlp",
    topicLabel: "NLP and retrieval",
    abstract:
      "An LLM-based method for segmenting long documents into semantically independent chunks for retrieval pipelines.",
    accessible:
      "The method cuts long documents into meaningful pieces so search and question-answering systems can retrieve better context.",
    industry:
      "Useful for legal, literary, research and enterprise document search systems built on retrieval-augmented generation.",
    social:
      "Lumberchunker improves long-document retrieval by asking an LLM where the meaning actually shifts.",
  },
  {
    title: "Artificial Intelligence: Historical Context and State of the Art",
    authors: "Arlindo L. Oliveira, Mario A.T. Figueiredo",
    year: "2023",
    venue: "Multidisciplinary Perspectives on Artificial Intelligence and the Law",
    topic: "responsible",
    topicLabel: "Responsible AI",
    abstract:
      "A historical overview of artificial intelligence, from early symbolic ideas to modern machine learning and deep learning.",
    accessible:
      "This chapter explains how AI evolved and why machine learning became central to modern intelligent systems.",
    industry:
      "Helpful background for policy, education, strategy and interdisciplinary AI programs.",
    social:
      "A clear bridge from AI history to current technical and social debates.",
  },
];

export const people = [
  {
    initials: "AO",
    name: "Arlindo Oliveira",
    role: "Group Leader",
    tags: ["AI systems", "Computational biology"],
  },
  {
    initials: "AV",
    name: "Andre V. Duarte",
    role: "PhD Student",
    tags: ["Copyright detection", "LLMs"],
  },
  {
    initials: "JM",
    name: "Joao D.S. Marques",
    role: "PhD Student",
    tags: ["Medical AI", "Public sector AI"],
  },
  {
    initials: "BV",
    name: "Beatriz Vieira",
    role: "PhD Student",
    tags: ["Digital pathology", "Computer vision"],
  },
];

export const currentMembers = [
  { initials: "AO", name: "Arlindo Oliveira", role: "Group Leader" },
  { initials: "RB", name: "R. Barbulescu", role: "PostDoc Researcher" },
  { initials: "DC", name: "David Calhas", role: "PostDoc Researcher" },
  { initials: "JS", name: "Joao Silva", role: "Invited Researcher" },
  { initials: "AB", name: "Alexandre Borges", role: "Invited Researcher" },
  { initials: "MF", name: "Miguel Freire", role: "Invited Researcher" },
  { initials: "BV", name: "Beatriz Vieira", role: "PhD Student" },
  { initials: "AD", name: "Andre Duarte", role: "PhD Student" },
  { initials: "JM", name: "Joao Marques", role: "PhD Student" },
  { initials: "ID", name: "Ines Duarte", role: "PhD Student" },
  { initials: "DB", name: "Duarte Boto", role: "PhD Student" },
  { initials: "HD", name: "Helder Dias", role: "PhD Student" },
  { initials: "FG", name: "Francisco Guedes", role: "PhD Student" },
  { initials: "VC", name: "Vitoria Cruz", role: "PhD Student" },
  { initials: "DD", name: "Dominika Dlugosz", role: "PhD Student" },
  { initials: "LP", name: "Lucas Piper", role: "Researcher" },
];

export const pastMembers = [
  "Mariana Serrao",
  "Miguel Vicente",
  "Goncalo Oliveira",
  "Jose Carreira",
  "Tomas Nunes",
  "Pedro Henriques",
  "Francisco Honorio",
  "Jose Cunha",
  "Miguel Ferreira",
  "Martim Afonso",
  "Ana Alves",
  "Miguel Amaral",
];

export const researchAreas = [
  {
    title: "Medical AI",
    description: "Digital pathology, ECG, stroke prognosis and clinical imaging workflows.",
  },
  {
    title: "NLP and retrieval",
    description: "Long document segmentation, address matching, RAG and language systems.",
  },
  {
    title: "Vision and multimodal AI",
    description: "Segmentation, copyrighted content detection and visual-language models.",
  },
  {
    title: "Responsible AI",
    description: "AI and law, transparency, public funding evaluation and real deployment.",
  },
  {
    title: "Computational biology",
    description: "Gene expression, motifs, biclustering and biological data mining.",
  },
];

export const projects = [
  {
    title: "PRELUNA",
    status: "Active project",
    lead: "Arlindo Manuel Limede de Oliveira",
    period: "2022 to 2024",
    funder: "FCT",
  },
  {
    title: "OLISSIPO",
    status: "Active project",
    lead: "Susana de Almeida Mendes Vinga Martins",
    period: "2021 to 2023",
    funder: "Horizon 2020",
  },
  {
    title: "NEURONREDUCE",
    status: "Active project",
    lead: "Luis Miguel Teixeira D Avila Pinto da Silveira",
    period: "2018 to 2022",
    funder: "FCT",
  },
  {
    title: "PRECISE",
    status: "Past project",
    lead: "Alexandre Paulo Lourenco Francisco",
    period: "2016 to 2019",
    funder: "FCT",
  },
  {
    title: "EXCELERATE",
    status: "Past project",
    lead: "Mario Jorge Costa Gaspar da Silva",
    period: "2015 to 2019",
    funder: "EU",
  },
  {
    title: "BioData",
    status: "Past project",
    lead: "Arlindo Manuel Limede de Oliveira",
    period: "2017 to 2021",
    funder: "P2020",
  },
];

export const dissertationGroups = [
  {
    label: "New Dissertations",
    description: "Dissertations open for application.",
  },
  {
    label: "Ongoing Dissertations",
    description: "Dissertations currently being developed by the group.",
  },
  {
    label: "Finished Dissertations",
    description: "Completed MSc work produced by the group.",
  },
];

export const events = [
  {
    type: "Reading Group Meeting",
    date: "Sep 9, 2025",
    title: "Deep Feedback Models",
    presenter: "David Calhas",
  },
  {
    type: "Reading Group Meeting",
    date: "Jul 1, 2025",
    title: "Brain Mapping with Dense Features Grounding Cortical Semantic Selectivity in Natural Images With Vision Transformers",
    presenter: "Francisco Guedes",
  },
  {
    type: "Reading Group Meeting",
    date: "Jun 24, 2025",
    title: "Visual-RFT: Visual Reinforcement Fine-Tuning",
    presenter: "Joao Silva",
  },
  {
    type: "Reading Group Meeting",
    date: "May 27, 2025",
    title: "A Conformal Risk Control Framework for Granular Word Assessment and Uncertainty Calibration",
    presenter: "Goncalo Gomes",
  },
  {
    type: "Reading Group Meeting",
    date: "Feb 4, 2025",
    title: "DIS-CO: Discovering Copyrighted Content in VLMs Training Data",
    presenter: "Andre Duarte",
  },
  {
    type: "Cluster Usage Guide",
    date: "Mar 28, 2023",
    title: "Cluster Usage Guide",
    presenter: "Joao Silva and Manuel Goulao",
  },
];

export const opportunities = [
  {
    label: "Thesis topic",
    title: "AI for medical workflow automation",
    description: "Explore robust models for clinical imaging and document-heavy health processes.",
  },
  {
    label: "Research challenge",
    title: "Semantic map of MLKD publications",
    description: "Cluster topics over time and expose them through an interactive graph.",
  },
  {
    label: "Collaboration",
    title: "Industry-facing research briefs",
    description: "Transform technical papers into short summaries for partners and grants.",
  },
];

export const openPositions = [
  {
    label: "MSc dissertations",
    title: "Dissertation topics",
    description: "Explore open dissertation themes connected to MLKD research areas.",
  },
  {
    label: "PhD opportunities",
    title: "Doctoral research",
    description: "Contact the group to discuss doctoral work in machine learning and its applications.",
  },
  {
    label: "Collaborations",
    title: "Research collaborations",
    description: "Industry and academic partners can connect around applied AI, NLP, vision and medical AI.",
  },
];
