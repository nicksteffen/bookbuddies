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

export default function ClubBookDetailPage() {
  const { id: bookClubId, bookId } = useLocalSearchParams();
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

    console.log('club book deaitls');
    console.log(data);
    console.log(error);

    if (data) {
      setClubBookDetails(data);
    }
  };

  const loadClubMemberBookDetails = async () => {
    console.log('test');
    console.log(clubBookDetails);
    console.log(bookId);
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

  const memberInfo = (user: ClubMemberEntry) => (
    <View key={user.user_id} className="mb-6 border-b border-gray-200 pb-6">
      {/* Header: Profile + Name */}
      <View className="flex-row items-center mb-3">
        {user.profile_picture_url ? (
          <Image
            source={{ uri: user.profile_picture_url }}
            className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500"
          />
        ) : (
          <View className="w-14 h-14 rounded-full mr-4 bg-gray-300 items-center justify-center">
            <Text className="text-white text-xl font-bold">
              {user.display_name ? user.display_name[0].toUpperCase() : 'U'}
            </Text>
          </View>
        )}
        <Text className="text-xl font-semibold text-gray-800">
          {user.display_name}
        </Text>
      </View>

      {/* Rating */}
      {user.rating !== null && (
        <View className="mb-3">
          <StarRating rating={user.rating} />
        </View>
      )}

      {/* Notes */}
      <BookTextEntrySection title="Notes" textEntries={user.notes || []} />

      {/* Questions */}
      <BookTextEntrySection title="Questions" textEntries={user.questions || []} />
    </View>
  );

  if (!book) {
    return (
      <View>
        <Text> Error Pge, no book</Text>
      </View>
    );
  }

  return (
  <SafeAreaView className="flex-1 bg-background">
      <BookDetailCard
        book={book}
        userRating={clubBookDetails?.average_rating || 5}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {!!memberBookData && memberBookData.map((user) => memberInfo(user))}
      </ScrollView>
    </SafeAreaView>
  );
}
