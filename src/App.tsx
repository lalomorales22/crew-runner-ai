import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/components/LandingPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if user has previously entered the app
    const hasEnteredApp = localStorage.getItem('crewrunner_entered_app');
    if (hasEnteredApp) {
      setShowLanding(false);
    }
    
    document.title = 'CrewRunner AI - Intelligent Multi-Agent Automation';
  }, []);

  const handleEnterApp = () => {
    localStorage.setItem('crewrunner_entered_app', 'true');
    setShowLanding(false);
  };

  if (showLanding) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="crewrunner-theme">
        <LandingPage onEnterApp={handleEnterApp} />
        <Toaster position="bottom-right" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="crewrunner-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Layout />
        <Toaster position="bottom-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;