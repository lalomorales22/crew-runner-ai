import { useState } from 'react';
import { useCrewStore } from '@/store/useCrewStore';
import { groqService } from '@/lib/groq';
import { tavilyService } from '@/lib/tavily';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  Users, 
  ListTodo,
  Settings,
  Play,
  Save,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function RightSidebar() {
  const { currentCrew, setCurrentCrew, saveCrew } = useCrewStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('generate');

  const isWebSearchConfigured = tavilyService.isConfigured();

  const handleGenerateCrew = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description for your crew');
      return;
    }

    setIsGenerating(true);
    try {
      const crewConfig = await groqService.generateCrewFromDescription(description);
      
      const newCrew = {
        id: crypto.randomUUID(),
        name: crewConfig.name,
        description: crewConfig.description,
        agents: crewConfig.agents.map((agent: any, index: number) => ({
          id: crypto.randomUUID(),
          name: agent.name,
          role: agent.role,
          goal: agent.goal,
          backstory: agent.backstory,
          tools: agent.tools || []
        })),
        tasks: crewConfig.tasks.map((task: any, index: number) => ({
          id: crypto.randomUUID(),
          name: task.name,
          description: task.description,
          expectedOutput: task.expectedOutput,
          agentId: crewConfig.agents[parseInt(task.agentId)] ? 
            crewConfig.agents[parseInt(task.agentId)].name : 
            crewConfig.agents[0]?.name || 'Unknown'
        })),
        process: crewConfig.process || 'sequential',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft' as const
      };

      setCurrentCrew(newCrew);
      await saveCrew(newCrew);
      setDescription('');
      setActiveTab('configure');
      
      toast.success('Crew generated successfully!');
    } catch (error) {
      console.error('Failed to generate crew:', error);
      toast.error('Failed to generate crew. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCrew = async () => {
    if (!currentCrew) return;
    
    try {
      await saveCrew({
        ...currentCrew,
        updatedAt: new Date()
      });
      toast.success('Crew saved successfully!');
    } catch (error) {
      toast.error('Failed to save crew');
    }
  };

  const preBuiltTools = [
    'web_search', 'file_reader', 'code_analyzer', 'data_processor',
    'content_writer', 'research_tool', 'email_sender', 'calculator',
    'text_summarizer', 'json_parser', 'api_caller', 'database_query'
  ];

  return (
    <div className="h-full bg-card/30 border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Crew Builder
        </h2>
        
        {/* Web Search Status */}
        <div className="mt-2">
          <Badge 
            variant={isWebSearchConfigured ? "default" : "secondary"}
            className="flex items-center gap-1 text-xs"
          >
            <Globe className="h-3 w-3" />
            {isWebSearchConfigured ? 'Web Search Ready' : 'Web Search Simulated'}
          </Badge>
          {!isWebSearchConfigured && (
            <p className="text-xs text-muted-foreground mt-1">
              Add VITE_TAVILY_API_KEY to enable real web search
            </p>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Generate
              </TabsTrigger>
              <TabsTrigger value="configure" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Crew Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-2 block">
                      Describe your crew
                    </label>
                    <Textarea
                      placeholder="e.g., Create a content marketing crew that researches topics, writes articles, and optimizes for SEO..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px] text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateCrew}
                    disabled={isGenerating || !description.trim()}
                    className="w-full"
                    size="sm"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-2" />
                    )}
                    Generate Crew
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    <p className="mb-2">💡 Try these examples:</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => setDescription('Create a software development crew with a product manager, senior developer, QA tester, and DevOps engineer')}
                        className="block text-left hover:text-foreground transition-colors"
                      >
                        • Software development team
                      </button>
                      <button
                        onClick={() => setDescription('Build a market research crew that analyzes competitors, identifies trends, and creates strategic reports with web search capabilities')}
                        className="block text-left hover:text-foreground transition-colors"
                      >
                        • Market research team (with web search)
                      </button>
                      <button
                        onClick={() => setDescription('Design a content creation crew for social media with researchers, writers, and social media managers that can search the web for trending topics')}
                        className="block text-left hover:text-foreground transition-colors"
                      >
                        • Content creation team (with web search)
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {preBuiltTools.map((tool) => (
                      <Badge 
                        key={tool} 
                        variant={tool === 'web_search' ? (isWebSearchConfigured ? 'default' : 'secondary') : 'secondary'} 
                        className="text-xs"
                      >
                        {tool === 'web_search' && <Globe className="h-3 w-3 mr-1" />}
                        {tool}
                      </Badge>
                    ))}
                  </div>
                  
                  {!isWebSearchConfigured && (
                    <div className="flex items-start gap-2 mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-700 dark:text-amber-400">
                        <p className="font-medium">Web Search Tool Available</p>
                        <p>Add your Tavily API key to enable real web search capabilities for your crews.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configure" className="space-y-4 mt-4">
              {currentCrew ? (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{currentCrew.name}</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSaveCrew}
                          className="h-7 px-2"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Name</label>
                        <Input
                          value={currentCrew.name}
                          onChange={(e) => setCurrentCrew({ ...currentCrew, name: e.target.value })}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium mb-1 block">Description</label>
                        <Textarea
                          value={currentCrew.description}
                          onChange={(e) => setCurrentCrew({ ...currentCrew, description: e.target.value })}
                          className="text-sm min-h-[60px]"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Agents ({currentCrew.agents.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentCrew.agents.map((agent, index) => (
                          <div key={agent.id} className="p-3 border border-border rounded-md bg-card/50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{agent.name}</h4>
                              <Badge variant="outline" className="text-xs">{agent.role}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {agent.goal}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {agent.tools.map((tool) => (
                                <Badge 
                                  key={tool} 
                                  variant={tool === 'web_search' ? (isWebSearchConfigured ? 'default' : 'secondary') : 'secondary'} 
                                  className="text-xs"
                                >
                                  {tool === 'web_search' && <Globe className="h-3 w-3 mr-1" />}
                                  {tool}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ListTodo className="h-4 w-4" />
                        Tasks ({currentCrew.tasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentCrew.tasks.map((task, index) => (
                          <div key={task.id} className="p-3 border border-border rounded-md bg-card/50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{task.name}</h4>
                              <Badge variant="outline" className="text-xs">{task.agentId}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full" size="sm">
                    <Play className="h-3 w-3 mr-2" />
                    Execute Crew
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No crew selected</p>
                  <p className="text-xs">Generate or select a crew to configure</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}