import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Star, BookOpen, Heart, Clock } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { searchBooks } from '../../lib/api';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedList, setSelectedList] = useState<'reading_now' | 'read' | 'want_to_read'>('want_to_read');

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchBooks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching books:', error);
      Alert.alert('Error', 'Failed to search books');
    } finally {
      setSearching(false);
    }
  };

  const addBookToList = async (bookData: any, listType: string) => {
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

      // Check if already in any list
      const { data: existingEntry } = await supabase
        .from('user_book_lists')
        .select('id, list_type')
        .eq('user_id', user?.id)
        .eq('book_id', bookId)
        .single();

      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('user_book_lists')
          .update({ list_type: listType })
          .eq('id', existingEntry.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('user_book_lists')
          .insert({
            user_id: user?.id!,
            book_id: bookId,
            list_type: listType,
          });

        if (error) throw error;
      }

      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
      loadUserBooks();
      Alert.alert('Success', 'Book added to your library!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const getListIcon = (listType: string) => {
    switch (listType) {
      case 'reading_now':
        return <BookOpen size={20} color="#3B82F6" />;
      case 'read':
        return <Star size={20} color="#10B981" />;
      case 'want_to_read':
        return <Heart size={20} color="#EF4444" />;
      default:
        return <BookOpen size={20} color="#6B7280" />;
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

  const renderBookCard = (book: Book, listType: string) => (
    <TouchableOpacity key={book.id} style={styles.bookCard}>
      <View style={styles.bookContent}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.bookCover} />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
          {book.page_count && (
            <Text style={styles.bookPages}>{book.page_count} pages</Text>
          )}
          
          <View style={styles.bookActions}>
            {listType === 'want_to_read' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => moveBook(book.id, listType, 'reading_now')}
              >
                <Text style={styles.actionButtonText}>Start Reading</Text>
              </TouchableOpacity>
            )}
            {listType === 'reading_now' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => moveBook(book.id, listType, 'read')}
              >
                <Text style={styles.actionButtonText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeBook(book.id)}
            >
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.title}>My Library</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(['reading_now', 'read', 'want_to_read'] as const).map((listType) => (
          <View key={listType} style={styles.section}>
            <View style={styles.sectionHeader}>
              {getListIcon(listType)}
              <Text style={styles.sectionTitle}>{getListTitle(listType)}</Text>
              <Text style={styles.bookCount}>({books[listType].length})</Text>
            </View>
            
            {books[listType].length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No books in this list</Text>
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => {
                    setSelectedList(listType);
                    setShowAddModal(true);
                  }}
                >
                  <Text style={styles.addFirstButtonText}>Add your first book</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.booksList}>
                {books[listType].map((book) => renderBookCard(book, listType))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Book</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for books..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch} disabled={searching}>
                <Text style={styles.searchButton}>
                  {searching ? 'Searching...' : 'Search'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listTypeSelector}>
              <Text style={styles.listTypeSelectorTitle}>Add to:</Text>
              <View style={styles.listTypeOptions}>
                {(['want_to_read', 'reading_now', 'read'] as const).map((listType) => (
                  <TouchableOpacity
                    key={listType}
                    style={[
                      styles.listTypeOption,
                      selectedList === listType && styles.listTypeOptionSelected,
                    ]}
                    onPress={() => setSelectedList(listType)}
                  >
                    {getListIcon(listType)}
                    <Text style={styles.listTypeOptionText}>
                      {getListTitle(listType)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView style={styles.searchResults}>
              {searchResults.map((book, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResultCard}
                  onPress={() => addBookToList(book, selectedList)}
                >
                  {book.cover_url ? (
                    <Image source={{ uri: book.cover_url }} style={styles.resultCover} />
                  ) : (
                    <View style={styles.resultPlaceholder}>
                      <Text style={styles.placeholderText}>📚</Text>
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle}>{book.title}</Text>
                    <Text style={styles.resultAuthor}>{book.author}</Text>
                    {book.year && (
                      <Text style={styles.resultYear}>Published: {book.year}</Text>
                    )}
                    {book.page_count && (
                      <Text style={styles.resultPages}>{book.page_count} pages</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  addButton: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  bookCount: {
    fontSize: 16,
    color: '#6B7280',
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
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  booksList: {
    gap: 12,
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
    gap: 12,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 6,
  },
  placeholderCover: {
    width: 60,
    height: 90,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookPages: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  bookActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: '#6B7280',
    fontSize: 12,
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
  listTypeSelector: {
    marginBottom: 20,
  },
  listTypeSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  listTypeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  listTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listTypeOptionSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  listTypeOptionText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
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
  resultYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  resultPages: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});