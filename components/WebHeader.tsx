// components/WebHeader.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Link } from 'expo-router';
import { MenuIcon, XIcon, UserCircleIcon } from 'lucide-react-native';

// Import NativeWind's utility to resolve your Tailwind config
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';

// Assuming you have these components
import SignOutNavWeb from './signOutNavWeb';
import AvatarProfileButton from './avatarProfileButtonWeb';

// Resolve the full Tailwind config to access theme values directly
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors;


const WebHeader = () => {
  const { width } = useWindowDimensions();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const breakpoint = 768; // Tailwind's 'md' breakpoint

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Helper component for common link styling
  const NavLink = ({ href, children, isSidebar = false }) => (
    <Link
      href={href}
      className={`
        ${isSidebar // Styles for sidebar links
          ? 'py-3 w-full border-b border-border text-lg text-text-DEFAULT font-inter-medium'
          // Styles for main nav links (desktop)
          : 'ml-5 text-base text-text-foreground font-inter-medium'} {/* Changed text-text-inverted to text-foreground for shadcn consistency */}
        hover:text-secondary-light active:text-secondary-light focus:text-secondary-light
        transition-colors duration-200
      `}
      onPress={() => setIsSidebarOpen(false)}
    >
      {children}
    </Link>
  );

  // Common navigation links content - now conditionally renders SignOut and Profile for sidebar only
  const NavLinksContent = ({ isSidebar = false }) => (
    <>
      <NavLink href="/" isSidebar={isSidebar}>Home</NavLink>
      <NavLink href="/clubs" isSidebar={isSidebar}>Clubs</NavLink>
      <NavLink href="/library" isSidebar={isSidebar}>Library</NavLink>

      {isSidebar && (
        <>
          {/* These links/buttons only show in the sidebar */}
          <NavLink href="/account" isSidebar={isSidebar}>Profile</NavLink>
          <View className="mt-4 w-full">
            <SignOutNavWeb />
          </View>
        </>
      )}
    </>
  );


  return (
    <View
      // Header Container: flex row, align items, padding, background, border bottom, full width, zIndex
      // 'justify-between' will push the logo to the left and the right-side group to the far right.
      className="flex-row justify-between items-center px-5 py-4 bg-background-card border-b border-border w-full z-10"
    >
      {/* LEFT SECTION: App Title/Logo */}
      <Link href="/" asChild>
        <Pressable>
          <Text className="text-2xl font-merriweather-bold text-primary-dark">BookClubBolt</Text>
        </Pressable>
      </Link>

      {width > breakpoint ? (
        // DESKTOP/TABLET LAYOUT:
        // Main Nav Links immediately follow the logo.
        // Sign Out/Avatar group is pushed to the far right.
        <>
          {/* MIDDLE-LEFT GROUP: Main Nav Links */}
          {/* This View is now a direct child of the main header View */}
          <View className="flex-row items-center ml-8"> {/* ml-8 adds spacing from the logo */}
            <NavLinksContent />
          </View>

          {/* FAR RIGHT GROUP: Sign Out Button and Avatar */}
          {/* This View uses ml-auto to push itself to the absolute far right */}
          <View className="flex-row items-center ml-auto space-x-4">
            <SignOutNavWeb/>
            <AvatarProfileButton />
          </View>
        </>
      ) : (
        // MOBILE LAYOUT: Hamburger icon on the right
        <Pressable onPress={toggleSidebar} className="p-1.5">
          {isSidebarOpen ? (
            <XIcon size={24} color={colors.foreground} />
          ) : (
            <MenuIcon size={24} color={colors.foreground} /> 
          )}
        </Pressable>
      )}

      {/* SIDEBAR OVERLAY (Mobile only) */}
      {isSidebarOpen && width <= breakpoint && (
        <Pressable onPress={toggleSidebar} className="absolute inset-0 bg-black/50 z-[1000] justify-start items-start">
          <View
            className="w-[70%] max-w-[300px] h-full bg-background-card pt-[60px] px-5 flex-col justify-start items-start
                       shadow-lg"
            onStartShouldSetResponder={() => true} // Prevents closing sidebar when touching inside it
          >
            <NavLinksContent isSidebar={true} />
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default WebHeader;