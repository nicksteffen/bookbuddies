import { searchBooks } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Book } from "@/types/book";
import { BookOpen, Heart, Star } from "lucide-react-native";
import { list } from "postcss";
import { useState } from "react";
import { Image, Modal, SafeAreaView, View, TouchableOpacity, TextInput, ScrollView, Text, Alert } from "react-native";
import ReadingListDisplay from "../ReadingListDisplay";



// need to figure out exactly why we need this
// These hex values align with common Tailwind defaults or your custom theme.
const ICON_COLORS = {
  primary: '#3B82F6',       // Matches common blue-500, like your 'primary' default
  emerald: '#10B981',       // Matches your custom 'emerald-500'
  red: '#EF4444',           // Matches your custom 'red-500'
  mutedForeground: '#6B7280', // Matches common gray-500, like your 'muted-foreground' default
};
// interface listTypes :  'reading_now' | 'read' | 'want_to_read'

// todo how to define listTypes as a type
type listType = 'reading_now' | 'read' | 'want_to_read';

interface BookSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onBookSelected: (bookData: Book, listType? : listType) => void;
  initialListType?: listType;
  modalTitle?: string;
  // 'reading_now' | 'read' | 'want_to_read'
}


export default function BookSelectionModal({ isVisible, onClose,  onBookSelected, initialListType , modalTitle}: BookSelectionModalProps) {
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedList, setSelectedList] = useState<listType | null>(initialListType || null);
  console.log(selectedList)
  
  
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
  
  
  const setCurrentBook = async (bookData : Book) => {
    console.log(bookData)
    // bookdata => 
    // selectedList
    onClose()
    
    setBookResults([])
    setBookSearch('')
    if (!!selectedList) {
      onBookSelected(bookData, selectedList)
    }
    onBookSelected(bookData)
    
    
  }

  const setCurrentBook1 = async (bookData: any) => {
    try {
      let bookId = null;
      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('title', bookData.title)
        .eq('author', bookData.author)
        .single();

      if (existingBook) {
        console.log("existing book")
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

      console.log("if error")
      console.log(clubError)
      if (clubError) throw clubError;

      // // Create club_books entry
      const { error : clubBookError} = await supabase
        .from('club_books')
        .upsert({
          club_id: bookClubId,
          book_id: bookId,
          status: 'current',
          notes_revealed: false,
        }, { 
          onConflict: 'club_id,book_id',  // Specify the unique constraint columns
          ignoreDuplicates: false  // This ensures the row is updated if it exists
        });

      console.log("clubbookerror")
      console.log(clubBookError)
      if (clubBookError) throw clubBookError;

      // setShowBookModal(false);
      console.log("call on close")
      onClose()
      setBookSearch('');
      setBookResults([]);
      // loadClubDetails();
      onBookSelected()
      Alert.alert('Success', 'Current book updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
          <TouchableOpacity onPress={() => onClose()}>
            <Text className="text-base text-gray-600">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">{modalTitle || ""}</Text>
          <View className="w-15" />
        </View>
        {/* List type selector  */}
        {!!initialListType && (
          
          <View className="mb-5">
            <Text className="text-foreground text-base font-semibold mb-3">Add to:</Text>
            <View className="flex-row gap-2">
              {(['want_to_read', 'reading_now', 'read'] as const).map((listType) => (
                <TouchableOpacity
                  key={listType}
                  className={`flex-row items-center gap-1.5 bg-muted rounded-lg px-3 py-2 active:opacity-70 ${selectedList === listType ? 'bg-primary/10 border border-primary' : ''
                    }`}
                  onPress={() => setSelectedList(listType)}
                >
                  {/* todo, should we combine these get functions? */}
                  <ReadingListDisplay listType={listType} size="small" />

                </TouchableOpacity>
              ))}
            </View>
          </View>
        )
        }

        <View className="flex-1 p-5">
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-5 gap-3">
            <TextInput
              className="flex-1 text-base text-gray-800"
              placeholder="Search for books..."
              value={bookSearch}
              onChangeText={setBookSearch}
              onSubmitEditing={searchForBooks}
            />
            <TouchableOpacity onPress={searchForBooks} disabled={searching}>
              <Text className="text-base text-blue-500 font-semibold">
                {searching ? 'Searching...' : 'Search'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            {bookResults.map((book, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row bg-gray-50 rounded-xl p-3 mb-3 gap-3"
                onPress={() => setCurrentBook(book)}
              >
                {book.cover_url ? (
                  <Image
                    source={{ uri: book.cover_url }}
                    className="w-12.5 h-18.75 rounded-md"
                  />
                ) : (
                  <View className="w-12.5 h-18.75 bg-gray-200 rounded-md justify-center items-center">
                    <Text className="text-3xl">📚</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800 mb-1">{book.title}</Text>
                  <Text className="text-sm text-gray-600 mb-1">{book.author}</Text>
                  {book.page_count && (
                    <Text className="text-xs text-gray-400">
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
  )
}