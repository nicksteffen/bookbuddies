import { Book } from "@/types/book";
import { View, Text, Image } from "react-native";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: { book: Book }) {
  return (
    <View className="flex flex-row gap-4 mb-4">
      {!!book.cover_url ? (
        <Image
          source={{ uri: book.cover_url }}
          className="w-20 h-30 rounded-lg"
        />
      ) : (
        <View className="w-20 h-30 bg-gray-200 rounded-lg justify-center items-center">
          <Text className="text-3xl">📚</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          {book.title}
        </Text>
        <Text className="text-base text-gray-600 mb-2">
          {book.author}
        </Text>
        {!!book.page_count && (
          <Text className="text-sm text-gray-400 mb-2">
            {book.page_count} pages
          </Text>
        )}
        {!!book.synopsis && (
          <Text className="text-sm text-gray-600 leading-5" numberOfLines={3}>
            {book.synopsis}
          </Text>
        )}
      </View>
    </View> 
    
    
   
  );
}
