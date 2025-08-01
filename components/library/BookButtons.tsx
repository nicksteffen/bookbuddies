import { Book } from '@/types/book';
import { View, TouchableOpacity, Text } from 'react-native';

interface BookButtonsProps {
  book: Book;
  listType: string;
  moveBook: (bookId: string, toList: string) => void;
  removeBook: (bookId: string) => void;
}
export default function BookButtons({
  book,
  listType,
  moveBook,
  removeBook,
}: BookButtonsProps) {
  return (
    <View className="flex-row gap-2">
      {listType === 'want_to_read' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, 'reading_now')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">
            Start Reading
          </Text>
        </TouchableOpacity>
      )}
      {listType === 'reading_now' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, 'read')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">
            Mark as Read
          </Text>
        </TouchableOpacity>
      )}
      {listType === 'read' && (
        <TouchableOpacity
          className="bg-primary rounded-md px-3 py-1.5 active:opacity-70"
          onPress={() => moveBook(book.id, 'reading_now')}
        >
          <Text className="text-primary-foreground text-xs font-semibold">
            Reread
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
}
