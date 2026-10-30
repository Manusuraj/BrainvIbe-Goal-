import React from 'react';
import { useBrainVibe } from './context/BrainVibeContext';
import { AppShell } from './components/AppShell';
import { GlobalModals } from './components/GlobalModals';
import { AuthFlow } from './views/AuthFlow';
import { GoalsView } from './views/GoalsView';
import { GoalLedgerView } from './views/GoalLedgerView';
import {
  ProfileView,
  ControlsView,
  CoinsView,
  BookmarksView,
  PaymentOffersView,
  TutorialsView,
  HelpView,
} from './views/ControlsAndProfileViews';
import { AuthStage, MainTab, SubScreen } from './types/models';

export const App: React.FC = () => {
  const { authStage, activeTab, subScreen } = useBrainVibe();

  if (authStage !== AuthStage.Authenticated) {
    return <AuthFlow />;
  }

  const renderContent = () => {
    // If a sub-screen is active, render it
    if (subScreen !== SubScreen.None) {
      switch (subScreen) {
        case SubScreen.Profile:
          return <ProfileView />;
        case SubScreen.Controls:
          return <ControlsView />;
        case SubScreen.Coins:
          return <CoinsView />;
        case SubScreen.Bookmarks:
          return <BookmarksView />;
        case SubScreen.PaymentOffers:
          return <PaymentOffersView />;
        case SubScreen.Tutorials:
          return <TutorialsView />;
        case SubScreen.Help:
          return <HelpView />;
        default:
          return <GoalsView />;
      }
    }

    // Otherwise render primary tab
    switch (activeTab) {
      case MainTab.Goals:
        return <GoalsView />;
      case MainTab.Contributions:
        return <GoalLedgerView />;
      case MainTab.Settings:
        return <ControlsView />;
      case MainTab.Home:
        return <GoalsView />;
      case MainTab.Insights:
        return <GoalLedgerView />;
      default:
        return <GoalsView />;
    }
  };

  return (
    <AppShell>
      {renderContent()}
      <GlobalModals />
    </AppShell>
  );
};

export default App;
