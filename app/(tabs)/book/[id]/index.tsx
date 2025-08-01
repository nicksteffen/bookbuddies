import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams } from 'expo-router';
import { Book } from '@/types/book';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { View, Text, ScrollView } from 'react-native';
import BookCard from '@/components/BookCard';
import RatingInput from '@/components/RatingInput';
import BookTextEntrySection from '@/components/BookTextEntrySection';
import BookDetailCard from '@/components/BookDetailCard';
import { Scroll } from 'lucide-react-native';
import { useUserBookData } from '@/hooks/useUserBookData';
import { useBookDetails } from '@/hooks/useBookDetails';
import {
  SafeAreaFrameContext,
  SafeAreaView,
} from 'react-native-safe-area-context';
import GoToClubButton from '@/components/GoToClubButton';

export interface Note {
  user_id: string;
  book_id: string;
  note: string;
  updated_at: string;
}

export interface Question {
  user_id: string;
  book_id: string;
  question: string;
  updated_at: string;
}

export default function BookDetailScreen() {
  const { id: bookId } = useLocalSearchParams<{ id: string }>();

  const { book, loading: bookLoading, error } = useBookDetails(bookId);
  const {
    notes,
    questions,
    rating,
    addNote,
    addQuestion,
    updateRating,
    loading: userBookDataLoading,
  } = useUserBookData(bookId);

  return (
    <SafeAreaView>
      <ScrollView>
        {!!book && (
          <BookDetailCard
            book={book}
            userRating={rating}
            onRatingChange={updateRating}
          />
        )}
        <BookTextEntrySection
          title="My Notes"
          subtitle="Your personal reflections on this book"
          placeholder="Type your note here..."
          buttonText="Add Note"
          textEntries={notes.map((n) => n.note_text)}
          onSubmit={(text) => addNote(text)}
        />
        <BookTextEntrySection
          title="Book Club Questions"
          subtitle="What do you want to ask others?"
          placeholder="Type a question..."
          buttonText="Add Question"
          textEntries={questions.map((q) => q.question_text)}
          onSubmit={(text) => addQuestion(text)}
        />
      </ScrollView>
      {/* <UserNotes notes={notes}/> */}
    </SafeAreaView>
  );
}
