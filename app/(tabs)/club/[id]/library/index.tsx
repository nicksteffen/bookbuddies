import BookSelection from '@/components/BookSelection';
import GoToClubButton from '@/components/GoToClubButton';
import LibraryScreen from '@/components/LibraryScreen';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { createOrGetBook, getListTitle } from '@/lib/utils/library';
import { useAlert } from '@/lib/utils/useAlert';
import { Book } from '@/types/book';
import { GoTrueAdminApi } from '@supabase/supabase-js';
import { useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text } from 'react-native';

type listType = 'reading_now' | 'read' | 'want_to_read';

interface OrganizedBooks {
  reading_now: Book[];
  read: Book[];
  want_to_read: Book[];
}

export default function ClubLibraryScreen() {
  const { user } = useAuth();
  const [books, setBooks] = useState<OrganizedBooks>({
    reading_now: [],
    read: [],
    want_to_read: [],
  });
  const [loading, setLoading] = useState(true);

  const [selectedList, setSelectedList] = useState<
    'reading_now' | 'read' | 'want_to_read'
  >('want_to_read');
  const [showBookModal, setShowBookModal] = useState(false);
  const { showAlert } = useAlert();

  const [isAdmin, setIsAdmin] = useState(false);

  const addBookToList = async (bookData: Book, listType?: listType) => {
    try {
      const bookId = await createOrGetBook(bookData);

      const { data: updatedRow, error: bookUpsertError } = await supabase
        .from('club_books')
        .upsert(
          {
            club_id: clubId,
            book_id: bookId,
            status: listType,
          },
          { onConflict: 'club_id, book_id' },
        )
        .select()
        .single();

      if (bookUpsertError) {
        throw bookUpsertError;
      }

      loadClubBooks();

      if (updatedRow) {
        showAlert(
          'Success',
          `Book was moved to your ${getListTitle(updatedRow.status)} list`,
        );
      } else {
        showAlert('Success', 'Book added to your library!');
      }
    } catch (error: any) {
      console.error(error);
      showAlert('Error adding book', error.message);
    }
  };
  useEffect(() => {
    loadClubBooks();
  }, [user]);

  const loadClubBooks = async () => {
    try {
      const { data: bookData, error: booksError } = await supabase
        .from('club_books')
        .select(
          `
          *,
          books(*)`,
        )
        .eq('club_id', clubId);

      if (bookData) {
        setBooks(
          bookData.reduce(
            (acc, bookItem) => {
              // Transform the book object once
              const transformedBook = {
                ...bookItem.books,
                clubRating: bookItem.average_rating,
              } as Book;

              // Check the status and push the transformed book to the correct array
              switch (bookItem.status) {
                case 'reading_now':
                  acc.reading_now.push(transformedBook);
                  break;
                case 'read':
                  acc.read.push(transformedBook);
                  break;
                case 'want_to_read':
                  acc.want_to_read.push(transformedBook);
                  break;
              }

              return acc; // Always return the accumulator
            },
            {
              // Initial value of the accumulator
              reading_now: [],
              read: [],
              want_to_read: [],
            },
          ),
        );
      }
    } catch (error) {
      console.error('Error fetching club books:', error);
    } finally {
      setLoading(false);
    }
  };

  // get club name
  const [clubName, setClubName] = useState('');
  const { id: clubId } = useLocalSearchParams<{ id: string }>();
  useEffect(() => {
    const getClubName = async () => {
      try {
        const { data: club } = await supabase
          .from('book_clubs')
          .select('name, admin_user_id')
          .eq('id', clubId)
          .single();
        if (club) {
          setClubName(club.name);
          if (user) {
            const adminUserId = club?.admin_user_id ?? -1; // Default to a non-admin ID if null
            const userId = user.id ?? -1; // Default to an invalid user ID if null
            setIsAdmin(adminUserId === userId);
          }
        }
      } catch (error) {
        console.error('Error fetching club name:', error);
      }
    };

    getClubName();
  }, [clubId, user]);

  const moveBook = async (
    bookId: string,
    // toList: 'reading_now' | 'read' | 'want_to_read',
    toList: string,
  ) => {
    console.log('Moving book', bookId, 'to', toList);
    try {
      const { error } = await supabase
        .from('club_books')
        .update({ status: toList })
        .eq('club_id', clubId)
        .eq('book_id', bookId);
      if (error) throw error;
      loadClubBooks();
      showAlert('Success', `Book moved to ${getListTitle(toList)}.`);
    } catch (error) {
      console.error('Error moving book:', error);
    }
  };

  const removeBook = async (bookId: string) => {
    const removeAction = async () => {
      try {
        const { error } = await supabase
          .from('club_books')
          .delete()
          .eq('club_id', clubId)
          .eq('book_id', bookId);

        if (error) throw error;

        loadClubBooks();
        showAlert('Success', 'Book removed from library.');
      } catch (error: any) {
        console.error('Error removing book:', error);
        showAlert('Error', error.message || 'Failed to remove book.');
      }
    };
    showAlert(
      'Remove Book',
      'Are you sure you want to remove this book from the club library?',
      { onConfirm: removeAction },
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: removeAction,
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <GoToClubButton clubId={clubId} />
      <View className="flex-row justify-between items-center px-5 py-4 bg-card border-b border-border">
        <Text className="text-foreground text-2xl font-bold">
          {clubName} Library
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-full w-10 h-10 justify-center items-center active:opacity-70"
          onPress={() => setShowBookModal(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <LibraryScreen
        isAdmin={isAdmin}
        initialBooks={books}
        moveBook={moveBook}
        removeBook={removeBook}
      />

      <BookSelection
        isVisible={showBookModal}
        onClose={() => setShowBookModal(false)}
        onBookSelected={addBookToList}
        initialListType={selectedList}
        modalTitle="Add Book"
      />
    </SafeAreaView>
  );
}
