// components/SignUpButtonWeb.tsx
"use client";

import React from 'react';
import { Link } from 'expo-router';
import { Button } from './ui/button';

export default function SignUpButtonWeb() {
  return (
    <Link href="/signup" asChild>
      <Button
        variant="default" // 'default' for a prominent sign up button
        className="bg-primary-dark text-primary-foreground hover:bg-primary/90"
      >
        Sign Up
      </Button>
    </Link>
  );
}