import { QuizQuestion } from "../types/landing";

export const quizData: QuizQuestion[] = [
  {
    id: "business-type",
    question: "What best describes your organization?",
    subtitle: "Help us understand your business context",
    options: [
      {
        text: "Technology/Software Company",
        description: "SaaS, software development, or tech services",
        scores: { security: 3, infrastructure: 3, applications: 3, support: 2, platform: 3 },
      },
      {
        text: "Media/Creative Agency",
        description: "Video production, content creation, advertising",
        scores: { production: 5, security: 2, infrastructure: 2, applications: 2, support: 3 },
      },
      {
        text: "Enterprise/Corporate",
        description: "Large organization with diverse IT needs",
        scores: { infrastructure: 4, security: 4, applications: 3, support: 4, platform: 3 },
      },
      {
        text: "Healthcare/Finance",
        description: "Regulated industry with compliance requirements",
        scores: { security: 5, infrastructure: 3, applications: 3, support: 4, platform: 2 },
      },
      {
        text: "Startup/Small Business",
        description: "Growing company building infrastructure",
        scores: { infrastructure: 3, applications: 2, support: 3, platform: 3, security: 2 },
      },
    ],
  },
  {
    id: "security-priority",
    question: "What's your biggest security concern?",
    subtitle: "Understanding your security priorities helps us tailor our recommendations",
    options: [
      {
        text: "Compliance & Regulatory Requirements",
        description: "We need to meet industry-specific compliance standards",
        scores: { security: 5, infrastructure: 2, support: 3, platform: 2 },
      },
      {
        text: "Threat Detection & Response",
        description: "We need proactive monitoring and rapid incident response",
        scores: { security: 4, support: 3, infrastructure: 2 },
      },
      {
        text: "Vulnerability Management",
        description: "We need continuous assessment and patch management",
        scores: { security: 3, applications: 2, support: 2 },
      },
      {
        text: "Basic Security Hygiene",
        description: "We want foundational security measures in place",
        scores: { security: 2, infrastructure: 2 },
      },
      {
        text: "Not a Primary Concern",
        description: "Security is handled by other teams or tools",
        scores: { infrastructure: 1, applications: 1, support: 1 },
      },
    ],
  },
  {
    id: "infrastructure-scale",
    question: "What's your infrastructure footprint?",
    subtitle: "Help us understand the scale of your infrastructure needs",
    options: [
      {
        text: "Enterprise Cloud",
        description: "Multiple cloud providers, hybrid infrastructure",
        scores: { infrastructure: 5, platform: 4, applications: 3, support: 4 },
      },
      {
        text: "Growing Cloud Environment",
        description: "Single or multi-cloud with expanding workloads",
        scores: { infrastructure: 4, applications: 3, platform: 3, support: 3 },
      },
      {
        text: "Standard Cloud Setup",
        description: "Typical cloud infrastructure for our size",
        scores: { infrastructure: 3, applications: 2, support: 3 },
      },
      {
        text: "Hybrid Environment",
        description: "Mix of on-premises and cloud infrastructure",
        scores: { infrastructure: 4, support: 3, security: 3 },
      },
      {
        text: "Minimal Infrastructure",
        description: "Lightweight setup with basic hosting needs",
        scores: { support: 2, infrastructure: 2 },
      },
    ],
  },
  {
    id: "production-needs",
    question: "Do you have video or content production needs?",
    subtitle: "Understanding if you need professional production services",
    options: [
      {
        text: "High-Volume Production",
        description: "Regular content creation with broadcast quality requirements",
        scores: { production: 5, infrastructure: 3, support: 3 },
      },
      {
        text: "Live Streaming",
        description: "Frequent live events or broadcasts",
        scores: { production: 4, infrastructure: 3, applications: 2, support: 2 },
      },
      {
        text: "Occasional Production",
        description: "Periodic video production or content creation",
        scores: { production: 2, infrastructure: 1 },
      },
      {
        text: "No Production Needs",
        description: "We don't need video or content production services",
        scores: { security: 1, infrastructure: 1 },
      },
    ],
  },
  {
    id: "support-urgency",
    question: "What level of support do you need?",
    subtitle: "Understanding your support expectations and requirements",
    options: [
      {
        text: "24/7 Critical Support",
        description: "Round-the-clock support with guaranteed response times",
        scores: { support: 5, security: 3, infrastructure: 3 },
      },
      {
        text: "Business Hours Plus After-Hours",
        description: "Extended hours with coverage for urgent issues",
        scores: { support: 4, infrastructure: 2 },
      },
      {
        text: "Standard Business Hours",
        description: "Support during typical business hours",
        scores: { support: 2, applications: 1 },
      },
      {
        text: "Self-Service",
        description: "We prefer self-service with occasional assistance",
        scores: { platform: 2, applications: 1 },
      },
      {
        text: "Project-Based Support",
        description: "Support for specific projects or initiatives",
        scores: { infrastructure: 1, applications: 1, support: 1 },
      },
    ],
  },
];

