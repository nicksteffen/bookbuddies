import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Users } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

interface ClubWithCurrentBook {
  id: string;
  name: string;
  current_book: {
    title: string;
    author: string;
    cover_url: string | null;
  } | null;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  date_time: string;
  location: string | null;
  virtual_link: string | null;
  club: {
    name: string;
  };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [userClubs, setUserClubs] = useState<ClubWithCurrentBook[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load user's clubs with current books
      const { data: clubsData } = await supabase
        .from('club_members')
        .select(`
          club_id,
          book_clubs!inner (
            id,
            name,
            current_book_id,
            books (
              title,
              author,
              cover_url
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'approved');

      if (clubsData) {
        const clubs = clubsData.map((item: any) => ({
          id: item.book_clubs.id,
          name: item.book_clubs.name,
          current_book: item.book_clubs.books || null,
        }));
        setUserClubs(clubs);
      }

      // Load upcoming meetings
      const { data: meetingsData } = await supabase
        .from('club_meetings')
        .select(`
          id,
          title,
          date_time,
          location,
          virtual_link,
          book_clubs!inner (
            name
          )
        `)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })
        .limit(3);

      if (meetingsData) {
        const meetings = meetingsData.map((meeting: any) => ({
          ...meeting,
          club: { name: meeting.book_clubs.name },
        }));
        setUpcomingMeetings(meetings);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Your reading dashboard</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Clubs</Text>
            <TouchableOpacity onPress={() => router.push('/clubs')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {userClubs.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No clubs yet</Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => router.push('/clubs')}
              >
                <Text style={styles.primaryButtonText}>Join Your First Club</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.horizontalList}>
                {userClubs.map((club) => (
                  <TouchableOpacity 
                    key={club.id} 
                    style={styles.clubCard}
                    onPress={() => router.push(`/club/${club.id}`)}
                  >
                    <Text style={styles.clubName}>{club.name}</Text>
                    {club.current_book ? (
                      <View style={styles.bookInfo}>
                        {club.current_book.cover_url ? (
                          <Image
                            source={{ uri: club.current_book.cover_url }}
                            style={styles.bookCover}
                          />
                        ) : (
                          <View style={styles.placeholderCover}>
                            <Text style={styles.placeholderText}>📚</Text>
                          </View>
                        )}
                        <Text style={styles.bookTitle} numberOfLines={2}>
                          {club.current_book.title}
                        </Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>
                          {club.current_book.author}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.noBookInfo}>
                        <Text style={styles.noBookText}>No current book</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
          {upcomingMeetings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Calendar size={24} color="#9CA3AF" />
              <Text style={styles.emptyCardText}>No upcoming meetings</Text>
            </View>
          ) : (
            <View style={styles.meetingsList}>
              {upcomingMeetings.map((meeting) => (
                <TouchableOpacity key={meeting.id} style={styles.meetingCard}>
                  <View style={styles.meetingHeader}>
                    <Text style={styles.meetingTitle}>{meeting.title}</Text>
                    <Text style={styles.meetingClub}>{meeting.club.name}</Text>
                  </View>
                  <View style={styles.meetingDetails}>
                    <View style={styles.meetingDetail}>
                      <Calendar size={16} color="#6B7280" />
                      <Text style={styles.meetingDetailText}>
                        {formatDate(meeting.date_time)}
                      </Text>
                    </View>
                    {(meeting.location || meeting.virtual_link) && (
                      <View style={styles.meetingDetail}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.meetingDetailText}>
                          {meeting.location || 'Virtual Meeting'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  horizontalList: {
    flexDirection: 'row',
    gap: 16,
  },
  clubCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  bookInfo: {
    alignItems: 'center',
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeholderCover: {
    width: 80,
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 32,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  noBookInfo: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noBookText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  meetingsList: {
    gap: 12,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meetingHeader: {
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  meetingClub: {
    fontSize: 14,
    color: '#6B7280',
  },
  meetingDetails: {
    gap: 4,
  },
  meetingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meetingDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCardText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});