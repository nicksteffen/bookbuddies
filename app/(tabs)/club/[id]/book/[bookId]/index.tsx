import BookDetailCard from '@/components/BookDetailCard';
import { useBookDetails } from '@/hooks/useBookDetails';
import { useLocalSearchParams } from 'expo-router';
import React, { use, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { ClubBook } from '@/types/club';
import { ClubMemberEntry, fetchClubBookData } from '@/lib/utils/clubs';
import BookTextEntrySection from '@/components/BookTextEntrySection';
import StarRating from '@/components/StarRating';
import MemberNoteInfo from '@/components/MemberNoteInfo';
import GoToClubButton from '@/components/GoToClubButton';

export default function ClubBookDetailPage() {
  const { id: bookClubId, bookId } = useLocalSearchParams<{
    id: string;
    bookId: string;
  }>();
  const [clubBookDetails, setClubBookDetails] = useState<ClubBook>();
  const [memberBookData, setMemberBookData] = useState<ClubMemberEntry[]>();

  const {
    book,
    loading: bookLoading,
    error,
  } = useBookDetails(bookId as string);
  const loadClubBookDetails = async () => {
    const { data, error } = await supabase
      .from('club_books')
      .select('*')
      .eq('book_id', bookId)
      .eq('club_id', bookClubId)
      .single();

    if (data) {
      setClubBookDetails(data);
    }
  };

  const loadClubMemberBookDetails = async () => {
    if (!clubBookDetails || !clubBookDetails.club_id || !bookId) return;
    try {
      console.log('try get data');
      const data = await fetchClubBookData(
        clubBookDetails.club_id,
        bookId as string,
      );
      console.log(data);
      setMemberBookData(data); // your local state
    } catch (err) {
      console.error('Club book fetch failed', err);
    }
  };

  useEffect(() => {
    loadClubBookDetails();
    console.log('got cloub details, try member');
  }, [bookId, bookClubId]);

  useEffect(() => {
    loadClubMemberBookDetails();
  }, [clubBookDetails]);

  if (!book) {
    return (
      <View>
        <Text> Error Page, no book</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <GoToClubButton clubId={bookClubId} />

      <BookDetailCard
        book={book}
        userRating={clubBookDetails?.average_rating || 5}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {!!memberBookData && (
          <View>
            {memberBookData.map((user) => (
              <MemberNoteInfo user={user} key={user.user_id} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
