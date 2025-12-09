import { QuizQuestion } from "../types/landing";

export const creativeQuizData: QuizQuestion[] = [
  {
    id: "current-approach",
    question: "What best describes your current creative approach?",
    subtitle: "Help us understand how you currently handle creative work",
    options: [
      {
        text: "In-house team",
        description: "We have our own creative team handling projects",
        scores: { essential: 2, growth: 3, premium: 4, enterprise: 5 },
      },
      {
        text: "Freelancers",
        description: "We work with independent freelancers and contractors",
        scores: { essential: 3, growth: 4, premium: 3, enterprise: 2 },
      },
      {
        text: "Agencies",
        description: "We partner with creative agencies for projects",
        scores: { essential: 2, growth: 3, premium: 4, enterprise: 5 },
      },
      {
        text: "DIY community",
        description: "We handle most creative work internally with limited resources",
        scores: { essential: 4, growth: 3, premium: 2, enterprise: 1 },
      },
    ],
  },
  {
    id: "creative-needs",
    question: "What are your primary creative needs?",
    subtitle: "Understanding what type of creative work you need most",
    options: [
      {
        text: "Brand Experience & UX/UI",
        description: "Branding, web design, UI/UX improvements, mobile app design",
        scores: { essential: 3, growth: 4, premium: 5, enterprise: 5 },
      },
      {
        text: "Content Creation",
        description: "Regular content assets, social media graphics, marketing materials",
        scores: { essential: 4, growth: 4, premium: 4, enterprise: 4 },
      },
      {
        text: "Front-End Development",
        description: "Landing pages, components, front-end coding and implementation",
        scores: { essential: 2, growth: 4, premium: 5, enterprise: 5 },
      },
      {
        text: "SEO & Optimization",
        description: "SEO strategy, technical SEO, content optimization",
        scores: { essential: 2, growth: 3, premium: 4, enterprise: 5 },
      },
      {
        text: "All of the above",
        description: "We need comprehensive creative support across all areas",
        scores: { essential: 2, growth: 3, premium: 4, enterprise: 5 },
      },
    ],
  },
  {
    id: "project-volume",
    question: "How many active creative projects do you typically have?",
    subtitle: "Understanding your project volume and workflow",
    options: [
      {
        text: "1-2 projects at a time",
        description: "We focus on one or two key projects",
        scores: { essential: 5, growth: 3, premium: 2, enterprise: 1 },
      },
      {
        text: "3-5 concurrent projects",
        description: "We juggle multiple projects simultaneously",
        scores: { essential: 2, growth: 5, premium: 3, enterprise: 2 },
      },
      {
        text: "6+ concurrent projects",
        description: "We have a high volume of ongoing creative work",
        scores: { essential: 1, growth: 2, premium: 5, enterprise: 4 },
      },
      {
        text: "Variable/Seasonal",
        description: "Our needs fluctuate based on campaigns or seasons",
        scores: { essential: 3, growth: 4, premium: 4, enterprise: 3 },
      },
    ],
  },
  {
    id: "turnaround-needs",
    question: "What turnaround time do you typically need?",
    subtitle: "Understanding your timeline expectations",
    options: [
      {
        text: "2-3 business days",
        description: "We can wait a few days for quality work",
        scores: { essential: 5, growth: 4, premium: 3, enterprise: 2 },
      },
      {
        text: "48-72 hours",
        description: "We need work completed within 2-3 days",
        scores: { essential: 3, growth: 5, premium: 4, enterprise: 3 },
      },
      {
        text: "24-48 hours",
        description: "We often need faster turnaround for urgent projects",
        scores: { essential: 1, growth: 2, premium: 5, enterprise: 4 },
      },
      {
        text: "Same day / Rush",
        description: "We frequently need same-day or rush delivery",
        scores: { essential: 1, growth: 1, premium: 3, enterprise: 5 },
      },
    ],
  },
  {
    id: "growth-stage",
    question: "What best describes your growth stage?",
    subtitle: "Understanding your business context and future needs",
    options: [
      {
        text: "Early-stage / Startup",
        description: "We're building our brand and need steady, reliable output",
        scores: { essential: 5, growth: 3, premium: 1, enterprise: 1 },
      },
      {
        text: "Scaling / Growing",
        description: "We're expanding and need multi-channel execution",
        scores: { essential: 2, growth: 5, premium: 3, enterprise: 2 },
      },
      {
        text: "Established / High-velocity",
        description: "We're a mature brand with high-volume creative needs",
        scores: { essential: 1, growth: 2, premium: 5, enterprise: 4 },
      },
      {
        text: "Enterprise / Multi-brand",
        description: "We manage multiple brands or complex creative pipelines",
        scores: { essential: 1, growth: 1, premium: 2, enterprise: 5 },
      },
    ],
  },
];

