import { searchBooks } from "@/lib/api";
import { Book } from "@/types/book";
import { useState } from "react";
import { Image, Modal, SafeAreaView, View, TouchableOpacity, TextInput, ScrollView, Text, Alert } from "react-native";
import ReadingListDisplay from "../ReadingListDisplay";

type listType = 'reading_now' | 'read' | 'want_to_read';

interface BookSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onBookSelected: (bookData: Book, listType? : listType) => void;
  initialListType?: listType;
  modalTitle?: string;
}


export default function BookSelectionModal({ isVisible, onClose,  onBookSelected, initialListType , modalTitle}: BookSelectionModalProps) {
  const [bookSearch, setBookSearch] = useState('');
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedList, setSelectedList] = useState<listType | null>(initialListType || null);
  
 
  
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
    onClose()
    setBookResults([])
    setBookSearch('')
    if (!!selectedList) {
      onBookSelected(bookData, selectedList)
    }
    onBookSelected(bookData)
    
  }
  
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