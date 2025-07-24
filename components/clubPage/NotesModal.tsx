import { useAuth } from '@/contexts/AuthContext';
import { useUserBookData } from '@/hooks/useUserBookData';
import { supabase } from '@/lib/supabase';
import { ClubBook, ClubDetails, UserNotes } from '@/types/club';
import { CandlestickChartIcon } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Text,
} from 'react-native';
import BookTextEntrySection from '../BookTextEntrySection';
import { useBookDetails } from '@/hooks/useBookDetails';
import BookDetailCard from '../BookDetailCard';

interface NotesModalProps {
  initialShowNotesModal: boolean;
  hideNotesModal: () => void;
  initialClubDetails: ClubDetails;
}

export default function NotesModal({
  initialShowNotesModal,
  initialClubDetails,
  hideNotesModal,
}: NotesModalProps) {
  // const [userNotes, setUserNotes] = useState<UserNotes | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(initialShowNotesModal);
  const { user } = useAuth();
  const [clubDetails, setClubDetails] = useState<ClubDetails | null>(
    initialClubDetails,
  );

  const bookId = clubDetails?.current_book_id as string | undefined;
  const { book: bookDetails, loading: bookLoading, error } = useBookDetails(bookId);
  const { notes, questions,rating, updateRating, addNote, addQuestion, refresh, loading } =
    useUserBookData(bookId)

  useEffect(() => {
    setShowNotesModal(initialShowNotesModal);
  }, [initialShowNotesModal]);


  return (
    <Modal
      visible={showNotesModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
          <TouchableOpacity onPress={() => hideNotesModal()}>
            <Text className="text-base text-gray-600">Close</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800 justify-center">
            My Notes & Questions
          </Text>
        </View>

        <ScrollView className="flex-1 p-5">
          { !!bookDetails && (
            <BookDetailCard book={bookDetails} userRating={rating} onRatingChange={updateRating} /> 
          )}
          <View>
            <BookTextEntrySection
              title="My Notes"
              subtitle="Your personal reflections on this book"
              placeholder="Type your note here..."
              buttonText="Add Note"
              textEntries={notes.map(n => n.note_text)}
              onSubmit={(text) => addNote(text)}
            />
            <BookTextEntrySection
              title="Book Club Questions"
              subtitle="What do you want to ask others?"
              placeholder="Type a question..."
              buttonText="Add Question"
              textEntries={questions.map(q => q.question_text)}
              onSubmit={(text) => addQuestion(text)}
            />
          </View>

          <View className="bg-blue-50 rounded-lg p-4 mt-4">
            <Text className="text-sm text-blue-800 text-center">
              🔒 Your notes and questions are private until the admin reveals
              them for group discussion.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
