// components/SignOutButtonWeb.tsx
"use client";

import React from 'react';
import { Button } from './ui/button'; // shadcn/ui Button
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
} from './ui/alert-dialog'; // shadcn/ui AlertDialog

// For colors (though primary/destructive are usually enough, we'll pick amber for "burnt orange")
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';
import AuthButton from './WebHeaderAuthButton';
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors;


interface SignOutButtonWebProps {
  onConfirmSignOut: () => void;
}

export default function SignOutButtonWeb({ onConfirmSignOut }: SignOutButtonWebProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/*
          Refactored:
          - No icon
          - variant="outline" for outline style
          - Using amber-600 for a "burnt orange" look
          - Adjusted hover/active states for the outline style
        */}
        <Button
          variant="outline"
          // className="text-amber-600 border-amber-600 hover:bg-amber-600/10 hover:text-amber-700
                     // active:bg-amber-600/20 focus:ring-amber-600/50"
                     
          className="text-primary-dark border-primary-dark hover:bg-primary/90 hover:text-primary-foreground"
        >
          Sign Out
        </Button>
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