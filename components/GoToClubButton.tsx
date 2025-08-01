import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface GoToClubButtonProps {
  clubId: string;
}

export default function GoToClubButton({ clubId }: GoToClubButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/club/${clubId}`)}
      className="flex-row items-center p-2 rounded-lg"
    >
      <ChevronLeft size={20} color="#3B82F6" />
      <Text className="text-blue-500 text-base font-semibold ml-1">
        Club Page
      </Text>
    </TouchableOpacity>
  );
}
