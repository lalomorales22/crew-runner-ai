import { create } from 'zustand';
import { Crew, Agent, Task, CrewExecution } from '@/types';
import { db } from '@/lib/database';

interface CrewStore {
  crews: Crew[];
  currentCrew: Crew | null;
  executions: CrewExecution[];
  isLoading: boolean;
  
  // Actions
  loadCrews: () => Promise<void>;
  saveCrew: (crew: Crew) => Promise<void>;
  deleteCrew: (id: string) => Promise<void>;
  setCurrentCrew: (crew: Crew | null) => void;
  createNewCrew: () => Crew;
  duplicateCrew: (crew: Crew) => Crew;
  executeCrewFlow: (crew: Crew) => Promise<void>;
  loadExecutions: (crewId: string) => Promise<void>;
}

export const useCrewStore = create<CrewStore>((set, get) => ({
  crews: [],
  currentCrew: null,
  executions: [],
  isLoading: false,

  loadCrews: async () => {
    set({ isLoading: true });
    try {
      const crews = await db.getCrews();
      set({ crews });
    } catch (error) {
      console.error('Failed to load crews:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveCrew: async (crew: Crew) => {
    try {
      await db.saveCrewToDB(crew);
      await get().loadCrews();
    } catch (error) {
      console.error('Failed to save crew:', error);
    }
  },

  deleteCrew: async (id: string) => {
    try {
      await db.deleteCrew(id);
      await get().loadCrews();
      const { currentCrew } = get();
      if (currentCrew?.id === id) {
        set({ currentCrew: null });
      }
    } catch (error) {
      console.error('Failed to delete crew:', error);
    }
  },

  setCurrentCrew: (crew: Crew | null) => {
    set({ currentCrew: crew });
  },

  createNewCrew: () => {
    const newCrew: Crew = {
      id: crypto.randomUUID(),
      name: 'New Crew',
      description: 'A new crew ready for configuration',
      agents: [],
      tasks: [],
      process: 'sequential',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };
    return newCrew;
  },

  duplicateCrew: (crew: Crew) => {
    const duplicatedCrew: Crew = {
      ...crew,
      id: crypto.randomUUID(),
      name: `${crew.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      results: undefined
    };
    return duplicatedCrew;
  },

  executeCrewFlow: async (crew: Crew) => {
    // This would integrate with actual CrewAI execution
    // For now, we'll simulate the execution
    const execution: CrewExecution = {
      id: crypto.randomUUID(),
      crewId: crew.id,
      status: 'running',
      startedAt: new Date(),
      logs: []
    };

    await db.saveExecution(execution);
    
    // Simulate execution completion after a delay
    setTimeout(async () => {
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.results = 'Crew execution completed successfully!';
      execution.logs.push('Crew execution finished');
      
      await db.saveExecution(execution);
      await get().loadExecutions(crew.id);
    }, 3000);
  },

  loadExecutions: async (crewId: string) => {
    try {
      const executions = await db.getExecutions(crewId);
      set({ executions });
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  }
}));