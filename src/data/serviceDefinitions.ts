import { Service, ServiceKey } from "../types/landing";

export const serviceDefinitions: Record<ServiceKey, Service> = {
  security: {
    name: "Managed Security (MSSP)",
    icon: "🛡️",
    description:
      "Your organization needs comprehensive security operations with 24/7 SOC monitoring, threat detection, and incident response. We'll protect your infrastructure with continuous monitoring, threat intelligence, and proactive security management.",
    includes: [
      "24/7 Security Operations Center (SOC)",
      "Real-time Threat Detection & Response",
      "Vulnerability Assessment & Management",
      "Compliance Management & Reporting",
      "Security Incident Response Team",
    ],
  },
  infrastructure: {
    name: "Managed Infrastructure",
    icon: "🏗️",
    description:
      "Your organization requires robust infrastructure management with guaranteed uptime. We'll build, monitor, and optimize your entire IT infrastructure with security-first design and proactive maintenance.",
    includes: [
      "Cloud Infrastructure Management (AWS, Azure, GCP)",
      "Network Design, Monitoring & Optimization",
      "Server & Storage Management",
      "Disaster Recovery & Business Continuity",
      "Performance Monitoring & Optimization",
    ],
  },
  production: {
    name: "Studio Production Services",
    icon: "🎬",
    description:
      "Your organization needs professional video production capabilities with broadcast-quality output. We'll provide end-to-end production services from pre-production to post-production with integrated streaming infrastructure.",
    includes: [
      "Live Streaming Infrastructure",
      "Video Production & Editing",
      "Broadcast Quality Control",
      "Content Distribution",
      "Production Team Management",
    ],
  },
  applications: {
    name: "Application Management",
    icon: "⚙️",
    description:
      "Your organization requires comprehensive application lifecycle management with modern DevOps practices. We'll handle deployment, monitoring, and optimization of your applications with security-first operations.",
    includes: [
      "Application Deployment & CI/CD",
      "Container Orchestration (K8s, Docker)",
      "Application Performance Monitoring",
      "Database Management & Optimization",
      "API Gateway & Integration",
    ],
  },
  support: {
    name: "24/7 Support & Operations",
    icon: "🔄",
    description:
      "Your organization needs round-the-clock support with guaranteed response times. We'll provide comprehensive support services covering infrastructure, applications, and user support with SLA guarantees.",
    includes: [
      "24/7 Help Desk & User Support",
      "Incident Management & Resolution",
      "Change Management Process",
      "Technical Support & Troubleshooting",
      "Proactive Monitoring & Alerts",
    ],
  },
  platform: {
    name: "Unified Platform Management",
    icon: "🌐",
    description:
      "Your organization needs a unified platform to manage all services through one interface. We'll provide comprehensive platform management with integrated services, analytics, and automation.",
    includes: [
      "Unified Dashboard & Analytics",
      "Service Integration & Orchestration",
      "Automated Workflows & Policies",
      "Multi-tenant Management",
      "Platform API & Integrations",
    ],
  },
};

