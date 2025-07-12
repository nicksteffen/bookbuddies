import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CreditCard as Edit, LogOut, Settings, User, Mail } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import SignOutConfirmDialogWeb from '../../components/WebAlertDialog';

interface Profile {
  id: string;
  display_name: string | null;
  profile_picture_url: string | null;
  email: string;
}

interface UserStats {
  totalClubs: number;
  booksRead: number;
  currentlyReading: number;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalClubs: 0,
    booksRead: 0,
    currentlyReading: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setEditForm({
          display_name: data.display_name || '',
        });
      } else {
        // No profile found, create default profile data
        const defaultProfile = {
          id: user?.id || '',
          display_name: null,
          profile_picture_url: null,
          email: user?.email || '',
        };
        setProfile(defaultProfile);
        setEditForm({
          display_name: '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Load club count
      const { count: clubCount } = await supabase
        .from('club_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'approved');

      // Load books read count
      const { count: booksReadCount } = await supabase
        .from('user_book_lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('list_type', 'read');

      // Load currently reading count
      const { count: currentlyReadingCount } = await supabase
        .from('user_book_lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('list_type', 'reading_now');

      setStats({
        totalClubs: clubCount || 0,
        booksRead: booksReadCount || 0,
        currentlyReading: currentlyReadingCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateProfile = async () => {
    if (!editForm.display_name.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      setShowEditModal(false);
      loadProfile();
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS !== 'web') {
      
      
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
    } else {
        await signOut();
        router.replace('/(auth)/login');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profile.profile_picture_url ? (
                <Image 
                  source={{ uri: profile.profile_picture_url }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={40} color="#6B7280" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {profile.display_name || 'No display name'}
              </Text>
              <Text style={styles.email}>{profile.email}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Edit size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Reading Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalClubs}</Text>
              <Text style={styles.statLabel}>Clubs Joined</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.booksRead}</Text>
              <Text style={styles.statLabel}>Books Read</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.currentlyReading}</Text>
              <Text style={styles.statLabel}>Currently Reading</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Settings size={20} color="#6B7280" />
                <Text style={styles.menuItemText}>App Settings</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Mail size={20} color="#6B7280" />
                <Text style={styles.menuItemText}>Email Preferences</Text>
              </View>
            </TouchableOpacity>
            {Platform.OS === 'web' && (
            <SignOutConfirmDialogWeb onConfirmSignOut={handleSignOut}>
              <Button variant="ghost"  className="w-full flex-row items-center justify-start py-3 px-4 rounded-lg bg-transparent border border-transparent
                           "
              >
                <View className="flex-row items-center space-x-2">
                  <LogOut size={20} color="#EF4444" />
                  <Text className="text-base font-inter-semibold text-red-500">
                    Sign Out
                  </Text>
                </View>
              </Button>
            </SignOutConfirmDialogWeb>
            )}
            {Platform.OS !== 'web' && (
              
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <View style={styles.menuItemLeft}>
                <LogOut size={20} color="#EF4444" />
                <Text style={[styles.menuItemText, styles.signOutText]}>
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={updateProfile}
              disabled={updating}
            >
              <Text style={[styles.saveText, updating && styles.disabledText]}>
                {updating ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your display name"
                value={editForm.display_name}
                onChangeText={(text) => setEditForm({ ...editForm, display_name: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={profile.email}
                editable={false}
              />
              <Text style={styles.helpText}>
                Email cannot be changed from the app
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuSection: {
    marginBottom: 32,
  },
  menuItems: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  signOutText: {
    color: '#EF4444',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});