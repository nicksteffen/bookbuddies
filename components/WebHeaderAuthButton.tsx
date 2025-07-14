"use client";

import React from 'react';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button'; // shadcn/ui Button


interface AuthButtonProps {
  linkDest: string;
  buttonText: string;
}

export default function AuthButton({ linkDest, buttonText }: AuthButtonProps) {
  return (
    <Link href={linkDest} asChild>
      <Button
        // Changed variant to 'outline' and set clear colors
        variant="outline"
        className="text-primary-dark border-primary-dark hover:bg-primary/90 hover:text-primary-foreground"
      >
        {buttonText}
      </Button>
    </Link>
  );
}