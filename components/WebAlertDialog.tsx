// components/SignOutConfirmDialogWeb.tsx
// This component provides a confirmation dialog for signing out,
// designed to be used only on web platforms with shadcn/ui.

"use client"
import React from 'react';
import { Platform } from 'react-native'; // Import Platform to check OS

// Import shadcn/ui components (adjust paths based on your setup)
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface SignOutConfirmDialogWebProps {
  header?: string;
  content?: string;
  onConfirmSignOut: () => void;
  /**
   * The element that triggers the dialog (e.g., a "Sign Out" button).
   * If not provided, a default button will be rendered.
   */
  children?: React.ReactNode;
}

export default function SignOutConfirmDialogWeb({ onConfirmSignOut, children, header, content }: SignOutConfirmDialogWebProps) {
  // Only render the AlertDialog on web platforms
  if (Platform.OS !== 'web') {
    // On mobile, you might render nothing or a different mobile-specific confirmation
    // For this component's purpose, we'll return null for non-web platforms.
    // If you always want a trigger button, you can return `children` or a default button here.
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/*
          If `children` are provided, use them as the trigger.
          Otherwise, render a default "Sign Out" button.
        */}
        {children || (
          <Button variant="destructive">
            Sign Out
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be logged out of your account. You can always sign back in later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmSignOut}>
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}