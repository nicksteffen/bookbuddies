import { ClubMemberEntry } from '@/lib/utils/clubs';
import { View, Image, Text } from 'react-native';
import BookTextEntrySection from './BookTextEntrySection';
import StarRating from './StarRating';

interface memberInfoProps {
  user: ClubMemberEntry;
}

export default function MemberNoteInfo({ user }: memberInfoProps) {
  return (
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
      <BookTextEntrySection
        title="Questions"
        textEntries={user.questions || []}
      />
    </View>
  );
}
