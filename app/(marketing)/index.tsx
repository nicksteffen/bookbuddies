// app/(marketing)/landing.tsx
"use client"; // This component uses client-side features like hooks and interacts with the DOM

import React from 'react';
import { View, Text, ScrollView } from 'react-native'; // Basic RN primitives for main containers
// For web-only components, you can use direct HTML tags with NativeWind classes.
// No need for 'Link' or 'Button' imports here if using WebHeader's internal links.
import { BookOpen, ArrowRight, Users, Lightbulb, NotebookText, Bookmark } from "lucide-react"; // lucide-react for web

// Import your shared components
import WebHeader from '@/components/WebHeader'; // Adjust path as needed
import { Link } from 'expo-router'
import WebFooter from '@/components/WebFooter';



// Assuming SimpleWebFooter is defined in a shared place or directly here for this page
const SimpleWebFooter = () => (
  <View className="bg-card border-t border-border py-8 px-5 mt-10">
    <Text className="text-muted-foreground text-center text-sm">
      © {new Date().getFullYear()} BookClub. All rights reserved.
    </Text>
  </View>
);


// Feature data (unchanged)
const features = [
  {
    icon: <Users className="h-8 w-8 text-primary-dark" />, // Using text-primary-dark for theme consistency
    title: "Seamless Club Management",
    description: "Create and manage public, private, or secret book clubs with ease. Invite members, set privacy, and keep your literary circle organized.",
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary-dark" />,
    title: "Dynamic Book Selection",
    description: "Suggest new reads to your club, see what others are interested in, and let admins effortlessly pick the next book for discussion.",
  },
  {
    icon: <NotebookText className="h-8 w-8 text-primary-dark" />,
    title: "Private Notes, Public Discussion",
    description: "Jot down your thoughts and questions privately as you read. On meeting day, reveal your insights for a rich, engaging club discussion.",
  },
  {
    icon: <Bookmark className="h-8 w-8 text-primary-dark" />,
    title: "Personal Reading Journey",
    description: "Track books you're currently reading, build your 'want to read' list, and log all your finished books with personal ratings.",
  },
];

export default function LandingPage() {
  return (
    // Outer-most container should be a View or div for flex-1 and min-h-screen
    <View className="flex-1 min-h-screen flex flex-col bg-background">
      {/* Use the WebHeader component we've already built */}
      {/* isLoggedIn is set to false as this page is for unauthenticated users */}
      <WebHeader />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background
            
            bg-background border border-border rounded-lg shadow-sm 
            ">
            {/* p-6 flex  */}
            {/* flex-col items-center text-center */}
            {/* "> */}
            <div className="container mx-auto px-4 md:px-6"> {/* Using div for semantic container */}
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="font-merriweather-bold text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-foreground">
                      Discover Your Next Favorite Book, Together.
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      BookClub is the perfect place to join book clubs, discuss your favorite reads, and find a community of fellow literature lovers.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                      {/* Using regular HTML Button for main CTA, as it's not part of header nav */}
                      {/* Link from expo-router and Button from shadcn/ui are still preferred if interactive */}
                      {/* If you want this to use your shared AuthButton component, you would import it here. */}
                      {/* For simplicity and demonstrating conversion, I'm using a direct Link with styling */}
                      <Link href="/signup" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-8 py-2 md:h-12 md:px-10 md:py-3
                                                    bg-primary-dark text-primary-foreground hover:bg-primary-dark/90
                                                    font-inter-semibold">
                          Join a Club Today <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                  </div>
                </div>
                {/* Replaced next/image with standard <img> tag for web-only */}
                <img
                  src="https://placehold.co/600x400.png" // Placeholder image
                  alt="People reading books together"
                  width={600} // Explicit width for rendering, can be overridden by Tailwind
                  height={400} // Explicit height for rendering
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-card">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-merriweather-bold tracking-tighter sm:text-5xl text-foreground">Why You'll Love BookClub</h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    We've built BookClub to be the ultimate companion for every book lover and book club.
                  </p>
                </div>
              </div>
              <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
                {features.map((feature) => (
                  // Shadcn Card component is already compatible
                  <div key={feature.title} className="bg-background border border-border rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
                    <div className="flex flex-col items-center text-center"> {/* Mimicking CardHeader structure */}
                      {feature.icon}
                      <h3 className="font-merriweather-bold text-xl mt-4 text-foreground">{feature.title}</h3>
                    </div>
                    <div className="text-center mt-4"> {/* Mimicking CardContent structure */}
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </ScrollView>

      {/* Use the SimpleWebFooter component */}
      {/* <SimpleWebFooter /> */}
      <WebFooter/>
    </View>
  );
}