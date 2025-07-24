'use client';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import {
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  CreditCard as Edit,
  UserMinus,
  Crown,
  MessageSquare,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { searchBooks } from '@/lib/api';
import Members from '@/components/clubPage/Members';
import CurrentBookSection from '@/components/clubPage/CurrentBookSection';
import BookSelectionModal from '@/components/clubPage/BookSelectionModal';
import { ClubDetails } from '@/types/club';

interface Member {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
  profiles: {
    display_name: string | null;
    email: string;
  };
}

interface UserNotes {
  id: string;
  notes: string;
  questions: string | null;
  updated_at: string;
}

interface Meeting {
  id: string;
  title: string;
  date_time: string;
  location: string | null;
  virtual_link: string | null;
  created_by: string;
}

export default function ClubDetailScreen() {
  // console.log('loading page correctly');

  const { id: bookClubId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  // const router = useRouter();

  const [club, setClub] = useState<ClubDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userNotes, setUserNotes] = useState<UserNotes | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  // Form states
  // const [bookSearch, setBookSearch] = useState('');
  // const [bookResults, setBookResults] = useState<any[]>([]);
  // const [searching, setSearching] = useState(false);

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date_time: '',
    location: '',
    virtual_link: '',
  });

  useEffect(() => {
    if (bookClubId && user) {
      loadClubDetails();
      loadMeetings();
    }
  }, [bookClubId, user]);

  const loadClubDetails = async () => {
    console.log('parent load clubn detials');
    try {
      const { data: currentClub, error: currentClubError } = await supabase
        .from('book_clubs')
        .select(
          ` *,
          books (
            id,
            title,
            author,
            cover_url,
            synopsis,
            page_count
          ),
          club_books(
            id,
            notes_revealed,
            average_rating,
            book_id
          )
        `,
        )
        .eq('id', bookClubId)
        .single();

      if (currentClubError && currentClubError.code != 'PGRST116') {
        throw currentClubError;
      }

      setClub({
        ...currentClub,
        current_book: currentClub.books,
        current_club_book: currentClub.club_books,
      });

      setIsAdmin(currentClub.admin_user_id === user?.id);

      // Check if user is a member
      const { data: memberData } = await supabase
        .from('club_members')
        .select('status')
        .eq('club_id', bookClubId)
        .eq('user_id', user?.id)
        .single();

      setIsMember(memberData?.status === 'approved');
    } catch (error) {
      console.error('Error loading club details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetings = async () => {
    try {
      const { data } = await supabase
        .from('club_meetings')
        .select('*')
        .eq('club_id', bookClubId)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      if (data) {
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const setCurrentBook = async (bookData: any) => {
    try {
      // First, create or get the book
      let bookId = null;
      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('title', bookData.title)
        .eq('author', bookData.author)
        .single();

      if (existingBook) {
        bookId = existingBook.id;
      } else {
        const { data: newBook, error: bookError } = await supabase
          .from('books')
          .insert({
            title: bookData.title,
            author: bookData.author,
            isbn: bookData.isbn,
            cover_url: bookData.cover_url,
            synopsis: bookData.synopsis,
            page_count: bookData.page_count,
          })
          .select('id')
          .single();

        if (bookError) throw bookError;
        bookId = newBook.id;
      }

      // Update club's current book
      const { error: clubError } = await supabase
        .from('book_clubs')
        .update({ current_book_id: bookId })
        .eq('id', bookClubId);
      // todo should set previous book not current

      if (clubError) throw clubError;

      // Create club_books entry
      const { error: clubBookError } = await supabase.from('club_books').upsert(
        {
          club_id: bookClubId,
          book_id: bookId,
          status: 'current',
          notes_revealed: false,
        },
        {
          onConflict: 'club_id,book_id', // Specify the unique constraint columns
          ignoreDuplicates: false, // This ensures the row is updated if it exists
        },
      );

      if (clubBookError) throw clubBookError;

      // setShowBookModal(false);
      // setBookSearch('');
      // setBookResults([]);
      loadClubDetails();
      Alert.alert('Success', 'Current book updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const createMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date_time) {
      Alert.alert('Error', 'Please fill in title and date/time');
      return;
    }

    try {
      const { error } = await supabase.from('club_meetings').insert({
        club_id: bookClubId,
        title: meetingForm.title,
        date_time: meetingForm.date_time,
        location: meetingForm.location || null,
        virtual_link: meetingForm.virtual_link || null,
        created_by: user?.id!,
      });

      if (error) throw error;

      setShowMeetingModal(false);
      setMeetingForm({
        title: '',
        date_time: '',
        location: '',
        virtual_link: '',
      });
      loadMeetings();
      Alert.alert('Success', 'Meeting scheduled!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="rgb(59, 130, 246)" />
          {/* blue-500 */}
        </View>
      </SafeAreaView>
    );
  }

  if (!club) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-red-500">Club not found!</Text>
        </View>
      </SafeAreaView>
    );
  }

  // const notesRevealed = club.club_books?.[0]?.notes_revealed || false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Club Header */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {club.name}
          </Text>
          {club.description && (
            <Text className="text-base text-gray-600 mb-3">
              {club.description}
            </Text>
          )}
          {isAdmin && (
            <View className="flex flex-row items-center gap-1.5 self-start">
              <Crown size={16} color="rgb(245, 158, 11)" />
              {/* amber-500 */}
              <Text className="text-sm text-amber-500 font-semibold">
                Admin
              </Text>
            </View>
          )}
        </View>

        <CurrentBookSection
          showBookModal={() => setShowBookModal(true)}
          loadClubDetails={loadClubDetails}
          club={club}
          isAdmin={isAdmin}
          isMember={isMember}
        />
        <Link href={`/club/${bookClubId}/book/${club.current_book_id}`} asChild>
          <TouchableOpacity>
            <Text>View Club Page!!</Text>
          </TouchableOpacity>
        </Link>

        {/* Meetings Section */}
        <View className="mb-6">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">
              Upcoming Meetings
            </Text>
            {isAdmin && (
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowMeetingModal(true)}
              >
                <Plus size={16} color="rgb(59, 130, 246)" />
                {/* blue-500 */}
              </TouchableOpacity>
            )}
          </View>

          {meetings.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center shadow-md">
              <Calendar size={24} color="rgb(156, 163, 175)" />
              {/* gray-400 */}
              <Text className="text-sm text-gray-400 mt-2">
                No upcoming meetings
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {meetings.map((meeting) => (
                <View
                  key={meeting.id}
                  className="bg-white rounded-xl p-4 shadow-md"
                >
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {meeting.title}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    {formatDate(meeting.date_time)}
                  </Text>
                  {meeting.location && (
                    <Text className="text-sm text-gray-600 mb-0.5">
                      📍 {meeting.location}
                    </Text>
                  )}
                  {meeting.virtual_link && (
                    <Text className="text-sm text-blue-500">
                      🔗 Virtual Meeting
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {isAdmin && (
          <Members
            initialClub={club}
            bookClubId={bookClubId}
            isAdmin={isAdmin}
          />
        )}
      </ScrollView>

      {/* Meeting Creation Modal */}
      <Modal
        visible={showMeetingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowMeetingModal(false)}>
              <Text className="text-base text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Schedule Meeting
            </Text>
            <TouchableOpacity onPress={createMeeting}>
              <Text className="text-base text-blue-500 font-semibold">
                Create
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5">
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Meeting Title *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                placeholder="e.g., Book Discussion"
                value={meetingForm.title}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, title: text })
                }
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Date & Time *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                placeholder="YYYY-MM-DD HH:MM"
                value={meetingForm.date_time}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, date_time: text })
                }
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Location
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                placeholder="Physical location"
                value={meetingForm.location}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, location: text })
                }
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">
                Virtual Link
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                placeholder="Zoom, Meet, etc."
                value={meetingForm.virtual_link}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, virtual_link: text })
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <BookSelectionModal
        isVisible={showBookModal}
        onClose={() => setShowBookModal(false)}
        onBookSelected={setCurrentBook}
        modalTitle="Select Current Book"
      />
    </SafeAreaView>
  );
}
