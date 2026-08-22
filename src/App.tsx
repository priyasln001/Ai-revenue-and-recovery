import { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { OpportunitiesView } from './components/opportunities/OpportunitiesView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { CustomersView } from './components/views/CustomersView';
import { TransactionsView } from './components/views/TransactionsView';
import { InvoicesView } from './components/views/InvoicesView';
import { AgentControlCenterView } from './components/views/AgentControlCenterView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { PlaceholderView } from './components/views/PlaceholderView';
import { NavItemKey } from './types';
import { RecoveryProvider } from './context/RecoveryContext';

export function App() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');

  return (
    <RecoveryProvider>
      <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
        {activeTab === 'dashboard' ? (
          <DashboardView onSelectTab={setActiveTab} />
        ) : activeTab === 'opportunities' ? (
          <OpportunitiesView />
        ) : activeTab === 'audit' ? (
          <AuditTrailView />
        ) : activeTab === 'agent' ? (
          <AgentControlCenterView />
        ) : activeTab === 'customers' ? (
          <CustomersView />
        ) : activeTab === 'transactions' ? (
          <TransactionsView />
        ) : activeTab === 'invoices' ? (
          <InvoicesView />
        ) : activeTab === 'analytics' ? (
          <AnalyticsView />
        ) : (
          <PlaceholderView
            tabKey={activeTab}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}
      </AppLayout>
    </RecoveryProvider>
  );
}

export default App;

