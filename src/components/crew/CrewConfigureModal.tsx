import { useState } from 'react';
import { Crew, Agent, Task } from '@/types';
import { useCrewStore } from '@/store/useCrewStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Save, 
  Users, 
  ListTodo, 
  Settings,
  Bot,
  Target,
  Wrench
} from 'lucide-react';

interface CrewConfigureModalProps {
  crew: Crew;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrewConfigureModal({ crew, open, onOpenChange }: CrewConfigureModalProps) {
  const { saveCrew, setCurrentCrew } = useCrewStore();
  const [editingCrew, setEditingCrew] = useState<Crew>(crew);
  const [activeTab, setActiveTab] = useState<'basic' | 'agents' | 'tasks'>('basic');

  const preBuiltTools = [
    'web_search', 'file_reader', 'code_analyzer', 'data_processor',
    'content_writer', 'research_tool', 'email_sender', 'calculator',
    'text_summarizer', 'json_parser', 'api_caller', 'database_query',
    'image_generator', 'pdf_reader', 'csv_processor', 'markdown_writer'
  ];

  const handleSave = async () => {
    try {
      const updatedCrew = {
        ...editingCrew,
        updatedAt: new Date()
      };
      
      await saveCrew(updatedCrew);
      setCurrentCrew(updatedCrew);
      toast.success('Crew configuration saved!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save crew configuration');
    }
  };

  const addAgent = () => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: 'New Agent',
      role: 'Assistant',
      goal: 'Help with tasks',
      backstory: 'A helpful AI assistant',
      tools: []
    };
    
    setEditingCrew({
      ...editingCrew,
      agents: [...editingCrew.agents, newAgent]
    });
  };

  const updateAgent = (index: number, updates: Partial<Agent>) => {
    const updatedAgents = editingCrew.agents.map((agent, i) => 
      i === index ? { ...agent, ...updates } : agent
    );
    setEditingCrew({ ...editingCrew, agents: updatedAgents });
  };

  const removeAgent = (index: number) => {
    const updatedAgents = editingCrew.agents.filter((_, i) => i !== index);
    setEditingCrew({ ...editingCrew, agents: updatedAgents });
  };

  const addTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: 'New Task',
      description: 'Task description',
      expectedOutput: 'Expected output format',
      agentId: editingCrew.agents[0]?.name || 'Unknown'
    };
    
    setEditingCrew({
      ...editingCrew,
      tasks: [...editingCrew.tasks, newTask]
    });
  };

  const updateTask = (index: number, updates: Partial<Task>) => {
    const updatedTasks = editingCrew.tasks.map((task, i) => 
      i === index ? { ...task, ...updates } : task
    );
    setEditingCrew({ ...editingCrew, tasks: updatedTasks });
  };

  const removeTask = (index: number) => {
    const updatedTasks = editingCrew.tasks.filter((_, i) => i !== index);
    setEditingCrew({ ...editingCrew, tasks: updatedTasks });
  };

  const toggleTool = (agentIndex: number, tool: string) => {
    const agent = editingCrew.agents[agentIndex];
    const hasTools = agent.tools.includes(tool);
    const updatedTools = hasTools 
      ? agent.tools.filter(t => t !== tool)
      : [...agent.tools, tool];
    
    updateAgent(agentIndex, { tools: updatedTools });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 gap-0">
        {/* Fixed Header */}
        <div className="p-6 border-b border-border bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure Crew: {editingCrew.name}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b border-border mt-4 -mb-px">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'basic' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bot className="h-4 w-4 inline mr-2" />
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'agents' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Agents ({editingCrew.agents.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListTodo className="h-4 w-4 inline mr-2" />
              Tasks ({editingCrew.tasks.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="crew-name">Crew Name</Label>
                    <Input
                      id="crew-name"
                      value={editingCrew.name}
                      onChange={(e) => setEditingCrew({ ...editingCrew, name: e.target.value })}
                      placeholder="Enter crew name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crew-description">Description</Label>
                    <Textarea
                      id="crew-description"
                      value={editingCrew.description}
                      onChange={(e) => setEditingCrew({ ...editingCrew, description: e.target.value })}
                      placeholder="Describe what this crew does"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="crew-process">Process Type</Label>
                    <Select
                      value={editingCrew.process}
                      onValueChange={(value: 'sequential' | 'hierarchical' | 'parallel') => 
                        setEditingCrew({ ...editingCrew, process: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="hierarchical">Hierarchical</SelectItem>
                        <SelectItem value="parallel">Parallel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Agents</h3>
                  <Button onClick={addAgent} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Agent
                  </Button>
                </div>

                <div className="space-y-4">
                  {editingCrew.agents.map((agent, index) => (
                    <Card key={agent.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            Agent {index + 1}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAgent(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={agent.name}
                              onChange={(e) => updateAgent(index, { name: e.target.value })}
                              placeholder="Agent name"
                            />
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Input
                              value={agent.role}
                              onChange={(e) => updateAgent(index, { role: e.target.value })}
                              placeholder="Agent role"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Goal</Label>
                          <Textarea
                            value={agent.goal}
                            onChange={(e) => updateAgent(index, { goal: e.target.value })}
                            placeholder="What should this agent achieve?"
                            className="min-h-[60px]"
                          />
                        </div>

                        <div>
                          <Label>Backstory</Label>
                          <Textarea
                            value={agent.backstory}
                            onChange={(e) => updateAgent(index, { backstory: e.target.value })}
                            placeholder="Agent's background and expertise"
                            className="min-h-[60px]"
                          />
                        </div>

                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <Wrench className="h-4 w-4" />
                            Tools ({agent.tools.length})
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {preBuiltTools.map((tool) => (
                              <Badge
                                key={tool}
                                variant={agent.tools.includes(tool) ? "default" : "outline"}
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => toggleTool(index, tool)}
                              >
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {editingCrew.agents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No agents configured</p>
                      <p className="text-sm">Add agents to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Tasks</h3>
                  <Button onClick={addTask} size="sm" disabled={editingCrew.agents.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-4">
                  {editingCrew.tasks.map((task, index) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Task {index + 1}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Task Name</Label>
                            <Input
                              value={task.name}
                              onChange={(e) => updateTask(index, { name: e.target.value })}
                              placeholder="Task name"
                            />
                          </div>
                          <div>
                            <Label>Assigned Agent</Label>
                            <Select
                              value={task.agentId}
                              onValueChange={(value) => updateTask(index, { agentId: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {editingCrew.agents.map((agent) => (
                                  <SelectItem key={agent.id} value={agent.name}>
                                    {agent.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={task.description}
                            onChange={(e) => updateTask(index, { description: e.target.value })}
                            placeholder="What needs to be done?"
                            className="min-h-[60px]"
                          />
                        </div>

                        <div>
                          <Label>Expected Output</Label>
                          <Textarea
                            value={task.expectedOutput}
                            onChange={(e) => updateTask(index, { expectedOutput: e.target.value })}
                            placeholder="What should the output look like?"
                            className="min-h-[60px]"
                          />
                        </div>

                        <div>
                          <Label>Output File (Optional)</Label>
                          <Input
                            value={task.outputFile || ''}
                            onChange={(e) => updateTask(index, { outputFile: e.target.value })}
                            placeholder="filename.txt (leave empty for no file)"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {editingCrew.tasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No tasks configured</p>
                      <p className="text-sm">Add tasks to define what the crew should do</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 border-t border-border bg-background">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}