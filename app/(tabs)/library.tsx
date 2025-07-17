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
import { searchBooks } from '../../lib/api';
import BookCard from '@/components/BookCard';
import BookSelectionModal from '@/components/clubPage/BookSelectionModal';
import { Book as BookData } from '@/types/book'
import ReadingListDisplay from '@/components/ReadingListDisplay';

type listType = 'reading_now' | 'read' | 'want_to_read';

// Helper for Lucide Icon Colors:
// These need to be actual color strings (hex, rgb, etc.) as the 'color' prop
// on Lucide icons does not interpret Tailwind class names directly.
// These hex values align with common Tailwind defaults or your custom theme.
const ICON_COLORS = {
  primary: '#3B82F6',       // Matches common blue-500, like your 'primary' default
  emerald: '#10B981',       // Matches your custom 'emerald-500'
  red: '#EF4444',           // Matches your custom 'red-500'
  mutedForeground: '#6B7280', // Matches common gray-500, like your 'muted-foreground' default
};

// todo look into this Book type and see what the list_type use is
interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  synopsis: string | null;
  page_count: number | null;
  list_type?: 'reading_now' | 'read' | 'want_to_read';
}

export default function LibraryScreen() {
  const { user } = useAuth();
  const [books, setBooks] = useState<{
    reading_now: Book[];
    read: Book[];
    want_to_read: Book[];
  }>({
    reading_now: [],
    read: [],
    want_to_read: [],
  });
  const [loading, setLoading] = useState(true);

  const [selectedList, setSelectedList] = useState<'reading_now' | 'read' | 'want_to_read'>('want_to_read');
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    loadUserBooks();
  }, [user]);

  const loadUserBooks = async () => {
    try {
      const { data } = await supabase
        .from('user_book_lists')
        .select(`
          list_type,
          books (
            id,
            title,
            author,
            cover_url,
            synopsis,
            page_count
          )
        `)
        .eq('user_id', user?.id);

      if (data) {
        const organizedBooks = {
          reading_now: [],
          read: [],
          want_to_read: [],
        } as { [key: string]: Book[] };

        data.forEach((item: any) => {
          if (item.books && organizedBooks[item.list_type]) {
            organizedBooks[item.list_type].push({
              ...item.books,
              list_type: item.list_type,
            });
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


  // const addBookToList = async (bookData: any, listType: string) => {
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
        throw new Error("Failed to obtain book ID after creation or lookup.");
      }

      const { data: existingEntry } = await supabase
        .from('user_book_lists')
        .select('id, list_type')
        .eq('user_id', user?.id)
        .eq('book_id', bookId)
        .single();

      if (existingEntry) {
        if (existingEntry.list_type !== listType) {
          const { error } = await supabase
            .from('user_book_lists')
            .update({ list_type: listType })
            .eq('id', existingEntry.id);
          if (error) throw error;
        } else {
          Alert.alert('Info', `Book is already in your "${getListTitle(listType)}" list.`);
          // setShowAddModal(false);
          // setSearchQuery('');
          // setSearchResults([]);
          loadUserBooks();
          return;
        }
      } else {
        const { error } = await supabase
          .from('user_book_lists')
          .insert({
            user_id: user?.id!,
            book_id: bookId,
            list_type: listType,
          });

        if (error) throw error;
      }

      // setShowAddModal(false);
      // setShowBookModal(false);
      // 
      // setSearchQuery('');
      // setSearchResults([]);
      loadUserBooks();
      Alert.alert('Success', 'Book added to your library!');
    } catch (error: any) {
      console.error('Error adding book to list:', error);
      Alert.alert('Error', error.message || 'Failed to add book.');
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
      Alert.alert('Success', `Book moved to "${getListTitle(toList)}"`);
    } catch (error: any) {
      console.error('Error moving book:', error);
      Alert.alert('Error', error.message || 'Failed to move book.');
    }
  };

  const removeBook = async (bookId: string) => {
    Alert.alert(
      'Remove Book',
      'Are you sure you want to remove this book from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_book_lists')
                .delete()
                .eq('user_id', user?.id)
                .eq('book_id', bookId);

              if (error) throw error;

              loadUserBooks();
              Alert.alert('Success', 'Book removed from library.');
            } catch (error: any) {
              console.error('Error removing book:', error);
              Alert.alert('Error', error.message || 'Failed to remove book.');
            }
          },
        },
      ]
    );
  };

  const getListIcon = (listType: string) => {
    switch (listType) {
      case 'reading_now':
        return <BookOpen size={20} color={ICON_COLORS.primary} />;
      case 'read':
        return <Star size={20} color={ICON_COLORS.emerald} />;
      case 'want_to_read':
        return <Heart size={20} color={ICON_COLORS.red} />;
      default:
        return <BookOpen size={20} color={ICON_COLORS.mutedForeground} />;
    }
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

  // todo, this is still here as a reference because it had different styles that the BookCard Component did
  // const renderBookCard1 = (book: Book, listType: string) => (
  //   <TouchableOpacity key={book.id} className="bg-card rounded-xl p-4 shadow-md">
  //     <View className="flex-row gap-3">
  //       {/* Using !! for cover_url for consistency, though string checks usually suffice */}
  //       {!!book.cover_url ? (
  //         <Image source={{ uri: book.cover_url }} className="w-[60px] h-[90px] rounded-md" />
  //       ) : (
  //         <View className="w-[60px] h-[90px] bg-muted rounded-md justify-center items-center">
  //           <Text className="text-2xl">📚</Text>
  //         </View>
  //       )}
  //       <View className="flex-1">
  //         <Text className="text-foreground text-base font-semibold mb-1" numberOfLines={2}>
  //           {book.title}
  //         </Text>
  //         <Text className="text-muted-foreground text-sm mb-1" numberOfLines={1}>
  //           {book.author}
  //         </Text>
  //         {/* Applied !! to page_count */}
  //         {!!book.page_count && (
  //           <Text className="text-muted-foreground text-xs mb-3">
  //             {book.page_count} pages
  //           </Text>
  //         )}

  //         <View className="flex-row gap-2">
  //           {listType === 'want_to_read' && (
  //             <TouchableOpacity
  //               className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
  //               onPress={() => moveBook(book.id, listType, 'reading_now')}
  //             >
  //               <Text className="text-primary-foreground text-xs font-semibold">Start Reading</Text>
  //             </TouchableOpacity>
  //           )}
  //           {listType === 'reading_now' && (
  //             <TouchableOpacity
  //               className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
  //               onPress={() => moveBook(book.id, listType, 'read')}
  //             >
  //               <Text className="text-primary-foreground text-xs font-semibold">Mark as Read</Text>
  //             </TouchableOpacity>
  //           )}
  //           <TouchableOpacity
  //             className="bg-muted rounded-md px-3 py-1.5 active:opacity-70"
  //             onPress={() => removeBook(book.id)}
  //           >
  //             <Text className="text-muted-foreground text-xs font-semibold">Remove</Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );
  

  
  const bookButtons = (book: Book, listType:string) => (
    <View className="flex-row gap-2">
      {listType === 'want_to_read' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, listType, 'reading_now')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">Start Reading</Text>
        </TouchableOpacity>
      )}
      {listType === 'reading_now' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, listType, 'read')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">Mark as Read</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        className="bg-muted rounded-md px-3 py-1.5 active:opacity-70"
        onPress={() => removeBook(book.id)}
      >
        <Text className="text-muted-foreground text-xs font-semibold">Remove</Text>
      </TouchableOpacity>
    </View>
  )
  
  const renderBookCard = (book: Book, listType:string) => (
    <View key={book.id}>
      <BookCard book={book} />
      { bookButtons(book, listType) }
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={ICON_COLORS.primary} />
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
          {(['reading_now', 'read', 'want_to_read'] as const).map((listType) => (
            <View key={listType} className="mb-8">
              <View className="flex-row items-center mb-4 gap-2">
                <ReadingListDisplay listType={listType} size="large"/>
                <Text className="text-muted-foreground text-base">({books[listType].length})</Text>
              </View>

              {books[listType].length === 0 ? (
                <View className="bg-card rounded-xl p-8 items-center shadow-md">
                  <Text className="text-muted-foreground text-base mb-4 text-center">No books in this list</Text>
                  <TouchableOpacity
                    className="bg-primary rounded-md px-4 py-3 active:opacity-70"
                    onPress={() => {
                      setSelectedList(listType);
                      setShowBookModal(true);
                    }}
                  >
                    <Text className="text-primary-foreground text-sm font-semibold">Add your first book</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="gap-3">
                  {books[listType].map((book) => renderBookCard(book, listType))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <BookSelectionModal
        isVisible={showBookModal}
        onClose={() => setShowBookModal(false)}
        onBookSelected={addBookToList}
        initialListType='want_to_read'
        modalTitle='Add Book'
        />
      
    </SafeAreaView>
  );
} 