export type ServiceKey =
  | "security"
  | "infrastructure"
  | "production"
  | "applications"
  | "support"
  | "platform";

export interface Service {
  name: string;
  icon: string;
  description: string;
  includes: string[];
}

export interface QuizOption {
  text: string;
  description: string;
  scores: Partial<Record<ServiceKey, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

export interface ServiceScore extends Service {
  key: ServiceKey;
  score: number;
}

