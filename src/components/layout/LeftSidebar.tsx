import { useEffect, useState } from 'react';
import { useCrewStore } from '@/store/useCrewStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Trash2, 
  Copy, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Crew } from '@/types';

export function LeftSidebar() {
  const { 
    crews, 
    currentCrew, 
    loadCrews, 
    deleteCrew, 
    setCurrentCrew, 
    duplicateCrew, 
    saveCrew,
    createNewCrew,
    isLoading 
  } = useCrewStore();

  useEffect(() => {
    loadCrews();
  }, [loadCrews]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'running':
        return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <FileText className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const handleCreateNew = async () => {
    const newCrew = createNewCrew();
    await saveCrew(newCrew);
    setCurrentCrew(newCrew);
  };

  const handleDuplicate = async (crew: Crew) => {
    const duplicated = duplicateCrew(crew);
    await saveCrew(duplicated);
    setCurrentCrew(duplicated);
  };

  return (
    <div className="h-full bg-card/30 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm">Crew History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNew}
            className="h-7 px-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : crews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No crews yet</p>
            <p className="text-xs">Create your first crew to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {crews.map((crew) => (
              <Card
                key={crew.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md border-border/50",
                  currentCrew?.id === crew.id && "ring-2 ring-ring bg-accent/50"
                )}
                onClick={() => setCurrentCrew(crew)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-1">
                      {crew.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(crew.status)}
                      <Badge variant="outline" className="text-xs h-5">
                        {crew.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {crew.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{crew.agents.length} agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <span>{crew.tasks.length} tasks</span>
                    </div>
                  </div>

                  <Separator className="mb-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(crew.updatedAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(crew);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCrew(crew.id);
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}