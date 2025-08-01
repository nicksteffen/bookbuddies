import { Plus } from 'lucide-react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import BookSelection from './BookSelection';
import ReadingListDisplay from './ReadingListDisplay';
import BookCard from './BookCard';
import { Book } from '@/types/book';
import { useState, useEffect } from 'react';
import BookButtons from './library/BookButtons';
import { is } from 'date-fns/locale';

interface OrganizedBooks {
  reading_now: Book[];
  read: Book[];
  want_to_read: Book[];
}

interface BookListItem {
  book_info: Book;
  list_type: 'reading_now' | 'read' | 'want_to_read';
  rating: number;
}

interface LibraryScreenProps {
  initialBooks: OrganizedBooks;
  moveBook: (
    bookId: string,
    // toList: 'reading_now' | 'read' | 'want_to_read',
    toList: string,
  ) => void;
  removeBook: (bookId: string) => void;
  isAdmin: boolean;
}

export default function LibraryScreen({
  initialBooks,
  moveBook,
  removeBook,
  isAdmin,
}: LibraryScreenProps) {
  const [books, setBooks] = useState<OrganizedBooks>(initialBooks);
  const [isCurrentAdmin, setIsCurrentAdmin] = useState(isAdmin);

  useEffect(() => {
    // Initialize books state with initialBooks
    setBooks(initialBooks);
  }, [initialBooks]);

  useEffect(() => {
    setIsCurrentAdmin(isAdmin);
  }, [isAdmin]);

  const renderBookCard = (book: Book, listType: string) => {
    return (
      <View key={book.id}>
        <BookCard book={book} bookRating={book.clubRating} />
        {isCurrentAdmin && (
          <BookButtons
            book={book}
            listType={listType}
            moveBook={moveBook}
            removeBook={removeBook}
          />
        )}
      </View>
    );
  };

  return (
    <ScrollView>
      <View className="p-5">
        {(['reading_now', 'read', 'want_to_read'] as const).map((listType) => (
          <View key={listType} className="mb-8">
            <View className="flex-row items-center mb-4 gap-2">
              <ReadingListDisplay
                listType={listType}
                size="large"
                count={books[listType].length}
              />
            </View>

            {books[listType].length === 0 ? (
              <View className="bg-card rounded-xl p-8 items-center shadow-md">
                <Text className="text-muted-foreground text-base mb-4 text-center">
                  No books in this list
                </Text>
                {/* <TouchableOpacity
                      className="bg-primary rounded-md px-4 py-3 active:opacity-70"
                      onPress={() => {
                        setSelectedList(listType);
                        setShowBookModal(true);
                      }}
                    >
                      <Text className="text-primary-foreground text-sm font-semibold">
                        Add your first book
                      </Text>
                    </TouchableOpacity> */}
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
  );
}
