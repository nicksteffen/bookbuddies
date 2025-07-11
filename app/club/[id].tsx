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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Settings,
  Users,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  Plus,
  CreditCard as Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Crown,
  MessageSquare,
  Star,
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { searchBooks } from '../../lib/api';

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
  console.log('loading page correctly');

  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

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
    console.log('in useEffect');
    console.log(id && user);
    if (id && user) {
      loadClubDetails();
      loadMembers();
      loadUserNotes();
      loadMeetings();
    }
  }, [id, user]);

  const loadClubDetails = async () => {
    try {
      console.log('loac club details');
      const { data: testData, error: testError } = await supabase
        .from('book_clubs')
        .select('*');

      console.log('testData');
      console.log(testData);

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
            average_rating
          )
        `,
        )
        .eq('id', id)
        .single();

      const { data: tempData, error: tempError } = await supabase
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
            average_rating
          )
        `,
        )
        .eq('id', id)
        .single();

      console.log('tempData');
      console.log(tempError);
      console.log(tempData);

      if (currentClubError && currentClubError.code != 'PGRST116') {
        throw currentClubError;
      }
      // if (error) throw error;

      const dummyBook = {
        id: 0,
        title: 'Dummy Book',
        author: 'Dummy Author',
        cover_url: 'https://via.placeholder.com/150',
        synopsis: 'This is a dummy book.',
        page_count: 100,
      };
      const dummyClubBook = {
        id: 0,
        notes_revealed: false,
        average_rating: 0,
      };

      setClub({
        // ...data,
        ...currentClub,
        current_book: tempData.books,
        current_club_book: tempData.club_books,
        // current_book: data.books,
        // club_books: data.club_books,
      });
      console.log('check club');
      console.log(!!club);

      console.log('data vs user');
      console.log(currentClub.admin_user_id);
      console.log(user?.id);

      setIsAdmin(currentClub.admin_user_id === user?.id);

      // Check if user is a member
      const { data: memberData } = await supabase
        .from('club_members')
        .select('status')
        .eq('club_id', id)
        .eq('user_id', user?.id)
        .single();

      setIsMember(memberData?.status === 'approved');
    } catch (error) {
      console.error('Error loading club details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data } = await supabase
        .from('club_members')
        .select(
          `
          *,
          profiles!inner (
            display_name,
            email
          )
        `,
        )
        .eq('club_id', id)
        .order('created_at', { ascending: true });

      if (data) {
        setMembers(data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadUserNotes = async () => {
    if (!club?.current_book_id) return;

    try {
      const { data: clubBookData } = await supabase
        .from('club_books')
        .select('id')
        .eq('club_id', id)
        .eq('book_id', club.current_book_id)
        .single();

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
        .eq('club_id', id)
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
        .eq('id', id);

      if (clubError) throw clubError;

      // Create club_books entry
      const { error: clubBookError } = await supabase
        .from('club_books')
        .insert({
          club_id: id,
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
        club_id: id,
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
        .eq('club_id', id)
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
                .eq('club_id', id)
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

  const updateMemberStatus = async (
    memberId: string,
    status: 'approved' | 'declined',
  ) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .update({ status })
        .eq('id', memberId);

      if (error) throw error;

      loadMembers();
      Alert.alert('Success', `Member ${status}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const removeMember = async (memberId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('club_members')
                .delete()
                .eq('id', memberId);

              if (error) throw error;

              loadMembers();
              Alert.alert('Success', 'Member removed!');
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!club) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Club not found!</Text>
        </View>
      </SafeAreaView>
    );
  }

  const notesRevealed = club.club_books?.[0]?.notes_revealed || false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Club Header */}
        <View style={styles.header}>
          <Text style={styles.clubName}>{club.name}</Text>
          {club.description && (
            <Text style={styles.clubDescription}>{club.description}</Text>
          )}
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Crown size={16} color="#F59E0B" />
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>

        {/* Current Book Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Book</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowBookModal(true)}
              >
                <Edit size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>

          {club.current_book ? (
            <View style={styles.bookCard}>
              <View style={styles.bookContent}>
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
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>
                    {club.current_book.title}
                  </Text>
                  <Text style={styles.bookAuthor}>
                    {club.current_book.author}
                  </Text>
                  {club.current_book.page_count && (
                    <Text style={styles.bookPages}>
                      {club.current_book.page_count} pages
                    </Text>
                  )}
                  {club.current_book.synopsis && (
                    <Text style={styles.bookSynopsis} numberOfLines={3}>
                      {club.current_book.synopsis}
                    </Text>
                  )}
                </View>
              </View>

              {isMember && (
                <View style={styles.bookActions}>
                  <TouchableOpacity
                    style={styles.notesButton}
                    onPress={() => setShowNotesModal(true)}
                  >
                    <MessageSquare size={16} color="#FFFFFF" />
                    <Text style={styles.notesButtonText}>
                      My Notes & Questions
                    </Text>
                  </TouchableOpacity>

                  {isAdmin && (
                    <TouchableOpacity
                      style={[
                        styles.revealButton,
                        notesRevealed && styles.revealButtonDisabled,
                      ]}
                      onPress={revealNotes}
                      disabled={notesRevealed}
                    >
                      {notesRevealed ? (
                        <>
                          <Eye size={16} color="#10B981" />
                          <Text style={styles.revealButtonTextRevealed}>
                            Notes Revealed
                          </Text>
                        </>
                      ) : (
                        <>
                          <EyeOff size={16} color="#FFFFFF" />
                          <Text style={styles.revealButtonText}>
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
            <View style={styles.emptyState}>
              <BookOpen size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No current book selected</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setShowBookModal(true)}
                >
                  <Text style={styles.primaryButtonText}>Select Book</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Meetings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
            {isAdmin && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowMeetingModal(true)}
              >
                <Plus size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>

          {meetings.length === 0 ? (
            <View style={styles.emptyCard}>
              <Calendar size={24} color="#9CA3AF" />
              <Text style={styles.emptyCardText}>No upcoming meetings</Text>
            </View>
          ) : (
            <View style={styles.meetingsList}>
              {meetings.map((meeting) => (
                <View key={meeting.id} style={styles.meetingCard}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <Text style={styles.meetingDate}>
                    {formatDate(meeting.date_time)}
                  </Text>
                  {meeting.location && (
                    <Text style={styles.meetingLocation}>
                      📍 {meeting.location}
                    </Text>
                  )}
                  {meeting.virtual_link && (
                    <Text style={styles.meetingLink}>🔗 Virtual Meeting</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Members Section */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Members ({members.length})</Text>
            <View style={styles.membersList}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.profiles.display_name || member.profiles.email}
                    </Text>
                    <Text style={styles.memberEmail}>
                      {member.profiles.email}
                    </Text>
                    <Text
                      style={[
                        styles.memberStatus,
                        member.status === 'approved' && styles.statusApproved,
                        member.status === 'pending' && styles.statusPending,
                      ]}
                    >
                      {member.status}
                    </Text>
                  </View>

                  <View style={styles.memberActions}>
                    {member.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={styles.approveButton}
                          onPress={() =>
                            updateMemberStatus(member.id, 'approved')
                          }
                        >
                          <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButton}
                          onPress={() =>
                            updateMemberStatus(member.id, 'declined')
                          }
                        >
                          <Text style={styles.declineButtonText}>Decline</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {member.status === 'approved' &&
                      member.user_id !== club.admin_user_id && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeMember(member.id)}
                        >
                          <UserMinus size={16} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Selection Modal */}
      <Modal
        visible={showBookModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBookModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Current Book</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for books..."
                value={bookSearch}
                onChangeText={setBookSearch}
                onSubmitEditing={searchForBooks}
              />
              <TouchableOpacity onPress={searchForBooks} disabled={searching}>
                <Text style={styles.searchButton}>
                  {searching ? 'Searching...' : 'Search'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.searchResults}>
              {bookResults.map((book, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultCard}
                  onPress={() => setCurrentBook(book)}
                >
                  {book.cover_url ? (
                    <Image
                      source={{ uri: book.cover_url }}
                      style={styles.resultCover}
                    />
                  ) : (
                    <View style={styles.resultPlaceholder}>
                      <Text style={styles.placeholderText}>📚</Text>
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle}>{book.title}</Text>
                    <Text style={styles.resultAuthor}>{book.author}</Text>
                    {book.page_count && (
                      <Text style={styles.resultPages}>
                        {book.page_count} pages
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Meeting Creation Modal */}
      <Modal
        visible={showMeetingModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMeetingModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Schedule Meeting</Text>
            <TouchableOpacity onPress={createMeeting}>
              <Text style={styles.saveText}>Create</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Meeting Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Book Discussion"
                value={meetingForm.title}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, title: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date & Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD HH:MM"
                value={meetingForm.date_time}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, date_time: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Physical location"
                value={meetingForm.location}
                onChangeText={(text) =>
                  setMeetingForm({ ...meetingForm, location: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Virtual Link</Text>
              <TextInput
                style={styles.input}
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>My Notes & Questions</Text>
            <TouchableOpacity onPress={saveNotes}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Your thoughts, observations, favorite quotes..."
                value={notesForm.notes}
                onChangeText={(text) =>
                  setNotesForm({ ...notesForm, notes: text })
                }
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Discussion Questions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Questions you'd like to discuss with the group..."
                value={notesForm.questions}
                onChangeText={(text) =>
                  setNotesForm({ ...notesForm, questions: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.privacyNotice}>
              <Text style={styles.privacyText}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  clubDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  adminText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
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
  actionButton: {
    padding: 8,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookContent: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  placeholderCover: {
    width: 80,
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  bookPages: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  bookSynopsis: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bookActions: {
    flexDirection: 'row',
    gap: 12,
  },
  notesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
  },
  notesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  revealButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
  },
  revealButtonDisabled: {
    backgroundColor: '#10B981',
  },
  revealButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  revealButtonTextRevealed: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  meetingLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  meetingLink: {
    fontSize: 14,
    color: '#3B82F6',
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusApproved: {
    color: '#10B981',
  },
  statusPending: {
    color: '#F59E0B',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
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
  placeholder: {
    width: 60,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  searchResults: {
    flex: 1,
  },
  searchResultCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  resultCover: {
    width: 50,
    height: 75,
    borderRadius: 6,
  },
  resultPlaceholder: {
    width: 50,
    height: 75,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  resultPages: {
    fontSize: 12,
    color: '#9CA3AF',
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
    height: 120,
    textAlignVertical: 'top',
  },
  privacyNotice: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  privacyText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
});
