import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface AccessDialogsProps {
  showGrantDialog: boolean;
  showRevokeDialog: boolean;
  selectedUsersCount: number;
  selectedFixturesCount: number;
  onGrantDialogOpenChange: (open: boolean) => void;
  onRevokeDialogOpenChange: (open: boolean) => void;
  onGrantAccess: () => void;
  onRevokeAccess: () => void;
}

export function AccessDialogs({ 
  showGrantDialog, 
  showRevokeDialog, 
  selectedUsersCount, 
  selectedFixturesCount,
  onGrantDialogOpenChange, 
  onRevokeDialogOpenChange, 
  onGrantAccess, 
  onRevokeAccess 
}: AccessDialogsProps) {
  return (
    <>
      {/* Grant Access Confirmation Dialog */}
      <AlertDialog open={showGrantDialog} onOpenChange={onGrantDialogOpenChange}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Grant Fixture Access</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Are you sure you want to grant access to <strong className="dark:text-white">{selectedFixturesCount} fixture{selectedFixturesCount !== 1 ? 's' : ''}</strong> for <strong className="dark:text-white">{selectedUsersCount} user{selectedUsersCount !== 1 ? 's' : ''}</strong>?
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selected users will be able to view these fixtures in their feed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => onGrantDialogOpenChange(false)}
              className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onGrantAccess}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Grant Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Access Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={onRevokeDialogOpenChange}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Revoke Fixture Access</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-300">
              Are you sure you want to revoke access to <strong className="dark:text-white">{selectedFixturesCount} fixture{selectedFixturesCount !== 1 ? 's' : ''}</strong> for <strong className="dark:text-white">{selectedUsersCount} user{selectedUsersCount !== 1 ? 's' : ''}</strong>?
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selected users will no longer be able to view these fixtures in their feed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => onRevokeDialogOpenChange(false)}
              className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onRevokeAccess}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}