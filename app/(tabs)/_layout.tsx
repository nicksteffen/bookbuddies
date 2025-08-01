import WebFooter from '@/components/WebFooter';
import WebHeader from '@/components/WebHeader';
import { Slot, Tabs } from 'expo-router';
import { HomeIcon as Home, Users, Library, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <>
        <WebHeader />
        <Slot />
        <WebFooter />
      </>
    );
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ size, color }) => (
            <Library size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="test"
        options={
          {
            // href: null
          }
        }
      />
      <Tabs.Screen
        name="club"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
