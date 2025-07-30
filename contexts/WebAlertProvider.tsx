// WebAlertProvider.tsx (Web only)
import { createContext, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export const WebAlertContext = createContext({
  show: (args: {
    title: string;
    message?: string;
    onConfirm?: () => void;
  }) => {},
});

export const WebAlertProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log('web alert provider');
  const [alertData, setAlertData] = useState<null | {
    title: string;
    message?: string;
    onConfirm?: () => void;
  }>(null);

  const show = (data: typeof alertData) => setAlertData(data);

  const close = () => setAlertData(null);

  return (
    <WebAlertContext.Provider value={{ show }}>
      {children}
      {alertData && (
        <AlertDialog
          open
          onOpenChange={(open) => !open && close()}
          z-index={1000}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <h3>{alertData.title}</h3>
              <p>{alertData.message}</p>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  alertData.onConfirm?.();
                  close();
                }}
              >
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </WebAlertContext.Provider>
  );
};
