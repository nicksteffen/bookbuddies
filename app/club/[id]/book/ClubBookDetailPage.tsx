import BookDetailCard from "@/components/BookDetailCard";
import { useBookDetails } from "@/hooks/useBookDetails";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, SafeAreaView, ScrollView, Image } from "react-native";





export default function ClubBookDetailPage() {
  const { id: bookClubId, bookId } = useLocalSearchParams();



  const { book, loading: bookLoading, error } = useBookDetails(bookId as string);
  const loadClubBookDetails = async () => {
    const { data, error } = await subabase
      .from("club_books")
      .select("*")
      .eq("book_id", bookId);
  };

  if (!book) {
    return (
      <View>
        <Text> Error Pge, no book</Text>
      </View>
    );
  }

  const users = [];
  return (
    <SafeAreaView>

      <ScrollView>
        <BookDetailCard book={book} />

        {users.map((user) => (


          <View className="flex-row items-center border-b pb-4 mb-4 border-gray-200">
            {user.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500" />
            ) : (
              <View className="w-14 h-14 rounded-full mr-4 bg-gray-300 items-center justify-center">
                <Text className="text-white text-xl font-bold">
                  {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <Text className="text-2xl font-extrabold text-gray-800">{user.displayName}</Text>
          </View>
        ))}



        {bookClubId}
        {bookId}


      </ScrollView>
    </SafeAreaView>
  );
}
