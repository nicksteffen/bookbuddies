// components/MemberAvatarWithName.tsx
"use client"; // Essential for web components that might use hooks or client features

import React from 'react';
import { View, Text, Image, Platform } from 'react-native';
import { User } from 'lucide-react-native'; // Use lucide-react-native for cross-platform Expo icons

// Import Tailwind config to access theme colors for the placeholder
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config'; // Adjust path as needed
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors;

interface MemberAvatarWithNameProps {
  /** The display name of the member. Can be null or undefined. */
  displayName: string | null | undefined;
  /** The URL to the member's profile picture. Can be null or undefined. */
  profilePictureUrl: string | null | undefined;
  /** The email of the member, used as a fallback if display name is not available. */
}

export default function MemberAvatarWithName({
  displayName,
  profilePictureUrl,
}: MemberAvatarWithNameProps) {
  // Determine the name to display, prioritizing displayName, then email, then a generic fallback
  const nameToDisplay = displayName ||'Guest Member';

  // Generate initials for the placeholder if no picture is available
  const initials = nameToDisplay
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View className="flex flex-row items-center space-x-2">
      {/* Avatar/Profile Picture Container */}
      <View
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center
                   bg-primary/30 border border-border"
      >
        {profilePictureUrl ? (
          // Use Image component for the profile picture
          <Image
            source={{ uri: profilePictureUrl }}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          // Placeholder: Display initials or a generic User icon
          initials ? (
            <Text className="text-primary-foreground text-sm font-inter-semibold">
              {initials}
            </Text>
          ) : (
            <User size={20} color={colors.primary.foreground} />
          )
        )}
      </View>

      {/* Display Name */}
      <Text className="text-base font-inter-semibold text-foreground mb-0.5">
        {nameToDisplay}
      </Text>
    </View>
  );
}