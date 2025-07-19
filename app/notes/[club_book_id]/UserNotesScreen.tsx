import { getGroupedNotesByMember } from '@/lib/utils/notes';
import { GroupedUserNote, UserNote } from '@/types/notes'; // Import UserNote as well
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface UserNotesScreenProps {
  clubBookId: string; // Assuming clubBookId is a UUID string
}

export default function UserNotesScreen({ clubBookId }: UserNotesScreenProps) {
  const [groupedUserNotes, setGroupedUserNotes] = useState<GroupedUserNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      if (!clubBookId) {
        setError("Club Book ID not provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getGroupedNotesByMember(clubBookId);
        setGroupedUserNotes(data);
      } catch (err) {
        console.error("Failed to load user notes:", err);
        setError("Failed to load notes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, [clubBookId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg text-gray-700">Loading notes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-red-50">
        <Text className="text-xl font-bold text-red-700">{error}</Text>
        <Text className="mt-2 text-gray-600">Please check your network connection or try again later.</Text>
      </SafeAreaView>
    );
  }

  if (groupedUserNotes.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-xl font-semibold text-gray-600">No notes found for this book yet.</Text>
        <Text className="mt-2 text-gray-500">Be the first to add one!</Text>
      </SafeAreaView>
    );
  }

  // Helper component to render a single note/question block
  const renderNoteOrQuestionBlock = (item: UserNote) => {
    // Filter out empty notes or questions for cleaner display
    const hasNotes = item.notes && item.notes.trim().length > 0;
    const hasQuestions = item.questions && item.questions.trim().length > 0;

    if (!hasNotes && !hasQuestions) {
      return null; // Don't render if both are empty
    }

    return (
      <View key={item.id} className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Optional: Display timestamp for each individual note/question block */}
        <Text className="text-xs text-gray-500 mb-2 self-end">
          {new Date(item.created_at).toLocaleString()}
        </Text>

        {hasNotes && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Notes:</Text>
            <Text className="text-gray-700 leading-relaxed">{item.notes}</Text>
          </View>
        )}

        {hasQuestions && (
          <View>
            <Text className="text-base font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-2">Questions:</Text>
            <Text className="text-gray-700 leading-relaxed">{item.questions}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <FlatList<GroupedUserNote>
        data={groupedUserNotes}
        keyExtractor={(item) => item.userId}
        renderItem={({ item: userGroup }) => (
          <View className="mb-6 p-4 bg-white rounded-lg shadow-lg mx-4">
            {/* User Info Header */}
            <View className="flex-row items-center border-b pb-4 mb-4 border-gray-200">
              {userGroup.profilePicture ? (
                <Image
                  source={{ uri: userGroup.profilePicture }}
                  className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500"
                />
              ) : (
                <View className="w-14 h-14 rounded-full mr-4 bg-gray-300 items-center justify-center">
                  <Text className="text-white text-xl font-bold">
                    {userGroup.displayName ? userGroup.displayName[0].toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <Text className="text-2xl font-extrabold text-gray-800">{userGroup.displayName}</Text>
            </View>

            {/* Render Notes and Questions for this User */}
            {userGroup.notes.length > 0 ? (
              userGroup.notes.map(renderNoteOrQuestionBlock)
            ) : (
              <Text className="text-gray-500 italic text-center p-4">No notes or questions from this user yet.</Text>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </SafeAreaView>
  );
}