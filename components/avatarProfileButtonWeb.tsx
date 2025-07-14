// components/AvatarProfileButtonWeb.tsx
"use client"; // This component uses client-side hooks (Link)

import React from 'react';
import { Link } from 'expo-router';
import { UserCircle } from 'lucide-react'; // Lucide icon for web
import { Button } from '@/components/ui/button'; // shadcn/ui Button

// Import Tailwind config to access colors
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config'; // Adjust path if needed
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors;


interface AvatarProfileButtonWebProps {
  /**
   * Optional: URL for the user's avatar image. If not provided, a default icon is shown.
   */
  avatarUrl?: string | null;
}

export default function AvatarProfileButtonWeb({ avatarUrl }: AvatarProfileButtonWebProps) {
  return (
    <Link href="/profile" asChild>
      <Button
        variant="ghost" // Use ghost variant for a subtle button
        className="w-10 h-10 rounded-full p-0 flex items-center justify-center
                   border border-transparent
                   bg-primary/30
                   hover:bg-primary/90
                   hover:border-secondary-light 
                   hover:scale-105 active:scale-95 transition-transform duration-150"
      >
        {avatarUrl ? (
          // In a real app, you'd use a proper Image component or shadcn AvatarImage
          <img
            src={avatarUrl}
            alt="User Avatar"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.src = `https://placehold.co/40x40/${colors.primary.DEFAULT.substring(1)}/${colors.primary.foreground.substring(1)}?text=U`;
            }}
          />
        ) : (
          // Placeholder icon if no avatar URL
          <UserCircle size={24} color={colors.primary.foreground} />
        )}
      </Button>
    </Link>
  );
}