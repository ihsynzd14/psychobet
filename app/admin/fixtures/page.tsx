'use client';

import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { 
  SelectedUsersModal 
} from '@/components/admin/selected-users-modal';
import { 
  SelectedFixturesModal 
} from '@/components/admin/selected-fixtures-modal';
import { 
  AccessDialogs 
} from '@/components/admin/access-dialogs';
import { 
  FixturesPageHeader 
} from '@/components/admin/fixtures-page-header';
import { 
  FixturesUsersSection 
} from '@/components/admin/fixtures-users-section';
import { 
  FixturesSection 
} from '@/components/admin/fixtures-section';
import { 
  FixturesSelectionSummary 
} from '@/components/admin/fixtures-selection-summary';
import { 
  FixtureDetailsDialog 
} from '@/components/admin/fixture-details-dialog';
import { useFixtureAccess } from '@/hooks/use-fixture-access';

export default function AdminFixturesPage() {
  const {
    state,
    setState,
    fetchUsers,
    fetchFixtures,
    handleUserSearch,
    handleFixtureSearch,
    handleUserSelect,
    handleFixtureSelect,
    handleSelectAllUsers,
    handleSelectAllFixtures,
    handleGrantAccess,
    handleRevokeAccess,
    getSelectedUsersData,
    getSelectedFixturesData,
    fetchUserFixtureAccess,
    handleRemoveUserAccess
  } = useFixtureAccess();

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="h-full flex flex-col overflow-hidden">
          <FixturesPageHeader 
            title="Fixture Access Management" 
            description="Manage user access to specific fixtures" 
          />

          {/* Main Content - Split View */}
          <div className="flex-1 min-w-0 flex overflow-hidden">
            <FixturesUsersSection
              users={state.users}
              loadingUsers={state.loadingUsers}
              selectedUsers={state.selectedUsers}
              userSearchTerm={state.userSearchTerm}
              onUserSearch={handleUserSearch}
              onUserSelect={handleUserSelect}
              onSelectAllUsers={handleSelectAllUsers}
              onViewUserDetails={fetchUserFixtureAccess}
            />

            <FixturesSection
              fixtures={state.fixtures}
              loadingFixtures={state.loadingFixtures}
              selectedFixtures={state.selectedFixtures}
              fixtureSearchTerm={state.fixtureSearchTerm}
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              loadingFixturesFlag={state.loadingFixtures}
              onFixtureSearch={handleFixtureSearch}
              onFixtureSelect={handleFixtureSelect}
              onSelectAllFixtures={handleSelectAllFixtures}
              onRefresh={() => {
                setState(prev => ({ ...prev, currentPage: 1 }));
                fetchFixtures(1, state.fixtureSearchTerm);
              }}
              onPreviousPage={() => {
                const newPage = state.currentPage - 1;
                setState(prev => ({ ...prev, currentPage: newPage }));
                fetchFixtures(newPage, state.fixtureSearchTerm);
              }}
              onNextPage={() => {
                const newPage = state.currentPage + 1;
                setState(prev => ({ ...prev, currentPage: newPage }));
                fetchFixtures(newPage, state.fixtureSearchTerm);
              }}
            />
          </div>

          <FixturesSelectionSummary
            selectedUsersCount={state.selectedUsers.size}
            selectedFixturesCount={state.selectedFixtures.size}
            onViewSelectedUsers={() => setState(prev => ({ ...prev, showSelectedUsers: true }))}
            onViewSelectedFixtures={() => setState(prev => ({ ...prev, showSelectedFixtures: true }))}
            onGrantAccess={() => setState(prev => ({ ...prev, showGrantDialog: true }))}
            onRevokeAccess={() => setState(prev => ({ ...prev, showRevokeDialog: true }))}
          />
        </div>

        {/* Access Dialogs */}
        <AccessDialogs
          showGrantDialog={state.showGrantDialog}
          showRevokeDialog={state.showRevokeDialog}
          selectedUsersCount={state.selectedUsers.size}
          selectedFixturesCount={state.selectedFixtures.size}
          onGrantDialogOpenChange={(open) => setState(prev => ({ ...prev, showGrantDialog: open }))}
          onRevokeDialogOpenChange={(open) => setState(prev => ({ ...prev, showRevokeDialog: open }))}
          onGrantAccess={handleGrantAccess}
          onRevokeAccess={handleRevokeAccess}
        />

        {/* Selected Users Modal */}
        <SelectedUsersModal
          open={state.showSelectedUsers}
          onOpenChange={(open) => setState(prev => ({ ...prev, showSelectedUsers: open }))}
          selectedUsersData={getSelectedUsersData()}
          onUserDeselect={(userId) => handleUserSelect(userId, false)}
        />

        {/* Selected Fixtures Modal */}
        <SelectedFixturesModal
          open={state.showSelectedFixtures}
          onOpenChange={(open) => setState(prev => ({ ...prev, showSelectedFixtures: open }))}
          selectedFixturesData={getSelectedFixturesData()}
          onFixtureDeselect={(fixtureId) => handleFixtureSelect(fixtureId, false)}
        />

        {/* Fixture Details Dialog */}
        <FixtureDetailsDialog
          open={state.showFixtureDetails}
          onOpenChange={(open) => setState(prev => ({ ...prev, showFixtureDetails: open }))}
          userId={state.selectedUserForDetails}
          fixturesWithAccess={state.userFixtureAccessData}
          loading={state.loadingUserFixtureAccess}
          onRemoveUserAccess={handleRemoveUserAccess}
          removingUserId={state.removingUserId}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}