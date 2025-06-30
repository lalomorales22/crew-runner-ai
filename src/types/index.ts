export interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  dependencies?: string[];
  outputFile?: string;
}

export interface Crew {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  tasks: Task[];
  process: 'sequential' | 'hierarchical' | 'parallel';
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'running' | 'completed' | 'failed';
  results?: string;
}

export interface CrewExecution {
  id: string;
  crewId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  results?: string;
  logs: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters?: Record<string, any>;
}

export interface CrewFile {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  createdAt: Date;
  crewId: string;
  taskId?: string;
}