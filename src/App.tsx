import React from 'react';
import { useBrainVibe } from './context/BrainVibeContext';
import { AppShell } from './components/AppShell';
import { AuthFlow } from './views/AuthFlow';
import { GoalsView } from './views/GoalsView';
import { AiAssistantView } from './views/AiAssistantView';
import { SettingsView } from './views/SettingsView';
import { AuthStage, MainTab } from './types/models';

export const App: React.FC = () => {
  const { authStage, activeTab } = useBrainVibe();

  if (authStage !== AuthStage.Authenticated) {
    return <AuthFlow />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case MainTab.Assistant:
        return <AiAssistantView />;
      case MainTab.Settings:
        return <SettingsView />;
      case MainTab.Goals:
      default:
        return <GoalsView />;
    }
  };

  return <AppShell>{renderContent()}</AppShell>;
};

export default App;
