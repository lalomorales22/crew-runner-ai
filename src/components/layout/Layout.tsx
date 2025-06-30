import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainContent } from './MainContent';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

export function Layout() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  return (
    <div className="h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="h-8 w-8 p-0"
          >
            {leftSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-foreground rounded-sm flex items-center justify-center">
              <span className="text-background text-xs font-bold">CR</span>
            </div>
            <h1 className="text-lg font-semibold">CrewRunner AI</h1>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="h-8 w-8 p-0"
        >
          {rightSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </header>

      {/* Main Layout */}
      <div className="h-[calc(100vh-3.5rem)]">
        <PanelGroup direction="horizontal">
          {/* Left Sidebar */}
          {leftSidebarOpen && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <LeftSidebar />
              </Panel>
              <PanelResizeHandle className="w-px bg-border hover:bg-accent transition-colors" />
            </>
          )}

          {/* Main Content */}
          <Panel minSize={30}>
            <MainContent />
          </Panel>

          {/* Right Sidebar */}
          {rightSidebarOpen && (
            <>
              <PanelResizeHandle className="w-px bg-border hover:bg-accent transition-colors" />
              <Panel defaultSize={25} minSize={20} maxSize={35}>
                <RightSidebar />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}