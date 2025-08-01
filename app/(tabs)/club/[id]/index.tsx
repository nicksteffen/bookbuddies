// 'use client';
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
  Platform,
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
  BookMarked,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/lib/utils/useAlert';
import Members from '@/components/clubPage/Members';
import CurrentBookSection from '@/components/clubPage/CurrentBookSection';
import BookSelectionModal from '@/components/BookSelectionModal';
import { ClubDetails } from '@/types/club';
import MeetingsModal from '@/components/clubPage/MeetingsModal';
import MeetingsDialog from '@/components/clubPage/MeetingsDialog';
import BookSelection from '@/components/BookSelection';
import MeetingScheduler from '@/components/clubPage/MeetingScheduler';
import { createOrGetBook } from '@/lib/utils/library';

export interface Meeting {
  id?: string;
  title: string;
  date_time: string;
  location: string | null;
  virtual_link: string | null;
  created_by?: string;
}

export default function ClubDetailScreen() {
  const { showAlert } = useAlert();

  const { id: bookClubId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);

  const [meetingForm, setMeetingForm] = useState({
    id: '',
    title: '',
    date_time: '',
    location: '',
    virtual_link: '',
    created_by: '',
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

  const handleEditMeeting = (meeting: Meeting) => {
    // Implement logic to edit meeting
    // TODO need to pass a meeting object to the modal
    // refactor to have setMeetingData instead of form, then,
    // only use the form in the modal
    setMeetingForm({
      id: meeting?.id || '',
      title: meeting?.title,
      date_time: meeting?.date_time,
      location: meeting?.location || '',
      virtual_link: meeting?.virtual_link || '',
      created_by: meeting?.created_by || '',
    });
    setShowMeetingScheduler(true);
  };

  const setCurrentBook = async (bookData: any) => {
    try {
      const bookId = await createOrGetBook(bookData);

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
          status: 'reading_now',
          notes_revealed: false,
        },
        {
          onConflict: 'club_id,book_id', // Specify the unique constraint columns
          ignoreDuplicates: false, // This ensures the row is updated if it exists
        },
      );

      if (clubBookError) throw clubBookError;

      loadClubDetails();
      showAlert('Success', 'Current book updated!');
    } catch (error: any) {
      showAlert('Error', error.message);
    }
  };

  const createMeeting = async (meetingForm: {
    title: any;
    date_time: any;
    location: any;
    virtual_link: any;
    id?: string; // Add optional id to handle updating an existing meeting
  }) => {
    if (!meetingForm.title || !meetingForm.date_time) {
      showAlert('Error', 'Please fill in title and date/time');
      return;
    }

    try {
      const { error } = await supabase.from('club_meetings').upsert({
        ...meetingForm, // Use spread operator to include optional id for updating
        club_id: bookClubId,
        created_by: user?.id!,
      });

      if (error) throw error;

      setShowMeetingScheduler(false);
      // todo; instead of setMeetingForm, set the meeting data, but with no id or user
      setMeetingForm({
        id: '',
        title: '',
        date_time: '',
        location: '',
        virtual_link: '',
        created_by: '',
      });
      loadMeetings();
      showAlert('Success', 'Meeting scheduled/updated!');
    } catch (error: any) {
      showAlert('Error', error.message);
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Club Header */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                {club.name}
              </Text>
              {club.description && (
                <Text className="text-base text-gray-600 mb-3">
                  {club.description}
                </Text>
              )}
            </View>
            <Link href={`/club/${club.id}/library`} className="text-blue-500">
              <TouchableOpacity
                // className="flex-row items-center gap-2 p-2 rounded-lg bg-gray-100 active:bg-gray-200">
                className="flex-grow flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3 px-4 min-w-[150px]"
              >
                <BookMarked size={16} color="black" />
                <Text className="text-lg font-semibold text-white">
                  {' '}
                  View Library
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

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

        {/* Meetings Section */}
        <View className="mb-6">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">
              Upcoming Meetings
            </Text>
            {isAdmin && (
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowMeetingScheduler(true)}
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
                  <TouchableOpacity onPress={() => handleEditMeeting(meeting)}>
                    <Text className="text-sm text-blue-500">
                      📝 Edit Meeting
                    </Text>
                  </TouchableOpacity>
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

      <MeetingScheduler
        showMeetingScheduler={showMeetingScheduler}
        onClose={() => setShowMeetingScheduler(false)}
        createMeeting={createMeeting}
        initialMeetingData={meetingForm}
      />

      <BookSelection
        isVisible={showBookModal}
        onClose={() => setShowBookModal(false)}
        onBookSelected={setCurrentBook}
        modalTitle="Select Current Book"
      />
    </SafeAreaView>
  );
}
function createOrUpdateBook(bookData: any) {
  throw new Error('Function not implemented.');
}
