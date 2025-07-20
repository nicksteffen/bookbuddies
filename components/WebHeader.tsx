// components/WebHeader.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { View, Text, useWindowDimensions, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MenuIcon, XIcon, BookOpen } from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';

// Import the new/updated components
import SignOutButtonWeb from '@/components/SignOutButtonWeb';
import AvatarProfileButtonWeb from '@/components/AvatarProfileButtonWeb';
import LoginButtonWeb from '@/components/LoginButtonWeb';
import SignUpButtonWeb from '@/components/SignUpButtonWeb';

import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config';
import AuthButton from './WebHeaderAuthButton';
import { useAuth } from '@/contexts/AuthContext';
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors;

interface WebHeaderProps {
  // Add actual user data props if needed for avatarUrl, userDisplayName
  // onSignOut: () => void; // Pass your actual sign out function here
  // userAvatarUrl?: string | null;
  // userDisplayName?: string | null;
}

const WebHeader =
  ({} /*, onSignOut, userAvatarUrl, userDisplayName */ : WebHeaderProps) => {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const { width } = useWindowDimensions();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const breakpoint = 768; // Tailwind's 'md' breakpoint

    const handleSignOut = () => {
      signOut();
      setIsSidebarOpen(false); // Close sidebar after action
      router.push('/(marketing)'); // Redirect to home page after sign out
    };

    const NavLink = ({
      href,
      children,
      isSidebar = false,
    }: {
      href: string;
      children: React.ReactNode;
      isSidebar?: boolean;
    }) => (
      <Link
        href={href}
        className={`
        ${
          isSidebar
            ? 'py-3 w-full border-b border-border text-lg text-foreground font-inter-medium'
            : 'ml-5 text-base text-foreground font-inter-medium'
        }
        hover:text-secondary-light active:text-secondary-light focus:text-secondary-light
        transition-colors duration-200
      `}
        asChild
      >
        <Button variant="outline"
          onClick={() => { if (isSidebar) setIsSidebarOpen(false); }} 
        >
          {children}
        </Button>
      </Link>
    );

    const NavLinksContent = ({
      isSidebar = false,
    }: {
      isSidebar?: boolean;
    }) => (
      <>
        {user && (
          <NavLink href="/" isSidebar={isSidebar}>
            Home
          </NavLink>
        )}
        <NavLink href="/clubs" isSidebar={isSidebar}>
          Clubs
        </NavLink>
        <NavLink href="/library" isSidebar={isSidebar}>
          Library
        </NavLink>

        {/* Auth/Guest actions within sidebar */}
        {isSidebar && (
          <View className="mt-4 w-full flex-col space-y-3">
            {user ? (
              <>
                <NavLink href="/profile" isSidebar={true}>
                  Profile
                </NavLink>
                <SignOutButtonWeb onConfirmSignOut={handleSignOut} />
              </>
            ) : (
              <>
                <AuthButton
                  linkDest="/login"
                  buttonText="Login"
                  closeMenu={() => setIsSidebarOpen(false)}
                />
                <AuthButton
                  linkDest="/signup"
                  buttonText="Signup"
                  closeMenu={() => setIsSidebarOpen(false)}
                />
              </>
            )}
          </View>
        )}
      </>
    );

    return (
      <View className="flex-row justify-between items-center px-5 py-4 bg-card border-b border-border w-full z-10">
        {/* LEFT SECTION: App Title/Logo */}
        <Link href="/(marketing)" asChild>
          <Pressable className="flex flex-row items-center justify-center">
            <BookOpen size={24} className="text-primary-dark" />
            <Text className="ml-2 font-merriweather-bold text-2xl text-primary-dark">
              BookClub
            </Text>
          </Pressable>
        </Link>

        {width > breakpoint ? (
          // DESKTOP/TABLET LAYOUT:
          <>
            {/* MIDDLE-LEFT GROUP: Main Nav Links */}
            <View className="flex-row items-center ml-8">
              <NavLinksContent />
            </View>
            {/* FAR RIGHT GROUP: Auth/Guest Actions */}
            <View className="flex-row items-center ml-auto space-x-4">
              {!!user ? (
                <>
                  <SignOutButtonWeb onConfirmSignOut={handleSignOut} />
                  <AvatarProfileButtonWeb />
                </>
              ) : (
                <>
                  <AuthButton linkDest="/login" buttonText="Login" />
                  <AuthButton linkDest="/signup" buttonText="Signup" />
                  {/* <SignOutButtonWeb onConfirmSignOut={handleSignOut} /> */}
                </>
              )}
            </View>
          </>
        ) : (
          // MOBILE LAYOUT: Hamburger icon on the right
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="p-1.5">
                <MenuIcon size={24} className="text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[70%] max-w-[300px] bg-card p-0 pt-16 flex-col items-start"
            >
              {/* Sidebar content */}
              <View className="flex-1 w-full p-5">
                <NavLinksContent isSidebar={true} />
              </View>
            </SheetContent>
          </Sheet>
        )}
      </View>
    );
  };

export default WebHeader;
