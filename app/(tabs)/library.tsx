import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Star, BookOpen, Heart } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import BookCard from '@/components/BookCard';
import BookSelectionModal from '@/components/BookSelectionModal';
import { Book as BookData } from '@/types/book';
import ReadingListDisplay from '@/components/ReadingListDisplay';
import { useAlert } from '@/lib/utils/useAlert';
import BookSelection from '@/components/BookSelection';

type listType = 'reading_now' | 'read' | 'want_to_read';

interface OrganizedBooks {
  reading_now: BookData[];
  read: BookData[];
  want_to_read: BookData[];
}

interface BookListItem {
  books: BookData;
  list_type: 'reading_now' | 'read' | 'want_to_read';
}

export default function LibraryScreen() {
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

  useEffect(() => {
    loadUserBooks();
  }, [user]);

  const loadUserBooks = async () => {
    try {
      console.log('user');
      console.log(user);
      const { data } = (await supabase
        .from('user_book_lists')
        .select(
          `
          list_type,
          books (
            id,
            title,
            author,
            cover_url,
            synopsis,
            page_count,
            isbn
          )
        `,
        )
        .eq('user_id', user?.id)) as unknown as { data: BookListItem[] };

      if (data) {
        const organizedBooks = {
          reading_now: [],
          read: [],
          want_to_read: [],
        } as OrganizedBooks;

        // this is the list type issue with book vs book data
        data.forEach((item) => {
          if (!!item.books && organizedBooks[item.list_type]) {
            organizedBooks[item.list_type].push(item.books);
          }
        });
        setBooks(organizedBooks);
      }
    } catch (error) {
      console.error('Error loading user books:', error);
    } finally {
      setLoading(false);
    }
  };

  // TODO: refactor to use the upsert and eventually get_or_create_book
  const addBookToList = async (bookData: BookData, listType?: listType) => {
    if (!listType) return;

    try {
      let bookId = null;
      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('title', bookData.title)
        .eq('author', bookData.author)
        .eq('isbn', bookData.isbn)
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
        bookId = newBook?.id;
      }

      if (!bookId) {
        throw new Error('Failed to obtain book ID after creation or lookup.');
      }

      const { data: existingEntry } = await supabase
        .from('user_book_lists')
        .select('id, list_type')
        .eq('user_id', user?.id)
        .eq('book_id', bookId)
        .single();

      // TODO, this should be an upsert on list_type changing
      if (existingEntry) {
        if (existingEntry.list_type !== listType) {
          const { error } = await supabase
            .from('user_book_lists')
            .update({ list_type: listType })
            .eq('id', existingEntry.id);
          if (error) throw error;
        } else {
          // Alert.alert('Info', `Book is already in your "${getListTitle(listType)}" list.`);
          console.log('show alert');
          showAlert(
            'Info',
            `Book is already in your "${getListTitle(listType)}" list.`,
          );

          loadUserBooks();
          return;
        }
      } else {
        const { error } = await supabase.from('user_book_lists').insert({
          user_id: user?.id!,
          book_id: bookId,
          list_type: listType,
        });

        if (error) throw error;
      }
      loadUserBooks();
      showAlert('Success', 'Book added to your library!');
    } catch (error: any) {
      console.error('Error adding book to list:', error);
      showAlert('Error', error.message || 'Failed to add book.');
    }
  };

  const moveBook = async (bookId: string, fromList: string, toList: string) => {
    try {
      const { error } = await supabase
        .from('user_book_lists')
        .update({ list_type: toList })
        .eq('user_id', user?.id)
        .eq('book_id', bookId);

      if (error) throw error;

      loadUserBooks();
      showAlert('Success', `Book moved to "${getListTitle(toList)}"`);
    } catch (error: any) {
      console.error('Error moving book:', error);
      showAlert('Error', error.message || 'Failed to move book.');
    }
  };

  const removeBook = async (bookId: string) => {
    const removeAction = async () => {
      try {
        const { error } = await supabase
          .from('user_book_lists')
          .delete()
          .eq('user_id', user?.id)
          .eq('book_id', bookId);

        if (error) throw error;

        loadUserBooks();
        showAlert('Success', 'Book removed from library.');
      } catch (error: any) {
        console.error('Error removing book:', error);
        showAlert('Error', error.message || 'Failed to remove book.');
      }
    };
    showAlert(
      'Remove Book',
      'Are you sure you want to remove this book from your library?',
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

  const getListTitle = (listType: string) => {
    switch (listType) {
      case 'reading_now':
        return 'Currently Reading';
      case 'read':
        return 'Read Books';
      case 'want_to_read':
        return 'Want to Read';
      default:
        return 'Books';
    }
  };

  const bookButtons = (book: BookData, listType: string) => (
    <View className="flex-row gap-2">
      {listType === 'want_to_read' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, listType, 'reading_now')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">
            Start Reading
          </Text>
        </TouchableOpacity>
      )}
      {listType === 'reading_now' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, listType, 'read')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">
            Mark as Read
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        className="bg-muted rounded-md px-3 py-1.5 active:opacity-70"
        onPress={() => removeBook(book.id)}
      >
        <Text className="text-muted-foreground text-xs font-semibold">
          Remove
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookCard = (book: BookData, listType: string) => (
    <View key={book.id}>
      <BookCard book={book} />
      {bookButtons(book, listType)}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center px-5 py-4 bg-card border-b border-border">
        <Text className="text-foreground text-2xl font-bold">My Library</Text>
        <TouchableOpacity
          className="bg-primary rounded-full w-10 h-10 justify-center items-center active:opacity-70"
          onPress={() => setShowBookModal(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View className="p-5">
          {(['reading_now', 'read', 'want_to_read'] as const).map(
            (listType) => (
              <View key={listType} className="mb-8">
                <View className="flex-row items-center mb-4 gap-2">
                  <ReadingListDisplay listType={listType} size="large" />
                  <Text className="text-muted-foreground text-base">
                    ({books[listType].length})
                  </Text>
                </View>

                {books[listType].length === 0 ? (
                  <View className="bg-card rounded-xl p-8 items-center shadow-md">
                    <Text className="text-muted-foreground text-base mb-4 text-center">
                      No books in this list
                    </Text>
                    <TouchableOpacity
                      className="bg-primary rounded-md px-4 py-3 active:opacity-70"
                      onPress={() => {
                        setSelectedList(listType);
                        setShowBookModal(true);
                      }}
                    >
                      <Text className="text-primary-foreground text-sm font-semibold">
                        Add your first book
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="gap-3">
                    {books[listType].map((book) =>
                      renderBookCard(book, listType),
                    )}
                  </View>
                )}
              </View>
            ),
          )}
        </View>
      </ScrollView>

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
