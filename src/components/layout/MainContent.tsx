import { useCrewStore } from '@/store/useCrewStore';
import { CrewDetail } from '@/components/crew/CrewDetail';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bot, Sparkles } from 'lucide-react';

export function MainContent() {
  const { currentCrew } = useCrewStore();

  if (!currentCrew) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <EmptyState
          icon={Bot}
          title="Welcome to CrewRunner AI"
          description="Create intelligent AI crews that work together to accomplish complex tasks. Generate crews with AI or build them manually using our intuitive interface."
          actions={[
            {
              label: "Generate with AI",
              icon: Sparkles,
              variant: "default"
            }
          ]}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <CrewDetail crew={currentCrew} />
    </div>
  );
}