export enum VentureStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface VentureTeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface VentureTask {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignedTo?: number;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SupportRequestInfo {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface Venture {
  id: number;
  name: string;
  description: string;
  status: VentureStatus;
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  deadline: string;
  team: VentureTeamMember[];
  tasks: VentureTask[];
  tags: string[];
  clientId?: number;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
  supportRequest?: SupportRequestInfo;
}

export interface VentureMetrics {
  total: number;
  active: number;
  completed: number;
  totalRevenue: number;
  totalBudget: number;
}
