import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Users, 
  Zap, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  Sparkles,
  Play,
  Settings,
  Activity,
  Github,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "AI-Powered Crew Generation",
      description: "Describe your project and let AI automatically generate intelligent crews with specialized agents and tasks."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Agent Collaboration",
      description: "Create teams of AI agents that work together, each with unique roles, goals, and specialized tools."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-Time Execution",
      description: "Watch your crews execute tasks in real-time with live logs, progress tracking, and instant feedback."
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Automated File Generation",
      description: "Crews automatically generate reports, documents, and files based on their task outputs and analysis."
    }
  ];

  const useCases = [
    "Content Creation & Marketing",
    "Software Development Teams",
    "Research & Analysis",
    "Data Processing & Reports",
    "Customer Support Automation",
    "Business Process Optimization"
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-auto">
      {/* Hero Section */}
      <div className="relative">
        {/* Header */}
        <header className="relative z-10 border-b border-white/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    CrewRunner AI
                  </h1>
                  <p className="text-xs text-white/60">Intelligent Multi-Agent Automation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/lalomorales22/crew-runner-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
                <Button
                  onClick={onEnterApp}
                  className="bg-white text-black hover:bg-white/90 border-0"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Launch App
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 border-white/30 text-white/80 bg-black">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by{' '}
              <a 
                href="https://crewai.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors underline underline-offset-2"
              >
                CrewAI
              </a>
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Build Intelligent
              <br />
              <span className="text-white/70">
                AI Crews
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 mb-8 leading-relaxed">
              Create teams of specialized AI agents that collaborate to solve complex tasks.
              <br />
              From research to content creation, automate your workflows with intelligent crews.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onEnterApp}
                size="lg"
                className="bg-white text-black hover:bg-white/90 border-0 text-lg px-8 py-6 h-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Building Crews
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <a 
                href="https://github.com/lalomorales22/crew-runner-ai" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white/80 hover:bg-white/10 hover:text-white text-lg px-8 py-6 h-auto"
                >
                  <Github className="h-5 w-5 mr-2" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Powerful Features
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Everything you need to create, configure, and execute intelligent AI crews
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`bg-black border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer ${
                  hoveredFeature === index ? 'scale-105 shadow-2xl border-white' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-8">
                  <div className="inline-flex p-3 rounded-lg bg-white mb-4">
                    <div className="text-black">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Perfect For
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              CrewRunner AI adapts to your industry and workflow needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 bg-black rounded-lg border border-white/20 hover:border-white/40 transition-colors"
              >
                <CheckCircle className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white/80">{useCase}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Get started in minutes with our intuitive workflow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-white mb-6">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">1. Generate or Design</h3>
              <p className="text-white/60">
                Use AI to generate crews from descriptions or manually design your team of specialized agents
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-white mb-6">
                <Settings className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">2. Configure & Customize</h3>
              <p className="text-white/60">
                Fine-tune agent roles, goals, tools, and task workflows to match your specific requirements
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-white mb-6">
                <Activity className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">3. Execute & Monitor</h3>
              <p className="text-white/60">
                Launch your crew and watch real-time execution with live logs, progress tracking, and file generation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Build Your First Crew?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join the future of AI automation and start creating intelligent workflows today
          </p>
          
          <Button
            onClick={onEnterApp}
            size="lg"
            className="bg-white text-black hover:bg-white/90 border-0 text-xl px-12 py-8 h-auto"
          >
            <Play className="h-6 w-6 mr-3" />
            Launch CrewRunner AI
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black relative">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <span className="text-white/60">CrewRunner AI - Intelligent Multi-Agent Automation</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/lalomorales22/crew-runner-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
              <div className="flex items-center gap-1 text-white/60">
                <Star className="h-4 w-4" />
                <span className="text-sm">Star on GitHub</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bolt.new Attribution */}
        <div className="absolute bottom-4 right-6">
          <a 
            href="https://bolt.new" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            powered by Bolt.new
          </a>
        </div>
      </footer>
    </div>
  );
}