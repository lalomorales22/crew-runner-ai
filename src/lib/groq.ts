import Groq from 'groq-sdk';
import { Agent, Task } from '@/types';

class GroqService {
  private client: Groq | null = null;
  private lastRequestTime = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor() {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (apiKey) {
      this.client = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  private async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      // Wait at least 2 seconds between requests to avoid rate limits
      if (timeSinceLastRequest < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastRequest));
      }
      
      const request = this.requestQueue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        try {
          await request();
        } catch (error) {
          console.error('Request failed:', error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  private extractJSON(text: string): any {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        // If that fails, try to clean up common issues
        let cleanedText = jsonMatch[0]
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/^\s*```\s*/, '')
          .replace(/\s*```\s*$/, '')
          .trim();
        
        return JSON.parse(cleanedText);
      }
    }
    
    // If no JSON found, try parsing the entire response
    return JSON.parse(text);
  }

  async generateCrewFromDescription(description: string) {
    if (!this.client) {
      throw new Error('Groq API key not configured');
    }

    const prompt = `Create a crew config for: "${description}"

JSON only:
{
  "name": "Crew Name",
  "description": "Brief description", 
  "agents": [
    {
      "name": "Agent Name",
      "role": "Role",
      "goal": "Goal",
      "backstory": "Background",
      "tools": ["tool1", "tool2"]
    }
  ],
  "tasks": [
    {
      "name": "Task Name",
      "description": "What to do", 
      "expectedOutput": "Expected result",
      "agentId": "0"
    }
  ],
  "process": "sequential"
}

Create 2-3 agents, 3-4 tasks. Tools: web_search, file_reader, code_analyzer, data_processor, content_writer, research_tool.`;

    return this.rateLimitedRequest(async () => {
      try {
        // Try with faster model first
        const completion = await this.client!.chat.completions.create({
          model: "llama-3.1-8b-instant", // Faster, cheaper model
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1024, // Reduced tokens
          top_p: 0.9
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) throw new Error('No response from Groq');

        return this.extractJSON(response);
      } catch (error) {
        console.error('Fast model failed, trying fallback:', error);
        
        // Fallback to original model with retry logic
        if (error.message?.includes('rate_limit_exceeded')) {
          const waitTime = this.extractWaitTime(error.message) || 7000;
          console.log(`Rate limited, waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        try {
          const completion = await this.client!.chat.completions.create({
            model: "qwen-qwq-32b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 800, // Much smaller token limit
            top_p: 0.9
          });

          const response = completion.choices[0]?.message?.content;
          if (!response) throw new Error('No response from Groq');

          return this.extractJSON(response);
        } catch (secondError) {
          console.error('Both models failed, using fallback crew');
          return this.createFallbackCrew(description);
        }
      }
    });
  }

  private extractWaitTime(errorMessage: string): number | null {
    const match = errorMessage.match(/try again in ([\d.]+)s/);
    return match ? Math.ceil(parseFloat(match[1]) * 1000) : null;
  }

  private createFallbackCrew(description: string) {
    return {
      name: "Generated Crew",
      description: description,
      agents: [
        {
          name: "Research Agent",
          role: "Researcher", 
          goal: "Research and gather information",
          backstory: "Expert researcher with strong analytical skills",
          tools: ["web_search", "research_tool"]
        },
        {
          name: "Content Agent",
          role: "Content Creator",
          goal: "Create and organize content",
          backstory: "Skilled content creator and organizer",
          tools: ["content_writer", "file_reader"]
        }
      ],
      tasks: [
        {
          name: "Research Task",
          description: "Research the topic and gather key information",
          expectedOutput: "Research summary with key findings",
          agentId: "0"
        },
        {
          name: "Content Task", 
          description: "Create content based on research",
          expectedOutput: "Well-structured content document",
          agentId: "1"
        }
      ],
      process: "sequential"
    };
  }

  async executeAgentTask(agent: Agent, task: Task, context: string = '') {
    if (!this.client) {
      throw new Error('Groq API key not configured');
    }

    // Create a more specific prompt that asks for actual results, not implementation
    const prompt = this.createTaskExecutionPrompt(agent, task, context);

    return this.rateLimitedRequest(async () => {
      try {
        // Use faster model for execution
        const completion = await this.client!.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 512, // Much smaller for execution
          top_p: 0.95,
          stream: true
        });

        return completion;
      } catch (error) {
        if (error.message?.includes('rate_limit_exceeded')) {
          const waitTime = this.extractWaitTime(error.message) || 7000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Retry with original model but smaller tokens
          const completion = await this.client!.chat.completions.create({
            model: "qwen-qwq-32b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.6,
            max_tokens: 256, // Very small token limit
            top_p: 0.95,
            stream: true
          });

          return completion;
        }
        throw error;
      }
    });
  }

  private createTaskExecutionPrompt(agent: Agent, task: Task, context: string): string {
    // Create task-specific prompts that ask for actual results
    const basePrompt = `You are ${agent.name}, a ${agent.role}.
Your goal: ${agent.goal}
Your background: ${agent.backstory}

IMPORTANT: Provide actual results, not code or implementation details.

Task: ${task.description}
Expected Output: ${task.expectedOutput}
${context ? `Previous Context: ${context.slice(0, 200)}...` : ''}

`;

    // Customize prompt based on task type and agent role
    if (task.name.toLowerCase().includes('search') || task.name.toLowerCase().includes('find')) {
      return basePrompt + `Provide a list of actual findings, results, or discoveries. Do not provide code or instructions on how to search.

Example format:
# Search Results

1. **Item 1 Name**
   - Description: Brief description
   - Key details: Important information
   - Link/Source: Where found

2. **Item 2 Name**
   - Description: Brief description
   - Key details: Important information
   - Link/Source: Where found

Provide actual results:`;
    }

    if (task.name.toLowerCase().includes('analyze') || task.name.toLowerCase().includes('analysis')) {
      return basePrompt + `Provide actual analysis results and insights. Do not provide code or instructions on how to analyze.

Example format:
# Analysis Results

## Key Findings
- Finding 1: Detailed insight
- Finding 2: Detailed insight
- Finding 3: Detailed insight

## Summary
Brief summary of the analysis results.

## Recommendations
- Recommendation 1
- Recommendation 2

Provide actual analysis:`;
    }

    if (task.name.toLowerCase().includes('summary') || task.name.toLowerCase().includes('report')) {
      return basePrompt + `Create an actual summary or report document. Do not provide code or instructions.

Example format:
# ${task.name}

## Executive Summary
Brief overview of key points.

## Main Content
Detailed information organized in sections.

## Conclusions
Key takeaways and conclusions.

Create the actual document:`;
    }

    // Default prompt for other tasks
    return basePrompt + `Complete this task and provide the actual deliverable. Do not provide code, implementation details, or instructions.

Provide the actual result that fulfills the expected output:`;
  }

  async improveCrewConfiguration(crew: any, feedback: string) {
    if (!this.client) {
      throw new Error('Groq API key not configured');
    }

    const prompt = `Improve crew based on: "${feedback}"
Current: ${JSON.stringify(crew, null, 2).slice(0, 500)}...
Return improved JSON only.`;

    return this.rateLimitedRequest(async () => {
      try {
        const completion = await this.client!.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 800,
          top_p: 0.9
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) throw new Error('No response from Groq');

        return this.extractJSON(response);
      } catch (error) {
        console.error('Improvement failed:', error);
        return crew; // Return original if improvement fails
      }
    });
  }
}

export const groqService = new GroqService();