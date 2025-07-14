import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
      // Load all public and private clubs (not secret)
      const { data: clubsData } = await supabase
        .from('book_clubs')
        .select(`
          *,
          club_members!left (count)
        `)
        .in('privacy', ['public', 'private'])
        .order('created_at', { ascending: false });

      // Load user's club memberships
      const { data: membershipData } = await supabase
        .from('club_members')
        .select('club_id, status')
        .eq('user_id', user?.id);

      // Load user's own clubs (including secret ones)
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

      // Add creator as member
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
        return <Users size={16} color="#10B981" />;
      case 'private':
        return <Lock size={16} color="#F59E0B" />;
      case 'secret':
        return <EyeOff size={16} color="#EF4444" />;
      default:
        return <Users size={16} color="#6B7280" />;
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
        return '#10B981';
      case 'private':
        return '#F59E0B';
      case 'secret':
        return '#EF4444';
      default:
        return '#6B7280';
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Clubs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {myClubs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Clubs</Text>
            <View style={styles.clubsList}>
              {myClubs.map((club) => (
                <TouchableOpacity 
                  key={club.id} 
                  style={styles.clubCard}
                  onPress={() => router.push(`/club/${club.id}`)}
                >
                  <View style={styles.clubHeader}>
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubName}>{club.name}</Text>
                      <View style={styles.privacyBadge}>
                        {getPrivacyIcon(club.privacy)}
                        <Text style={[styles.privacyText, { color: getPrivacyColor(club.privacy) }]}>
                          {getPrivacyLabel(club.privacy)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.leaveButton}
                      onPress={() => leaveClub(club.id)}
                    >
                      <Text style={styles.leaveButtonText}>Leave</Text>
                    </TouchableOpacity>
                  </View>
                  {club.description && (
                    <Text style={styles.clubDescription}>{club.description}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Clubs</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clubs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.clubsList}>
            {filteredClubs.map((club) => (
              <TouchableOpacity 
                key={club.id} 
                style={styles.clubCard}
                onPress={() => router.push(`/club/${club.id}`)}
              >
                <View style={styles.clubHeader}>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <View style={styles.clubMeta}>
                      <View style={styles.privacyBadge}>
                        {getPrivacyIcon(club.privacy)}
                        <Text style={[styles.privacyText, { color: getPrivacyColor(club.privacy) }]}>
                          {getPrivacyLabel(club.privacy)}
                        </Text>
                      </View>
                      <Text style={styles.memberCount}>
                        {club.member_count} member{club.member_count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                  
                  {club.user_status === 'none' && (
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => joinClub(club.id, club.privacy)}
                    >
                      <Text style={styles.joinButtonText}>
                        {club.privacy === 'public' ? 'Join' : 'Request'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {club.user_status === 'pending' && (
                    <View style={styles.pendingButton}>
                      <Text style={styles.pendingButtonText}>Pending</Text>
                    </View>
                  )}
                  
                  {club.user_status === 'member' && (
                    <View style={styles.memberButton}>
                      <Text style={styles.memberButtonText}>Member</Text>
                    </View>
                  )}
                </View>
                
                {club.description && (
                  <Text style={styles.clubDescription}>{club.description}</Text>
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Club</Text>
            <TouchableOpacity
              onPress={createClub}
              disabled={creating}
            >
              <Text style={[styles.createText, creating && styles.disabledText]}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Club Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter club name"
                value={newClub.name}
                onChangeText={(text) => setNewClub({ ...newClub, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your club..."
                value={newClub.description}
                onChangeText={(text) => setNewClub({ ...newClub, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Privacy Setting</Text>
              <View style={styles.privacyOptions}>
                {(['public', 'private', 'secret'] as const).map((privacy) => (
                  <TouchableOpacity
                    key={privacy}
                    style={[
                      styles.privacyOption,
                      newClub.privacy === privacy && styles.privacyOptionSelected,
                    ]}
                    onPress={() => setNewClub({ ...newClub, privacy })}
                  >
                    <View style={styles.privacyOptionHeader}>
                      {getPrivacyIcon(privacy)}
                      <Text style={styles.privacyOptionTitle}>
                        {getPrivacyLabel(privacy)}
                      </Text>
                    </View>
                    <Text style={styles.privacyOptionDescription}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clubsList: {
    gap: 12,
  },
  clubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  clubInfo: {
    flex: 1,
    marginRight: 12,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  clubDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pendingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  memberButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  memberButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  createText: {
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  privacyOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  privacyOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  privacyOptionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});