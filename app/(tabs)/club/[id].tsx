"use client"
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
import { useLocalSearchParams, useRouter } from 'expo-router';
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

interface ClubDetails {
  id: string;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  admin_user_id: string;
  current_book_id: string | null;
  created_at: string;
  current_book?: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
    synopsis: string | null;
    page_count: number | null;
  } | null;
  club_books?: {
    id: string;
    notes_revealed: boolean;
    average_rating: number | null;
    book_id: string;
  }[];
}

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
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date_time: '',
    location: '',
    virtual_link: '',
  });

  const [notesForm, setNotesForm] = useState({
    notes: '',
    questions: '',
  });

  useEffect(() => {
    // console.log('in useEffect');
    // console.log(bookClubId && user);
    if (bookClubId && user) {
      loadClubDetails();
      // loadUserNotes();
      loadMeetings();
    }
  }, [bookClubId, user]);

  const loadClubDetails = async () => {
    console.log("parent load clubn detials")
    try {
      const { data: testData, error: testError } = await supabase
        .from('book_clubs')
        .select('*');

      const { data: currentClub, error: currentClubError } = await supabase
        .from('book_clubs')
        .select(
          `
          *,
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

  const loadUserNotes = async () => {
    console.log(club)
    if (!club?.current_book_id) return;

    try {
      const { data: clubBookData } = await supabase
        .from('club_books')
        .select('id')
        .eq('club_id', bookClubId)
        .eq('book_id', club.current_book_id)
        .single();

      console.log(clubBookData)
      console.log(clubBookData)

      if (clubBookData) {
        const { data } = await supabase
          .from('user_book_notes')
          .select('*')
          .eq('user_id', user?.id)
          .eq('club_book_id', clubBookData.id)
          .single();

        if (data) {
          setUserNotes(data);
          setNotesForm({
            notes: data.notes,
            questions: data.questions || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user notes:', error);
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

  const searchForBooks = async () => {
    if (!bookSearch.trim()) return;

    setSearching(true);
    try {
      const results = await searchBooks(bookSearch);
      setBookResults(results);
    } catch (error) {
      Alert.alert('Error', 'Failed to search books');
    } finally {
      setSearching(false);
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

      if (clubError) throw clubError;

      // Create club_books entry
      const { error: clubBookError } = await supabase
        .from('club_books')
        .insert({
          club_id: bookClubId,
          book_id: bookId,
          status: 'current',
          notes_revealed: false,
        });

      if (clubBookError) throw clubBookError;

      setShowBookModal(false);
      setBookSearch('');
      setBookResults([]);
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

  const saveNotes = async () => {
    if (!club?.current_book_id) return;

    try {
      const { data: clubBookData } = await supabase
        .from('club_books')
        .select('id')
        .eq('club_id', bookClubId)
        .eq('book_id', club.current_book_id)
        .single();

      if (!clubBookData) return;

      if (userNotes) {
        // Update existing notes
        const { error } = await supabase
          .from('user_book_notes')
          .update({
            notes: notesForm.notes,
            questions: notesForm.questions || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userNotes.id);

        if (error) throw error;
      } else {
        // Create new notes
        const { error } = await supabase.from('user_book_notes').insert({
          user_id: user?.id!,
          club_book_id: clubBookData.id,
          notes: notesForm.notes,
          questions: notesForm.questions || null,
        });

        if (error) throw error;
      }

      setShowNotesModal(false);
      loadUserNotes();
      Alert.alert('Success', 'Notes saved!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const revealNotes = async () => {
    if (!club?.current_book_id) return;

    Alert.alert(
      'Reveal Notes & Questions',
      'This will make all member notes and questions visible to everyone in the club. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reveal',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('club_books')
                .update({ notes_revealed: true })
                .eq('club_id', bookClubId)
                .eq('book_id', club.current_book_id);

              if (error) throw error;

              loadClubDetails();
              Alert.alert('Success', 'Notes and questions revealed!');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
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
          <ActivityIndicator size="large" color="rgb(59, 130, 246)" />{/* blue-500 */}
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

  const notesRevealed = club.club_books?.[0]?.notes_revealed || false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Club Header */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-md">
          <Text className="text-2xl font-bold text-gray-800 mb-2">{club.name}</Text>
          {club.description && (
            <Text className="text-base text-gray-600 mb-3">{club.description}</Text>
          )}
          {isAdmin && (
            <View className="flex flex-row items-center gap-1.5 self-start">
              <Crown size={16} color="rgb(245, 158, 11)" />{/* amber-500 */}
              <Text className="text-sm text-amber-500 font-semibold">Admin</Text>
            </View>
          )}
        </View>

        <CurrentBookSection loadClubDetails={loadClubDetails} initialClub={club} isAdmin={isAdmin} isMember={isMember} bookClubId={club.id} />

        {/* Current Book Section */}
        <View className="mb-6">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">Current Book</Text>
            {isAdmin && (
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowBookModal(true)}
              >
                <Edit size={16} color="rgb(59, 130, 246)" />{/* blue-500 */}
              </TouchableOpacity>
            )}
          </View>

          {club.current_book ? (
            <View className="bg-white rounded-xl p-4 shadow-md">
              <View className="flex flex-row gap-4 mb-4">
                {club.current_book.cover_url ? (
                  <Image
                    source={{ uri: club.current_book.cover_url }}
                    className="w-20 h-30 rounded-lg"
                  />
                ) : (
                  <View className="w-20 h-30 bg-gray-200 rounded-lg justify-center items-center">
                    <Text className="text-3xl">📚</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-800 mb-1">
                    {club.current_book.title}
                  </Text>
                  <Text className="text-base text-gray-600 mb-2">
                    {club.current_book.author}
                  </Text>
                  {club.current_book.page_count && (
                    <Text className="text-sm text-gray-400 mb-2">
                      {club.current_book.page_count} pages
                    </Text>
                  )}
                  {club.current_book.synopsis && (
                    <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
                      {club.current_book.synopsis}
                    </Text>
                  )}
                </View>
              </View>

              {isMember && (
                <View className="flex flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-2 bg-amber-600 rounded-lg py-3"
                    onPress={() => setShowNotesModal(true)}
                  >
                    <MessageSquare size={16} color="rgb(255, 255, 255)" />{/* white */}
                    <Text className="text-white text-sm font-semibold">
                      My Notes & Questions
                    </Text>
                  </TouchableOpacity>

                  {isAdmin && (
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-3 ${
                        notesRevealed ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      onPress={revealNotes}
                      disabled={notesRevealed}
                    >
                      {notesRevealed ? (
                        <>
                          <Eye size={16} color="rgb(16, 185, 129)" />{/* emerald-500 */}
                          <Text className="text-white text-sm font-semibold">
                            Notes Revealed
                          </Text>
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} color="rgb(255, 255, 255)" />{/* white */}
                          <Text className="text-white text-sm font-semibold">
                            Reveal Notes
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-8 items-center shadow-md">
              <BookOpen size={48} color="rgb(156, 163, 175)" />{/* gray-400 */}
              <Text className="text-base text-gray-600 mt-3 mb-4">No current book selected</Text>
              {isAdmin && (
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg px-4 py-3"
                  onPress={() => setShowBookModal(true)}
                >
                  <Text className="text-white text-sm font-semibold">Select Book</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Meetings Section */}
        <View className="mb-6">
          <View className="flex flex-row justify-between items-center mb-4">
            <Text className="text-xl font-semibold text-gray-800">Upcoming Meetings</Text>
            {isAdmin && (
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowMeetingModal(true)}
              >
                <Plus size={16} color="rgb(59, 130, 246)" />{/* blue-500 */}
              </TouchableOpacity>
            )}
          </View>

          {meetings.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center shadow-md">
              <Calendar size={24} color="rgb(156, 163, 175)" />{/* gray-400 */}
              <Text className="text-sm text-gray-400 mt-2">No upcoming meetings</Text>
            </View>
          ) : (
            <View className="gap-3">
              {meetings.map((meeting) => (
                <View key={meeting.id} className="bg-white rounded-xl p-4 shadow-md">
                  <Text className="text-base font-semibold text-gray-800 mb-1">{meeting.title}</Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    {formatDate(meeting.date_time)}
                  </Text>
                  {meeting.location && (
                    <Text className="text-sm text-gray-600 mb-0.5">
                      📍 {meeting.location}
                    </Text>
                  )}
                  {meeting.virtual_link && (
                    <Text className="text-sm text-blue-500">🔗 Virtual Meeting</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {isAdmin && (
          <Members initialClub={club} bookClubId={bookClubId} isAdmin={isAdmin} />
        )}
      </ScrollView>

      {/* Book Selection Modal */}
      
      
      <BookSelectionModal
        isVisible={showBookModal}
        onClose={() => setShowBookModal(false)}
        bookClubId={bookClubId}
        onBookSelected={loadClubDetails}
      />

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
            <Text className="text-lg font-semibold text-gray-800">Schedule Meeting</Text>
            <TouchableOpacity onPress={createMeeting}>
              <Text className="text-base text-blue-500 font-semibold">Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5">
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">Meeting Title *</Text>
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
              <Text className="text-base font-semibold text-gray-800 mb-2">Date & Time *</Text>
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
              <Text className="text-base font-semibold text-gray-800 mb-2">Location</Text>
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
              <Text className="text-base font-semibold text-gray-800 mb-2">Virtual Link</Text>
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

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <Text className="text-base text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">My Notes & Questions</Text>
            <TouchableOpacity onPress={saveNotes}>
              <Text className="text-base text-blue-500 font-semibold">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5">
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">Notes</Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 h-30 align-text-top"
                placeholder="Your thoughts, observations, favorite quotes..."
                value={notesForm.notes}
                onChangeText={(text) =>
                  setNotesForm({ ...notesForm, notes: text })
                }
                multiline
                numberOfLines={6}
              />
            </View>

            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-800 mb-2">Discussion Questions</Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50 h-30 align-text-top"
                placeholder="Questions you'd like to discuss with the group..."
                value={notesForm.questions}
                onChangeText={(text) =>
                  setNotesForm({ ...notesForm, questions: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View className="bg-blue-50 rounded-lg p-4 mt-4">
              <Text className="text-sm text-blue-800 text-center">
                🔒 Your notes and questions are private until the admin reveals
                them for group discussion.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
