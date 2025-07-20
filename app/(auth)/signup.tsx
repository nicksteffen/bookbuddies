import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert, // Keep Alert for native platform
  ActivityIndicator, // For loading state on button
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import { SafeAreaView } from 'react-native-safe-area-context'; // For overall layout safety

// Import shadcn/ui components for web AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  // AlertDialogTrigger is not needed here as we control 'open' directly
} from '@/components/ui/alert-dialog'; // Adjust path as needed
import { Button } from '@/components/ui/button'; // Assuming this is your shadcn Button for web

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  // State for AlertDialog (for web platform)
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertDialogTitle, setAlertDialogTitle] = useState('');
  const [alertDialogDescription, setAlertDialogDescription] = useState('');

  // Helper function to display alerts/dialogs based on platform
  const showAlert = (title: string, description: string) => {
    if (Platform.OS === 'web') {
      setAlertDialogTitle(title);
      setAlertDialogDescription(description);
      setShowAlertDialog(true);
    } else {
      Alert.alert(title, description);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, displayName);
    setLoading(false);

    if (error) {
      showAlert('Error', error.message);
    } else {
      router.replace('/(tabs)'); // Navigate to the main app after successful signup
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1" // `flex-1` ensures it takes full height
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center p-6" // `flex-grow` for scrollable content to fill space, `justify-center` to center vertically
          keyboardShouldPersistTaps="handled" // Prevents keyboard from dismissing on touch outside TextInput
        >
          <View className="w-full max-w-md mx-auto"> {/* Constrain width for better readability on large screens */}
            <Text className="text-3xl font-bold text-gray-800 text-center mb-2">Join Book Club</Text>
            <Text className="text-base text-gray-500 text-center mb-12">Create your account to get started</Text>

            <View className="gap-4"> {/* Spacing between form elements */}
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Display Name"
                placeholderTextColor="#9CA3AF" // Consistent placeholder color
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />

              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 focus:border-blue-500 focus:ring-1 focus-ring-blue-500"
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              {/* Platform-specific button rendering */}
              {Platform.OS !== 'web' ? (
                <TouchableOpacity
                  className={`bg-emerald-600 rounded-xl p-4 items-center mt-2 active:bg-emerald-700 ${loading ? 'opacity-70' : ''}`}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-white text-base font-semibold">Sign Up</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <Button // Using shadcn Button for web
                  className={`bg-emerald-600 rounded-xl p-4 items-center mt-2 hover:bg-emerald-700 ${loading ? 'opacity-70' : ''}`}
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-white text-base font-semibold">Sign Up</Text>
                  )}
                </Button>
              )}
            </View>

            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-base text-gray-500">Already have an account? </Text>
              <Link href="/(auth)/login" className="ml-1">
                <Text className="text-base text-emerald-600 font-semibold">Sign In</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* AlertDialog for web errors/messages */}
      {Platform.OS === 'web' && (
        <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>{alertDialogDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowAlertDialog(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SafeAreaView>
  );
}
