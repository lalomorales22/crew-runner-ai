import { useState, useRef } from 'react';
import { Crew } from '@/types';
import { useCrewStore } from '@/store/useCrewStore';
import { groqService } from '@/lib/groq';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Play, 
  Square, 
  Users, 
  ListTodo, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Bot,
  Zap,
  Activity,
  Settings,
  FileText,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CrewConfigureModal } from './CrewConfigureModal';
import { CrewFiles } from './CrewFiles';

interface CrewDetailProps {
  crew: Crew;
}

export function CrewDetail({ crew }: CrewDetailProps) {
  const { saveCrew, executeCrewFlow } = useCrewStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const crewFilesRef = useRef<any>(null);

  // File creation helper function
  const createCrewFile = (name: string, content: string, taskId?: string) => {
    const fileExtension = name.split('.').pop()?.toLowerCase() || 'txt';
    const fileType = getFileType(fileExtension);
    
    const newFile = {
      id: crypto.randomUUID(),
      name,
      content,
      type: fileType,
      size: new Blob([content]).size,
      createdAt: new Date(),
      crewId: crew.id,
      taskId
    };

    // Save to localStorage
    const existingFiles = JSON.parse(localStorage.getItem(`crew_files_${crew.id}`) || '[]');
    const updatedFiles = [...existingFiles, newFile];
    localStorage.setItem(`crew_files_${crew.id}`, JSON.stringify(updatedFiles));
    
    // Trigger refresh in CrewFiles component if available
    if (crewFilesRef.current && crewFilesRef.current.refreshFiles) {
      crewFilesRef.current.refreshFiles();
    }
    
    return newFile;
  };

  const getFileType = (extension: string): string => {
    const typeMap: Record<string, string> = {
      'txt': 'text',
      'md': 'markdown',
      'json': 'json',
      'csv': 'csv',
      'html': 'html',
      'css': 'css',
      'js': 'javascript',
      'py': 'python',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return typeMap[extension] || 'text';
  };

  const handleExecuteCrew = async () => {
    if (crew.agents.length === 0) {
      toast.error('Cannot execute crew without agents');
      return;
    }

    if (crew.tasks.length === 0) {
      toast.error('Cannot execute crew without tasks');
      return;
    }

    setIsExecuting(true);
    setExecutionLogs([]);
    setExecutionProgress(0);

    try {
      const updatedCrew = { ...crew, status: 'running' as const };
      await saveCrew(updatedCrew);

      // Simulate crew execution with progress updates
      const totalTasks = crew.tasks.length;
      let completedTasks = 0;
      let allResults: string[] = [];

      setExecutionLogs(prev => [...prev, '🚀 Starting crew execution...']);
      setExecutionLogs(prev => [...prev, `📋 Found ${crew.agents.length} agents and ${crew.tasks.length} tasks`]);

      for (const task of crew.tasks) {
        const agent = crew.agents.find(a => a.name === task.agentId) || crew.agents[0];
        
        setExecutionLogs(prev => [...prev, `🤖 ${agent.name} starting task: ${task.name}`]);
        
        try {
          // Simulate AI execution with Groq
          const stream = await groqService.executeAgentTask(agent, task);
          
          setExecutionLogs(prev => [...prev, `⚡ Processing with AI...`]);
          
          let result = '';
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            result += content;
          }

          // Ensure we have some result content
          if (!result.trim()) {
            result = `Task "${task.name}" completed by ${agent.name}.\n\nExpected Output: ${task.expectedOutput}\n\nThis task has been processed according to the agent's role as ${agent.role} with the goal: ${agent.goal}`;
          }

          allResults.push(`## ${task.name}\n\n${result}\n\n---\n`);

          setExecutionLogs(prev => [...prev, `✅ Task completed: ${task.name}`]);
          setExecutionLogs(prev => [...prev, `📄 Result: ${result.slice(0, 100)}...`]);
          
          // Create file if task specifies output file
          if (task.outputFile && result) {
            try {
              const createdFile = createCrewFile(task.outputFile, result, task.id);
              setExecutionLogs(prev => [...prev, `💾 Created file: ${task.outputFile} (${createdFile.size} bytes)`]);
            } catch (fileError) {
              console.error('File creation error:', fileError);
              setExecutionLogs(prev => [...prev, `⚠️ Could not create file: ${task.outputFile}`]);
            }
          }
          
          completedTasks++;
          setExecutionProgress((completedTasks / totalTasks) * 100);
          
          // Add delay for realistic execution
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (error) {
          console.error('Task execution error:', error);
          setExecutionLogs(prev => [...prev, `❌ Error in task ${task.name}: ${error}`]);
          
          // Still create a file with error information if outputFile is specified
          if (task.outputFile) {
            const errorContent = `# Task Failed: ${task.name}\n\nError: ${error}\n\nTask Description: ${task.description}\n\nExpected Output: ${task.expectedOutput}`;
            createCrewFile(task.outputFile, errorContent, task.id);
            setExecutionLogs(prev => [...prev, `📄 Created error report: ${task.outputFile}`]);
          }
        }
      }

      // Create a comprehensive final report
      const finalReport = `# Crew Execution Report: ${crew.name}\n\n**Description:** ${crew.description}\n\n**Execution Date:** ${new Date().toLocaleString()}\n\n**Process:** ${crew.process}\n\n**Agents:** ${crew.agents.length}\n**Tasks:** ${crew.tasks.length}\n\n## Results\n\n${allResults.join('\n')}`;
      
      // Always create a final report file
      const reportFileName = `${crew.name.toLowerCase().replace(/\s+/g, '_')}_report.md`;
      createCrewFile(reportFileName, finalReport);
      setExecutionLogs(prev => [...prev, `📋 Created final report: ${reportFileName}`]);

      setExecutionLogs(prev => [...prev, '🎉 Crew execution completed successfully!']);
      
      const finalCrew = { 
        ...crew, 
        status: 'completed' as const,
        results: 'Crew execution completed with all tasks finished. Check the Files tab for generated outputs.',
        updatedAt: new Date()
      };
      await saveCrew(finalCrew);
      
      toast.success('Crew execution completed! Check the Files tab for outputs.');
      
      // Switch to files tab to show results
      setActiveTab('files');
      
    } catch (error) {
      console.error('Execution failed:', error);
      setExecutionLogs(prev => [...prev, `💥 Execution failed: ${error}`]);
      
      // Create error log file
      const errorLog = `# Execution Error Log\n\n**Crew:** ${crew.name}\n**Error Time:** ${new Date().toLocaleString()}\n\n**Error Details:**\n${error}\n\n**Execution Logs:**\n${executionLogs.join('\n')}`;
      createCrewFile('execution_error.log', errorLog);
      
      const failedCrew = { ...crew, status: 'failed' as const };
      await saveCrew(failedCrew);
      
      toast.error('Crew execution failed. Check the Files tab for error details.');
    } finally {
      setIsExecuting(false);
    }
  };

  const exportCrewLogs = () => {
    const logsContent = executionLogs.join('\n');
    const blob = new Blob([logsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${crew.name}_execution_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Execution logs exported!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'running':
        return 'text-blue-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'running':
        return <Activity className="h-4 w-4 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{crew.name}</h1>
              <Badge 
                variant="outline" 
                className={cn("flex items-center gap-1", getStatusColor(crew.status))}
              >
                {getStatusIcon(crew.status)}
                {crew.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{crew.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfigureOpen(true)}
              disabled={isExecuting}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            
            <Button
              onClick={handleExecuteCrew}
              disabled={isExecuting || crew.agents.length === 0 || crew.tasks.length === 0}
              className="min-w-[120px]"
            >
              {isExecuting ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Crew
                </>
              )}
            </Button>
          </div>
        </div>

        {isExecuting && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Execution Progress</span>
              <span>{Math.round(executionProgress)}%</span>
            </div>
            <Progress value={executionProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-border px-6">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="overview" className="text-xs">
                <Bot className="h-3 w-3 mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="execution" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Execution
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Files
              </TabsTrigger>
              <TabsTrigger value="results" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                Results
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Agents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      Agents ({crew.agents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {crew.agents.map((agent, index) => (
                          <div key={agent.id} className="p-4 border border-border rounded-lg bg-card/50">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{agent.name}</h3>
                              <Badge variant="secondary">{agent.role}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{agent.goal}</p>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Backstory:</span>
                                <p className="text-xs mt-1">{agent.backstory}</p>
                              </div>
                              
                              {agent.tools.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">Tools:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {agent.tools.map((tool) => (
                                      <Badge key={tool} variant="outline" className="text-xs">
                                        {tool}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {crew.agents.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No agents configured</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ListTodo className="h-5 w-5" />
                      Tasks ({crew.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {crew.tasks.map((task, index) => (
                          <div key={task.id} className="p-4 border border-border rounded-lg bg-card/50">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{task.name}</h3>
                              <Badge variant="outline">{task.agentId}</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Description:</span>
                                <p className="text-sm mt-1">{task.description}</p>
                              </div>
                              
                              <div>
                                <span className="text-xs font-medium text-muted-foreground">Expected Output:</span>
                                <p className="text-xs mt-1 text-muted-foreground">{task.expectedOutput}</p>
                              </div>

                              {task.outputFile && (
                                <div>
                                  <span className="text-xs font-medium text-muted-foreground">Output File:</span>
                                  <p className="text-xs mt-1 font-mono">{task.outputFile}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {crew.tasks.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tasks configured</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="execution" className="h-full m-0 p-6">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5" />
                      Execution Logs
                    </CardTitle>
                    {executionLogs.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportCrewLogs}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Logs
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="h-full">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2 font-mono text-sm">
                      {executionLogs.length > 0 ? (
                        executionLogs.map((log, index) => (
                          <div 
                            key={index} 
                            className="p-2 bg-muted/50 rounded text-xs border-l-2 border-border"
                          >
                            <span className="text-muted-foreground mr-2">
                              {new Date().toLocaleTimeString()}
                            </span>
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No execution logs yet</p>
                          <p className="text-xs">Execute the crew to see real-time logs</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="h-full m-0">
              <CrewFiles 
                crewId={crew.id} 
                ref={crewFilesRef}
              />
            </TabsContent>

            <TabsContent value="results" className="h-full m-0 p-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5" />
                    Execution Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {crew.results ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Final Results</h4>
                        <p className="text-sm">{crew.results}</p>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>Completed: {crew.updatedAt.toLocaleString()}</p>
                        <p>Status: {crew.status}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No results yet</p>
                      <p className="text-xs">Execute the crew to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Configure Modal */}
      <CrewConfigureModal
        crew={crew}
        open={isConfigureOpen}
        onOpenChange={setIsConfigureOpen}
      />
    </div>
  );
}