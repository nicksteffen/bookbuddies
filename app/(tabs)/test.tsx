"use client"
import { Platform , View, Text} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';

import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config'; // Adjust this path if your tailwind.config.js is not in the project root
import { useAuth } from "@/contexts/AuthContext";

// Resolve the full Tailwind config to access theme colors directly for icons and dynamic styles
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors; // Use 'any' for simpler access to nested colors

export default function Test() {
  const { user } = useAuth();
  if (Platform.OS !== "web") {
    return (
      <SafeAreaView>
        
      
      <View>
        <Text 
          className="text-lg font-bold color-red-500"
        > Tester page</Text>
        
      </View>
      </SafeAreaView>
    )
  }
  return (
    
    <div>
      <h1>Test Page</h1>
    </div>
  );
}