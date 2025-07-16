import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Users, Lock, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

// Import NativeWind's utility to resolve your Tailwind config
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config'; // Adjust this path if your tailwind.config.js is not in the project root

// Resolve the full Tailwind config to access theme colors directly for icons and dynamic styles
const fullConfig = resolveConfig(tailwindConfig);
const colors: any = fullConfig.theme.colors; // Use 'any' for simpler access to nested colors

interface Club {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  admin_user_id: string;
  member_count?: number;
  user_status?: 'member' | 'pending' | 'none';
}

export default function ClubsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    privacy: 'public' as 'public' | 'private' | 'secret',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadClubs();
  }, [user]);

  const loadClubs = async () => {
    try {
      const { data: clubsData } = await supabase
        .from('book_clubs')
        .select(`
          *,
          club_members!left (count)
        `)
        .in('privacy', ['public', 'private'])
        .order('created_at', { ascending: false });

      const { data: membershipData } = await supabase
        .from('club_members')
        .select('club_id, status')
        .eq('user_id', user?.id);

      const { data: myClubsData } = await supabase
        .from('club_members')
        .select(`
          club_id,
          status,
          book_clubs!inner (*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'approved');

      if (clubsData && membershipData) {
        const membershipMap = membershipData.reduce((acc, membership) => {
          acc[membership.club_id] = membership.status;
          return acc;
        }, {} as Record<string, string>);

        const enrichedClubs = clubsData.map((club) => ({
          ...club,
          member_count: club.club_members?.[0]?.count || 0,
          user_status: membershipMap[club.id] === 'approved' ? 'member' :
                       membershipMap[club.id] === 'pending' ? 'pending' : 'none',
        }));

        setClubs(enrichedClubs);
      }

      if (myClubsData) {
        const userClubs = myClubsData.map((item: any) => item.book_clubs);
        setMyClubs(userClubs);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createClub = async () => {
    if (!newClub.name.trim()) {
      Alert.alert('Error', 'Please enter a club name');
      return;
    }

    setCreating(true);
    try {
      const { data: clubData, error: clubError } = await supabase
        .from('book_clubs')
        .insert({
          name: newClub.name.trim(),
          description: newClub.description.trim() || null,
          privacy: newClub.privacy,
          admin_user_id: user?.id!,
        })
        .select()
        .single();

      if (clubError) throw clubError;

      const { error: memberError } = await supabase
        .from('club_members')
        .insert({
          club_id: clubData.id,
          user_id: user?.id!,
          status: 'approved',
        });

      if (memberError) throw memberError;

      setShowCreateModal(false);
      setNewClub({ name: '', description: '', privacy: 'public' });
      loadClubs();
      Alert.alert('Success', 'Club created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const joinClub = async (clubId: string, privacy: string) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: user?.id!,
          status: privacy === 'public' ? 'approved' : 'pending',
        });

      if (error) throw error;

      const message = privacy === 'public' 
        ? 'Successfully joined the club!'
        : 'Request sent! Waiting for admin approval.';
      
      Alert.alert('Success', message);
      loadClubs();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const leaveClub = async (clubId: string) => {
    Alert.alert(
      'Leave Club',
      'Are you sure you want to leave this club?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('club_members')
                .delete()
                .eq('club_id', clubId)
                .eq('user_id', user?.id);

              if (error) throw error;

              Alert.alert('Success', 'Left the club successfully');
              loadClubs();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return <Users size={16} color={colors.emerald[500]} />;
      case 'private':
        return <Lock size={16} color={colors.amber[500]} />;
      case 'secret':
        return <EyeOff size={16} color={colors.red[500]} />;
      default:
        return <Users size={16} color={colors.muted.foreground} />;
    }
  };

  const getPrivacyLabel = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'Public';
      case 'private':
        return 'Private';
      case 'secret':
        return 'Secret';
      default:
        return 'Public';
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return colors.emerald[500];
      case 'private':
        return colors.amber[500];
      case 'secret':
        return colors.red[500];
      default:
        return colors.muted.foreground;
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-5 py-4 bg-card border-b border-border">
        <Text className="text-2xl font-merriweather-bold text-foreground">Book Clubs</Text>
        <TouchableOpacity
          className="bg-primary rounded-full w-10 h-10 justify-center items-center"
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color={colors.primary.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="p-5">
        {myClubs.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-inter-semibold text-foreground mb-4">My Clubs</Text>
            <View className="gap-3">
              {myClubs.map((club) => (
                <TouchableOpacity 
                  key={club.id} 
                  className="bg-card rounded-lg p-4 shadow-md"
                  onPress={() => router.push(`/club/${club.id}`)}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-3">
                      <Text className="text-base font-inter-semibold text-foreground mb-1">{club.name}</Text>
                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                          {getPrivacyIcon(club.privacy)}
                          <Text className="text-xs font-inter-medium" style={{ color: getPrivacyColor(club.privacy) }}>
                            {getPrivacyLabel(club.privacy)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="bg-destructive rounded-lg px-4 py-2"
                      onPress={() => leaveClub(club.id)}
                    >
                      <Text className="text-destructive-foreground text-sm font-inter-semibold">Leave</Text>
                    </TouchableOpacity>
                  </View>
                  {!!club.description && (
                    <Text className="text-sm text-muted-foreground mt-2">{club.description}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View className="mb-8">
          <Text className="text-lg font-inter-semibold text-foreground mb-4">Discover Clubs</Text>
          
          <View className="flex-row items-center bg-card rounded-lg px-4 py-3 mb-4 gap-3 shadow-sm">
            <Search size={20} color={colors.muted.foreground} />
            <TextInput
              className="flex-1 text-base text-foreground"
              placeholder="Search clubs..."
              placeholderTextColor={colors.muted.foreground} // Added placeholder color
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View className="gap-3">
            {filteredClubs.map((club) => (
              <TouchableOpacity 
                key={club.id} 
                className="bg-card rounded-lg p-4 shadow-md"
                onPress={() => router.push(`/club/${club.id}`)}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-base font-inter-semibold text-foreground mb-1">{club.name}</Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        {getPrivacyIcon(club.privacy)}
                        <Text className="text-xs font-inter-medium" style={{ color: getPrivacyColor(club.privacy) }}>
                          {getPrivacyLabel(club.privacy)}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        {club.member_count} member{club.member_count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  
                  {club.user_status === 'none' && (
                    <TouchableOpacity
                      className="bg-primary rounded-lg px-4 py-2"
                      onPress={() => joinClub(club.id, club.privacy)}
                    >
                      <Text className="text-primary-foreground text-sm font-inter-semibold">
                        {club.privacy === 'public' ? 'Join' : 'Request'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {club.user_status === 'pending' && (
                    <View className="bg-amber-500 rounded-lg px-4 py-2"> {/* Used bg-amber-500 */}
                      <Text className="text-white text-sm font-inter-semibold">Pending</Text>
                    </View>
                  )}
                  
                  {club.user_status === 'member' && (
                    <View className="bg-emerald-500 rounded-lg px-4 py-2"> {/* Used bg-emerald-500 */}
                      <Text className="text-white text-sm font-inter-semibold">Member</Text>
                    </View>
                  )}
                </View>
                
                {!!club.description && (
                  <Text className="text-sm text-muted-foreground mt-2">{club.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-border">
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text className="text-base text-muted-foreground">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-inter-semibold text-foreground">Create Club</Text>
            <TouchableOpacity
              onPress={createClub}
              disabled={creating}
            >
              <Text className={`text-base font-inter-semibold ${creating ? 'text-muted-foreground' : 'text-primary'}`}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5">
            <View className="mb-6">
              <Text className="text-base font-inter-semibold text-foreground mb-2">Club Name *</Text>
              <TextInput
                className="border border-border rounded-lg p-4 text-base bg-input text-foreground"
                placeholder="Enter club name"
                placeholderTextColor={colors.muted.foreground}
                value={newClub.name}
                onChangeText={(text) => setNewClub({ ...newClub, name: text })}
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-inter-semibold text-foreground mb-2">Description</Text>
              <TextInput
                className="border border-border rounded-lg p-4 text-base bg-input h-20 text-foreground text-top"
                placeholder="Describe your club..."
                placeholderTextColor={colors.muted.foreground}
                value={newClub.description}
                onChangeText={(text) => setNewClub({ ...newClub, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-inter-semibold text-foreground mb-2">Privacy Setting</Text>
              <View className="gap-3">
                {(['public', 'private', 'secret'] as const).map((privacy) => (
                  <TouchableOpacity
                    key={privacy}
                    className={`border rounded-lg p-4
                      ${newClub.privacy === privacy ? 'border-primary bg-primary/10' : 'border-border'}
                    `}
                    onPress={() => setNewClub({ ...newClub, privacy })}
                  >
                    <View className="flex-row items-center gap-2 mb-1">
                      {getPrivacyIcon(privacy)}
                      <Text className="text-base font-inter-semibold text-foreground">
                        {getPrivacyLabel(privacy)}
                      </Text>
                    </View>
                    <Text className="text-sm text-muted-foreground">
                      {privacy === 'public' && 'Anyone can join immediately'}
                      {privacy === 'private' && 'Join requests require approval'}
                      {privacy === 'secret' && 'Invite-only, not discoverable'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}