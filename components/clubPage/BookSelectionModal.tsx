import { searchBooks } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Image, Modal, SafeAreaView, View, TouchableOpacity, TextInput, ScrollView, Text, Alert } from "react-native";


interface BookSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  bookClubId: string;
  onBookSelected: () => void;
}

export default function BookSelectionModal({ isVisible, onClose, bookClubId, onBookSelected }: BookSelectionModalProps) {
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  
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
      // const { data: book, error: bookError } = await supabase
      //   .from('books')
      //   .upsert({
      //     title: bookData.title,
      //     author: bookData.author,
      //     isbn: bookData.isbn,
      //     cover_url: bookData.cover_url,
      //     synopsis: bookData.synopsis,
      //     page_count: bookData.page_count,
      //   }, {
      //     onConflict: 'title,author,isbn',  // Unique constraint columns
      //     ignoreDuplicates: true,
      //     // count: 'exact'
      //   })
      //   .select('id')
      //   // .single();
      // console.log('check book error')
      // console.log(bookError)
      // console.log('data')
      // console.log(book)
      // if (bookError) throw bookError;
      
      // const bookId = book[0].id;
      // ---------------------
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
          <Text className="text-lg font-semibold text-gray-800">Select Current Book</Text>
          <View className="w-15" />
        </View>

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